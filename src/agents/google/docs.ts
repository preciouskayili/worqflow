import { Agent } from "@openai/agents";
import * as docsTools from "../../tools/google/docs";
import { GOOGLE_DOCS_AGENT_PROMPT } from "../../lib/prompts";

const {
  listDocs,
  createDoc,
  deleteDoc,
  insertText,
  replaceText,
  getLastEdited,
  listCollaborators,
  searchDocs,
  shareDoc,
} = docsTools;

export const docsAgent = new Agent({
  name: "docs_agent",
  instructions: GOOGLE_DOCS_AGENT_PROMPT,
  tools: [
    listDocs,
    createDoc,
    deleteDoc,
    insertText,
    replaceText,
    getLastEdited,
    listCollaborators,
    searchDocs,
    shareDoc,
  ],
});
