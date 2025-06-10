import { getEmbedding, saveMemory } from "./vectorestore";
import { pc } from "./vectorestore";
import { env } from "../config/env";

const INDEX_NAME = env.PINECONE_INDEX_NAME;

export async function fetchMemories(text: string, userId: string, limit = 5) {
  const index = pc.index(INDEX_NAME);

  const embedding = await getEmbedding(text);

  const query = await index.query({
    vector: embedding,
    topK: limit,
    filter: { user_id: { $eq: userId } },
    includeMetadata: true,
  });

  return query.matches;
}
