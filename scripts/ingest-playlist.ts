import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { EmbeddingGenerator } from '../packages/content-rag/src/pipeline/embeddings';
import { OpenSearchVectorStore } from '../packages/content-rag/src/store/vector-store';
import type { RagChunk } from '../packages/content-rag/src/types/collections';

dotenv.config({ path: '.env.local' });

// Configuration
const PLAYLIST_URL = process.argv[2];
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT;
const TEMP_DIR = join(__dirname, '../temp_audio');

if (!PLAYLIST_URL) {
    console.error('Usage: npx tsx scripts/ingest-playlist.ts <PLAYLIST_URL>');
    process.exit(1);
}

if (!OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in environment.');
    process.exit(1);
}

if (!OPENSEARCH_ENDPOINT) {
    console.error('Missing OPENSEARCH_ENDPOINT. Cannot index to AWS.');
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const embeddingGenerator = new EmbeddingGenerator(); // Uses Bedrock Titan V2
const vectorStore = new OpenSearchVectorStore(OPENSEARCH_ENDPOINT);

// Ensure temp dir
if (!existsSync(TEMP_DIR)) {
    execSync(`mkdir -p "${TEMP_DIR}"`);
}

// ---------------------------------------------------------
// Step 1: Extract Playlist Metadata (yt-dlp)
// ---------------------------------------------------------
function getPlaylistVideos(url: string) {
    console.log(`📋 Fetching playlist metadata from: ${url}`);
    try {
        // --flat-playlist: don't download, just list
        // -J: Dump JSON
        const output = execSync(`yt-dlp --flat-playlist -J "${url}"`, { maxBuffer: 1024 * 1024 * 10 }).toString();
        const data = JSON.parse(output);

        // Playlist response (entries array)
        if (data.entries) {
            return data.entries.map((entry: any) => ({
                id: entry.id,
                title: entry.title,
                url: `https://www.youtube.com/watch?v=${entry.id}`,
                duration: entry.duration,
            }));
        }

        // Single video response (yt-dlp -J on a single video)
        if (data.id) {
            return [{
                id: data.id,
                title: data.title || data.id,
                url: data.webpage_url || `https://www.youtube.com/watch?v=${data.id}`,
                duration: data.duration,
            }];
        }

        return [];
    } catch (e: any) {
        console.error('Failed to fetch playlist:', e.message);
        return [];
    }
}

// ---------------------------------------------------------
// Step 2: Download Audio & Transcribe (Whisper)
// ---------------------------------------------------------
async function processVideo(video: { id: string; title: string; url: string }) {
    const audioPath = join(TEMP_DIR, `${video.id}.mp3`);

    console.log(`\n▶️ Processing: ${video.title} (${video.id})`);

    // A. Download Audio
    if (!existsSync(audioPath)) {
        console.log(`   ⬇️ Downloading audio...`);
        try {
            // -x: extract audio
            // --audio-format mp3
            // -o: output template
            execSync(`yt-dlp -x --audio-format mp3 -o "${join(TEMP_DIR, video.id)}.%(ext)s" "${video.url}"`, { stdio: 'ignore' });
        } catch (e) {
            console.error(`   ❌ Download failed for ${video.id}`);
            return null;
        }
    }

    // B. Transcribe with Whisper
    console.log(`   🎙️ Transcribing with Whisper...`);
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: deleteFileAfterRead(audioPath), // Helper to stream fs.createReadStream
            model: "whisper-1",
            response_format: "verbose_json", // Get segments/timestamps
            timestamp_granularities: ["segment"]
        });

        return transcription;
    } catch (e: any) {
        console.error(`   ❌ Transcription failed: ${e.message}`);
        return null;
    }
}

// Helper to handle file stream for OpenAI
function deleteFileAfterRead(path: string) {
    const fs = require('fs');
    return fs.createReadStream(path);
    // Cleanup usually happens after, but for simplicity we rely on manual cleanup or script end
}

// ---------------------------------------------------------
// Step 3: Chunking & Indexing
// ---------------------------------------------------------
const MAX_VIDEOS = parseInt(process.argv[3] || process.env.INGEST_MAX || '0');

async function ingest() {
    await vectorStore.ensureIndex();

    let videos = getPlaylistVideos(PLAYLIST_URL);
    if (MAX_VIDEOS && MAX_VIDEOS > 0) videos = videos.slice(0, MAX_VIDEOS);
    console.log(`Found ${videos.length} videos.`);

    for (const video of videos) {
        // Check if already indexed? (Skipped for naive implementation)

        const transcript: any = await processVideo(video);
        if (!transcript) continue;

        // Chunking Strategy (Token-ish based, or segment accumulation)
        // Whisper returns segments with start/end time.
        // We aggregate segments until ~1000 chars (~250 tokens) then flush.

        let currentChunk = "";
        let startTime = 0;
        let endTime = 0;
        const chunks: RagChunk[] = [];
        let chunkIndex = 0;

        if (transcript.segments) {
            for (const segment of transcript.segments) {
                if (currentChunk.length === 0) startTime = segment.start;

                currentChunk += segment.text + " ";
                endTime = segment.end;

                if (currentChunk.length > 1000) {
                    chunks.push(await createChunk(video, currentChunk, startTime, endTime, chunkIndex++));
                    currentChunk = "";
                }
            }
            // Final chunk
            if (currentChunk.length > 0) {
                chunks.push(await createChunk(video, currentChunk, startTime, endTime, chunkIndex++));
            }
        } else {
            // Fallback if no segments
            chunks.push(await createChunk(video, transcript.text, 0, 0, 0));
        }

        // Push to Vector Store
        if (chunks.length > 0) {
            console.log(`   💾 Indexing ${chunks.length} chunks...`);
            await vectorStore.addChunks(chunks);
        }

        // Clean up audio file
        try { unlinkSync(join(TEMP_DIR, `${video.id}.mp3`)); } catch (e) { }
    }
}

async function createChunk(video: any, text: string, start: number, end: number, index: number): Promise<RagChunk> {
    const cleaned = text.trim();
    // Generate Embedding (Bedrock)
    const embedding = await embeddingGenerator.generateEmbedding(cleaned);

    return {
        id: `yt-${video.id}-${index}`,
        collection: 'youtube_content' as any,
        content: cleaned,
        sourceTitle: video.title,
        topics: ['youtube', 'whisper'], // Tag as whisper
        timestampStart: start,
        timestampEnd: end,
        embedding: embedding,
        // Extras
        movementIds: [],
    };
}

ingest().catch(console.error);
