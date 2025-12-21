import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { EmbeddingGenerator } from '../packages/content-rag/src/pipeline/embeddings';
import type { RagChunk } from '../packages/content-rag/src/types/collections';
import { YoutubeTranscript } from 'youtube-transcript';

// Config
const MANIFEST_PATH = join(__dirname, '../content/manifest/youtube_videos_list.md');
const OUTPUT_PATH = join(__dirname, '../content/seed/youtube_content.json');

// Lower threshold so chunks actually get created
const CHUNK_CHAR_THRESHOLD = 150;

// -----------------------------
// Helpers
// -----------------------------
function cleanText(text: string): string {
    return text
        .replace(/\[.*?\]/g, '') // [Music], [Applause]
        .replace(/\s+/g, ' ')
        .trim();
}

function parseManifest(manifestContent: string): { id: string; title: string }[] {
    const videos = [];
    const regex = /\[\*\*(.*?)\*\*\]\(https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;

    let match;
    while ((match = regex.exec(manifestContent)) !== null) {
        videos.push({ title: match[1], id: match[2] });
    }
    return videos;
}

function generateMetadata(text: string, title: string) {
    const lower = (text + ' ' + title).toLowerCase();

    const tags = {
        movement_type: 'general',
        anatomical_focus: [] as string[],
        difficulty: 'beginner'
    };

    if (lower.includes('balance')) tags.movement_type = 'balance';
    if (lower.includes('strength') || lower.includes('muscle')) tags.movement_type = 'strength';
    if (lower.includes('stretch') || lower.includes('mobility')) tags.movement_type = 'mobility';

    if (lower.includes('knee')) tags.anatomical_focus.push('knees');
    if (lower.includes('hip')) tags.anatomical_focus.push('hips');
    if (lower.includes('shoulder')) tags.anatomical_focus.push('shoulders');
    if (lower.includes('back')) tags.anatomical_focus.push('back');

    return tags;
}

// -----------------------------
// MAIN
// -----------------------------
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

    // Process ALL videos now (no more limit)
    for (let i = 0; i < videos.length && i < 20; i++) {
        const video = videos[i];
        console.log(`\n▶️ [${i + 1}/${videos.length}] Processing: ${video.title} (${video.id})`);

        try {
            const transcript = await YoutubeTranscript.fetchTranscript(video.id);

            console.log(`   📝 Transcript lines: ${transcript.length}`);

            if (!transcript.length) {
                console.warn(`   ⚠️ Empty transcript, skipping.`);
                continue;
            }

            let buffer = '';
            let chunkCount = 0;

            // -----------------------------
            // Chunking loop
            // -----------------------------
            for (const t of transcript) {
                buffer += ' ' + t.text;

                if (buffer.trim().length >= CHUNK_CHAR_THRESHOLD) {
                    const cleaned = cleanText(buffer);
                    const metadata = generateMetadata(cleaned, video.title);

                    const chunk: RagChunk = {
                        id: `yt-${video.id}-${chunkCount}`,
                        collection: 'youtube_content' as any,
                        content: cleaned,
                        sourceTitle: video.title,
                        topics: [...metadata.anatomical_focus, metadata.movement_type],
                        embedding: []
                    };

                    process.stdout.write(`   ⚡ Embedding chunk ${chunkCount}... `);
                    chunk.embedding = await embeddingGenerator.generateEmbedding(cleaned);
                    process.stdout.write('Done.\n');

                    chunks.push(chunk);
                    buffer = ''; // reset
                    chunkCount++;
                }
            }

            // -----------------------------
            // SAVE FINAL LEFTOVER CHUNK
            // -----------------------------
            if (buffer.trim().length > 40) {
                const cleaned = cleanText(buffer);
                const metadata = generateMetadata(cleaned, video.title);

                const chunk: RagChunk = {
                    id: `yt-${video.id}-final`,
                    collection: 'youtube_content' as any,
                    content: cleaned,
                    sourceTitle: video.title,
                    topics: [...metadata.anatomical_focus, metadata.movement_type],
                    embedding: []
                };

                process.stdout.write(`   ⚡ Embedding final chunk... `);
                chunk.embedding = await embeddingGenerator.generateEmbedding(cleaned);
                process.stdout.write('Done.\n');

                chunks.push(chunk);
            }

            console.log(`   ✅ Total chunks for video: ${chunkCount + 1}`);

        } catch (err: any) {
            console.warn(`   ⚠️ Could not fetch transcript: ${err.message}`);
        }
    }

    console.log(`\n💾 Saving ${chunks.length} chunks to ${OUTPUT_PATH}...`);
    writeFileSync(OUTPUT_PATH, JSON.stringify(chunks, null, 2));
    console.log('✨ Ingestion Complete!');
}

main().catch(console.error);
