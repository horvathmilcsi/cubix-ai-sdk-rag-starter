import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { embeddings } from '@/lib/db/schema/resources';

const embeddingModel = openai.embedding('text-embedding-3-small');

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

const generateChunksMd = (input: string): string[] => {
  const trimmed = input.trim();
  if (!trimmed) return [];
  
  // Split by markdown headers (#, ##, ###)
  // This regex matches lines starting with 1-3 # characters followed by a space
  const headerRegex = /^(#{1,3})\s+(.+)$/gm;
  const chunks: string[] = [];
  let lastIndex = 0;
  let match;
  
  // Find all header matches
  const matches: Array<{ index: number; level: number; text: string }> = [];
  while ((match = headerRegex.exec(trimmed)) !== null) {
    matches.push({
      index: match.index,
      level: match[1].length,
      text: match[0],
    });
  }
  
  // If no headers found, return the whole input as a single chunk
  if (matches.length === 0) {
    return [trimmed];
  }
  
  // Create chunks from headers
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    // Extract content from current header to next header (or end of string)
    const startIndex = currentMatch.index;
    const endIndex = nextMatch ? nextMatch.index : trimmed.length;
    const chunk = trimmed.substring(startIndex, endIndex).trim();
    
    if (chunk) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
};

export const generateEmbeddings = async (
  value: string,
  chunkingStrategy: '.' | '#' | 'none' = '#',
): Promise<Array<{ embedding: number[]; content: string }>> => {
  let chunks: string[];
  
  if (chunkingStrategy === '.') {
    chunks = generateChunks(value);
  } else if (chunkingStrategy === '#') {
    chunks = generateChunksMd(value);
  } else {
    // 'none' - return the whole content as a single chunk
    chunks = [value.trim()].filter(i => i !== '');
  }
  
  if (chunks.length === 0) {
    chunks = [value.trim()];
  }
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  const similarGuides = await db
    .select({ content: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.3))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  
  if (similarGuides.length === 0) {
    return "No relevant information found in the knowledge base.";
  }
  
  return similarGuides.map(guide => guide.content).join('\n');
};