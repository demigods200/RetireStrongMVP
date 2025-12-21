import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import type { RagChunk } from '../types/collections';
import type { SearchQuery, SearchResult } from '../query/search';

const INDEX_NAME = 'retire-strong-rag-index';

export interface VectorStore {
    addChunks(chunks: RagChunk[]): Promise<void>;
    search(query: SearchQuery, embedding: number[]): Promise<SearchResult[]>;
    ensureIndex(): Promise<void>;
    getChunksByMovementIds(movementIds: string[]): Promise<RagChunk[]>;
}

export class OpenSearchVectorStore implements VectorStore {
    private client: Client;

    constructor(endpoint: string) {
        this.client = new Client({
            node: endpoint, // e.g. https://<collection_id>.us-east-1.aoss.amazonaws.com
            ...AwsSigv4Signer({
                region: process.env.AWS_REGION || 'us-east-1',
                service: 'aoss', // Service name for OpenSearch Serverless
                getCredentials: () => defaultProvider()(),
            }),
        });
    }

    async ensureIndex(): Promise<void> {
        const exists = await this.client.indices.exists({ index: INDEX_NAME });

        if (!exists.body) {
            console.log(`Creating index ${INDEX_NAME}...`);
            await this.client.indices.create({
                index: INDEX_NAME,
                body: {
                    settings: {
                        index: {
                            knn: true,
                        },
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            collection: { type: 'keyword' },
                            content: { type: 'text' },
                            sourceTitle: { type: 'text' },
                            topics: { type: 'keyword' },
                            movementIds: { type: 'keyword' },
                            timestampStart: { type: 'float' },
                            timestampEnd: { type: 'float' },
                            embedding: {
                                type: 'knn_vector',
                                dimension: 1024,
                                method: {
                                    name: 'hnsw',
                                    engine: 'nmslib',
                                },
                            },
                        },
                    },
                },
            });
            console.log(`Index ${INDEX_NAME} created.`);
        }
    }

    async addChunks(chunks: RagChunk[]): Promise<void> {
        if (chunks.length === 0) return;

        // Bulk API format: [ { index: ... }, document, { index: ... }, document ]
        const body = chunks.flatMap(chunk => [
            { index: { _index: INDEX_NAME, _id: chunk.id } },
            { ...chunk, embedding: chunk.embedding }
        ]);

        const response = await this.client.bulk({ body });

        if (response.body.errors) {
            console.error('Bulk indexing errors:', JSON.stringify(response.body.items, null, 2));
            throw new Error('Failed to index some chunks');
        }

        console.log(`Indexed ${chunks.length} chunks.`);
    }

    async search(query: SearchQuery, embedding: number[]): Promise<SearchResult[]> {
        const {
            collection,
            topics,
            movementIds,
            limit = 5,
            minSimilarity = 0.0,
        } = query;

        const filter: any[] = [];

        if (collection) {
            filter.push({ term: { collection } });
        }

        if (topics && topics.length > 0) {
            filter.push({ terms: { topics } });
        }

        if (movementIds && movementIds.length > 0) {
            filter.push({ terms: { movementIds } });
        }

        const searchBody = {
            size: limit,
            query: {
                knn: {
                    embedding: {
                        vector: embedding,
                        k: limit,
                        filter: filter.length > 0 ? { bool: { filter } } : undefined,
                    },
                },
            },
            _source: ['id', 'collection', 'content', 'sourceTitle', 'topics', 'movementIds', 'timestampStart', 'timestampEnd'],
        };

        const response = await this.client.search({
            index: INDEX_NAME,
            body: searchBody,
        });

        const hits = response.body.hits.hits;

        return hits
            .map((hit: any) => ({
                chunk: {
                    id: hit._id,
                    ...hit._source,
                } as RagChunk,
                score: hit._score,
            }))
            .filter((result: any) => result.score >= minSimilarity);
    }

    async getChunksByMovementIds(movementIds: string[]): Promise<RagChunk[]> {
        if (movementIds.length === 0) return [];

        const response = await this.client.search({
            index: INDEX_NAME,
            body: {
                size: 50,
                query: {
                    terms: { movementIds }
                },
                _source: ['id', 'collection', 'content', 'sourceTitle', 'topics', 'movementIds', 'timestampStart', 'timestampEnd'],
            },
        });

        const hits = response.body.hits.hits;

        return hits.map((hit: any) => ({
            id: hit._id,
            ...hit._source,
        } as RagChunk));
    }
}
