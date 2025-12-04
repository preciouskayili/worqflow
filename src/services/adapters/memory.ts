import { saveMemory } from "../../lib/vectorestore";

export const createMemory = async (text: string, userId: string) => {
  await saveMemory(text, userId);
  return "Memory created";
};

