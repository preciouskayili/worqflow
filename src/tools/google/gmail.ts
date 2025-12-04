import { tool } from "@openai/agents";
import { z } from "zod";
import * as gmailAdapters from "../../services/adapters/gmail";
import { RunContext } from "@openai/agents";
import { TIntegrations } from "../../../types/integrations";

export const sendEmail = tool({
  name: "send_email",
  description: "Sends an email",
  parameters: z.object({
    to: z.string().describe("Email address of the recipient"),
    subject: z.string().describe("Subject of the email"),
    message: z.string().describe("Plain text content of the email"),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.sendEmail(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listEmails = tool({
  name: "list_emails",
  description: "Lists recent emails",
  parameters: z.object({
    query: z
      .string()
      .default("")
      .describe("Search query (e.g., 'from:someone@example.com')"),
    maxResults: z.number().min(1).max(20).default(5),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.listEmails(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const readEmail = tool({
  name: "read_email",
  description: "Reads a specific email by ID",
  parameters: z.object({
    messageId: z.string().describe("ID of the email to read"),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.readEmail(args.messageId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const createDraft = tool({
  name: "create_draft",
  description: "Creates a draft email",
  parameters: z.object({
    to: z.string(),
    subject: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.createDraft(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listLabels = tool({
  name: "list_labels",
  description: "Lists all labels in the user's Gmail account",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.listLabels({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const addLabelToEmail = tool({
  name: "add_label_to_email",
  description: "Adds a label to an email",
  parameters: z.object({
    messageId: z.string(),
    labelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.addLabelToEmail(
      args.messageId,
      args.labelId,
      {
        access_token: googleIntegration?.access_token!,
        refresh_token: googleIntegration?.refresh_token!,
        expires_at: googleIntegration?.expires_at,
      }
    );
  },
});

export const markAsRead = tool({
  name: "mark_as_read",
  description: "Marks an email as read",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.markAsRead(args.messageId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const archiveEmail = tool({
  name: "archive_email",
  description: "Archives an email (removes it from inbox)",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.archiveEmail(args.messageId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const searchEmails = tool({
  name: "search_emails",
  description: "Searches emails using a query",
  parameters: z.object({
    query: z.string().describe("Search string like 'from:boss subject:report'"),
    maxResults: z.number().min(1).max(20).default(5),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.searchEmails(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listEmailsByDate = tool({
  name: "list_emails_by_date",
  description: "Lists emails received within a specific date range",
  parameters: z.object({
    startDate: z.string().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().describe("End date (YYYY-MM-DD)"),
    maxResults: z.number().min(1).max(50).default(10),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.listEmailsByDate(args, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const getEmailById = tool({
  name: "get_email_by_id",
  description: "Fetches the full content of an email by its ID",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.getEmailById(args.messageId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const getThreadById = tool({
  name: "get_thread_by_id",
  description: "Fetches all messages in an email thread",
  parameters: z.object({
    threadId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.getThreadById(args.threadId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listThreads = tool({
  name: "list_threads",
  description: "Lists recent email threads",
  parameters: z.object({
    maxResults: z.number().min(1).max(50).default(10),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.listThreads(args.maxResults, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const listUnreadEmails = tool({
  name: "list_unread_emails",
  description: "Lists unread emails in the user's Gmail account",
  parameters: z.object({
    maxResults: z.number().min(1).max(20).default(5),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.listUnreadEmails(args.maxResults, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const markAsUnread = tool({
  name: "mark_as_unread",
  description: "Marks an email as unread",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute({ messageId }, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.markAsUnread(messageId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const trashEmail = tool({
  name: "trash_email",
  description: "Moves an email to the trash",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute({ messageId }, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.trashEmail(messageId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const untrashEmail = tool({
  name: "untrash_email",
  description: "Restores a trashed email",
  parameters: z.object({
    messageId: z.string(),
  }),
  async execute({ messageId }, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.untrashEmail(messageId, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const getLabels = tool({
  name: "get_labels",
  description: "Fetches all labels in the user's Gmail account",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.getLabels({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const createLabel = tool({
  name: "create_label",
  description: "Creates a new Gmail label",
  parameters: z.object({
    labelName: z.string(),
  }),
  async execute({ labelName }, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.createLabel(labelName, {
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
  },
});

export const replyToEmail = tool({
  name: "reply_to_email",
  description: "Replies to a specific email with a message",
  parameters: z.object({
    threadId: z.string(),
    to: z.string(),
    subject: z.string(),
    body: z.string(),
    messageId: z.string(),
  }),
  async execute(
    { threadId, to, subject, body, messageId },
    runContext?: RunContext<TIntegrations>
  ) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.replyToEmail(
      { threadId, to, subject, body, messageId },
      {
        access_token: googleIntegration?.access_token!,
        refresh_token: googleIntegration?.refresh_token!,
        expires_at: googleIntegration?.expires_at,
      }
    );
  },
});

export const modifyEmailLabels = tool({
  name: "modify_email_labels",
  description: "Modifies labels on an email (add or remove)",
  parameters: z.object({
    messageId: z.string(),
    addLabelIds: z.array(z.string()).nullable(),
    removeLabelIds: z.array(z.string()).nullable(),
  }),
  async execute(
    { messageId, addLabelIds, removeLabelIds },
    runContext?: RunContext<TIntegrations>
  ) {
    const googleIntegration = runContext?.context?.["google"];
    return gmailAdapters.modifyEmailLabels(
      messageId,
      addLabelIds,
      removeLabelIds,
      {
        access_token: googleIntegration?.access_token!,
        refresh_token: googleIntegration?.refresh_token!,
        expires_at: googleIntegration?.expires_at,
      }
    );
  },
});
