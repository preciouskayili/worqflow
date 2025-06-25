import { z } from "zod";
import { Types } from "mongoose";
import { tool, RunContext } from "@openai/agents";
import { getDocsService, getDriveService } from "../../lib/googleapis";

export type UserInfo = {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
  userId: string | Types.ObjectId;
};

// --- DOCUMENT MANAGEMENT ---

export const listDocs = tool({
  name: "list_docs",
  description: "List the user's Google Docs documents",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<UserInfo>) {
    const drive = await getDriveService(runContext?.context!);
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: "files(id,name)",
    });
    return res.data;
  },
});

export const searchDocs = tool({
  name: "search_docs",
  description: "Search documents by title keyword",
  parameters: z.object({ query: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const drive = await getDriveService(runContext?.context!);
    const res = await drive.files.list({
      q: `name contains '${args.query}' and mimeType='application/vnd.google-apps.document'`,
      fields: "files(id,name)",
    });
    return res.data;
  },
});

export const createDoc = tool({
  name: "create_doc",
  description: "Create a new Google Doc",
  parameters: z.object({ title: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const docs = await getDocsService(runContext?.context!);
    const res = await docs.documents.create({
      requestBody: { title: args.title },
    });
    return res.data;
  },
});

export const deleteDoc = tool({
  name: "delete_doc",
  description: "Delete a Google Doc",
  parameters: z.object({ fileId: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const drive = await getDriveService(runContext?.context!);
    await drive.files.delete({ fileId: args.fileId });
    return { success: true };
  },
});

export const insertText = tool({
  name: "insert_text",
  description: "Insert text at the beginning of a Google Doc",
  parameters: z.object({ fileId: z.string(), text: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const docs = await getDocsService(runContext?.context!);
    const res = await docs.documents.batchUpdate({
      documentId: args.fileId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: args.text,
            },
          },
        ],
      },
    });
    return res.data;
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const docs = await getDocsService(runContext?.context!);
    const res = await docs.documents.batchUpdate({
      documentId: args.fileId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: { text: args.searchText, matchCase: false },
              replaceText: args.replaceText,
            },
          },
        ],
      },
    });
    return res.data;
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
  async execute(args, runContext?: RunContext<UserInfo>) {
    const drive = await getDriveService(runContext?.context!);
    const res = await drive.permissions.create({
      fileId: args.fileId,
      requestBody: {
        type: "user",
        role: args.role,
        emailAddress: args.email,
      },
      sendNotificationEmail: false,
    });
    return res.data;
  },
});

export const listCollaborators = tool({
  name: "list_collaborators",
  description: "List users who have access to a document",
  parameters: z.object({ fileId: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const drive = await getDriveService(runContext?.context!);
    const res = await drive.permissions.list({ fileId: args.fileId });
    return res.data;
  },
});

export const getLastEdited = tool({
  name: "get_last_edited",
  description: "Get the last modified time of a document",
  parameters: z.object({ fileId: z.string() }),
  async execute(args, runContext?: RunContext<UserInfo>) {
    const drive = await getDriveService(runContext?.context!);
    const res = await drive.files.get({
      fileId: args.fileId,
      fields: "modifiedTime",
    });
    return res.data;
  },
});
