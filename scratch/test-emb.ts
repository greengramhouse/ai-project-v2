import "dotenv/config";
import { generateEmbedding } from "../lib/ai/gemini";

async function test() {
  const text = "Hello world";
  const embedding = await generateEmbedding(text);
  console.log("Embedding length:", embedding.length);
}

test();
