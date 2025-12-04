import { z } from "zod";
import { tool, RunContext } from "@openai/agents";
import * as docsAdapters from "../../services/adapters/docs";
import { TIntegrations } from "../../../types/integrations";

// --- DOCUMENT MANAGEMENT ---

export const listDocs = tool({
  name: "list_docs",
  description: "List the user's Google Docs documents",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.listDocs({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const searchDocs = tool({
  name: "search_docs",
  description: "Search documents by title keyword",
  parameters: z.object({ query: z.string() }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.searchDocs(args.query, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const createDoc = tool({
  name: "create_doc",
  description: "Create a new Google Doc",
  parameters: z.object({ title: z.string() }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.createDoc(args.title, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const deleteDoc = tool({
  name: "delete_doc",
  description: "Delete a Google Doc",
  parameters: z.object({ fileId: z.string() }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.deleteDoc(args.fileId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const insertText = tool({
  name: "insert_text",
  description: "Insert text at the beginning of a Google Doc",
  parameters: z.object({ fileId: z.string(), text: z.string() }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.insertText(args.fileId, args.text, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const replaceText = tool({
  name: "replace_text",
  description: "Replace matching text in a Google Doc",
  parameters: z.object({
    fileId: z.string(),
    searchText: z.string(),
    replaceText: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.replaceText(
      args.fileId,
      args.searchText,
      args.replaceText,
      {
        access_token: googleIntegration?.access_token!,
        refresh_token: googleIntegration?.refresh_token!,
        expires_at: googleIntegration?.expires_at,
      }
    );
  },
});

export const shareDoc = tool({
  name: "share_doc",
  description: "Share a document with an email address",
  parameters: z.object({
    fileId: z.string(),
    email: z.string(),
    role: z.enum(["reader", "writer", "commenter"]).default("writer"),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.shareDoc(
      args.fileId,
      args.email,
      args.role,
      {
        access_token: googleIntegration?.access_token!,
        refresh_token: googleIntegration?.refresh_token!,
        expires_at: googleIntegration?.expires_at,
      }
    );
  },
});

export const listCollaborators = tool({
  name: "list_collaborators",
  description: "List users who have access to a document",
  parameters: z.object({ fileId: z.string() }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.listCollaborators(args.fileId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const getLastEdited = tool({
  name: "get_last_edited",
  description: "Get the last modified time of a document",
  parameters: z.object({ fileId: z.string() }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return docsAdapters.getLastEdited(args.fileId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});
