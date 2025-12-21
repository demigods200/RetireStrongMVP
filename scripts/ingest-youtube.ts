
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { EmbeddingGenerator } from '../packages/content-rag/src/pipeline/embeddings';
import type { RagChunk } from '../packages/content-rag/src/types/collections';

import { YoutubeTranscript } from 'youtube-transcript';

// Configuration
const MANIFEST_PATH = join(__dirname, '../content/manifest/youtube_videos_list.md');
const OUTPUT_PATH = join(__dirname, '../content/seed/youtube_content.json');
const CHUNK_SIZE_SECONDS = 90;

// Helper to clean text (Step 3)
function cleanText(text: string): string {
    return text
        .replace(/\[.*?\]/g, '') // Remove [Music], [Applause]
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();
}

// Helper to extract Video IDs from Manifest (Step 1)
function parseManifest(manifestContent: string): { id: string; title: string }[] {
    const videos: { id: string; title: string }[] = [];
    const regex = /\[\*\*(.*?)\*\*\]\(https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;

    let match;
    while ((match = regex.exec(manifestContent)) !== null) {
        if (match[1] && match[2]) {
            videos.push({ title: match[1], id: match[2] });
        }
    }
    return videos;
}

// Metadata Tagging Heuristics (Step 5 - "Creative" simple version)
function generateMetadata(text: string, title: string) {
    const lowerText = (text + ' ' + title).toLowerCase();

    const tags = {
        movement_type: 'general',
        anatomical_focus: [] as string[],
        difficulty: 'beginner', // Default safe assumption
    };

    if (lowerText.includes('balance')) tags.movement_type = 'balance';
    if (lowerText.includes('strength') || lowerText.includes('muscle')) tags.movement_type = 'strength';
    if (lowerText.includes('stretch') || lowerText.includes('mobility')) tags.movement_type = 'mobility';

    if (lowerText.includes('knee')) tags.anatomical_focus.push('knees');
    if (lowerText.includes('hip')) tags.anatomical_focus.push('hips');
    if (lowerText.includes('shoulder')) tags.anatomical_focus.push('shoulders');
    if (lowerText.includes('back')) tags.anatomical_focus.push('back');

    return tags;
}

async function main() {
    console.log('🎥 Starting YouTube Ingestion Pipeline...');

    if (!existsSync(MANIFEST_PATH)) {
        console.error('❌ Manifest not found:', MANIFEST_PATH);
        return;
    }

    const manifest = readFileSync(MANIFEST_PATH, 'utf-8');
    const videos = parseManifest(manifest);
    console.log(`📋 Found ${videos.length} videos in manifest.`);

    const embeddingGenerator = new EmbeddingGenerator();
    const chunks: RagChunk[] = [];

    // Process a subset for MVP safety/speed
    const videosToProcess = videos.slice(0, 5);

    for (let i = 0; i < videosToProcess.length; i++) {
        const video = videosToProcess[i];
        console.log(`\n▶️ [${i + 1}/${videosToProcess.length}] Processing: ${video.title} (${video.id})`);

        try {
            const transcripts = await YoutubeTranscript.fetchTranscript(video.id);

            // Group into chunks by time
            let currentChunkText = '';
            let startTime = 0;
            let chunkCount = 0;

            for (const t of transcripts) {
                currentChunkText += ' ' + t.text;

                // If chunk is long enough (approximate via text length ~ 150 words/min)
                // 90 seconds ~ 225 words ~ 1200 chars
                if (currentChunkText.length > 500) {
                    const cleanedText = cleanText(currentChunkText);
                    const metadata = generateMetadata(cleanedText, video.title);

                    const chunk: RagChunk = {
                        id: `yt-${video.id}-${chunkCount}`,
                        collection: 'youtube_content' as any, // Cast to any to avoid old type issue if not reloaded
                        content: cleanedText,
                        sourceTitle: video.title,
                        topics: [...metadata.anatomical_focus, metadata.movement_type],
                        // Minimal embedding placeholder until we run generate-rag-embeddings
                        // But wait, the plan said Generate NOW.
                        embedding: [],
                    };

                    // Generate Embedding (Step 6)
                    process.stdout.write(`   ⚡ Embedding chunk ${chunkCount}... `);
                    chunk.embedding = await embeddingGenerator.generateEmbedding(cleanedText);
                    process.stdout.write('Done.\n');

                    chunks.push(chunk);
                    currentChunkText = ''; // Reset (overlap logic omitted for simplicity of MVP)
                    chunkCount++;
                }
            }

        } catch (e: any) {
            console.warn(`   ⚠️ Could not fetch transcript: ${e.message}`);
        }
    }

    console.log(`\n💾 Saving ${chunks.length} chunks to ${OUTPUT_PATH}...`);
    writeFileSync(OUTPUT_PATH, JSON.stringify(chunks, null, 2));
    console.log('✅ Ingestion Complete!');
}

main().catch(console.error);
