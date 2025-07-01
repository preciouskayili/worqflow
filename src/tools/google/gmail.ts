import { tool } from "@openai/agents";
import { z } from "zod";
import { getGmailService } from "../../lib/googleapis";
import { RunContext } from "@openai/agents";
import { encode } from "../../lib/misc";
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const raw = Buffer.from(
      `To: ${args.to}\r\n` +
        `Subject: ${args.subject}\r\n\r\n` +
        `${args.message}`
    ).toString("base64url");

    const res = await service.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return res.data;
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
    console.log("Listing emails started", args, runContext);
    const googleIntegration = runContext?.context?.["google"];
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Listing emails", googleIntegration, service);

    const res = await service.users.messages.list({
      userId: "me",
      q: args.query,
      maxResults: args.maxResults,
    });

    const messages = res.data.messages || [];

    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        const full = await service.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "From"],
        });
        return {
          id: msg.id,
          snippet: full.data.snippet,
          headers: full.data.payload?.headers,
        };
      })
    );

    return detailedMessages;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    const res = await service.users.messages.get({
      userId: "me",
      id: args.messageId,
      format: "full",
    });
    console.log("Reading email", res, googleIntegration, service);
    return {
      id: res.data.id,
      snippet: res.data.snippet,
      payload: res.data.payload,
    };
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
    console.log("Creating draft", googleIntegration, service);

    const raw = Buffer.from(
      `To: ${args.to}\r\n` +
        `Subject: ${args.subject}\r\n\r\n` +
        `${args.message}`
    ).toString("base64url");

    const res = await service.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw,
        },
      },
    });

    return res.data;
  },
});

export const listLabels = tool({
  name: "list_labels",
  description: "Lists all labels in the user's Gmail account",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Listing labels", googleIntegration, service);

    const res = await service.users.labels.list({
      userId: "me",
    });

    return res.data.labels;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Adding label to email", googleIntegration, service);

    const res = await service.users.messages.modify({
      userId: "me",
      id: args.messageId,
      requestBody: {
        addLabelIds: [args.labelId],
      },
    });

    return res.data;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
    console.log("Marking as read", googleIntegration, service);
    const res = await service.users.messages.modify({
      userId: "me",
      id: args.messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
    return res.data;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });
    console.log("Archiving email", googleIntegration, service);
    const res = await service.users.messages.modify({
      userId: "me",
      id: args.messageId,
      requestBody: {
        removeLabelIds: ["INBOX"],
      },
    });
    return res.data;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Searching emails", googleIntegration, service);

    const res = await service.users.messages.list({
      userId: "me",
      q: args.query,
      maxResults: args.maxResults,
    });

    const messages = res.data.messages || [];

    const detailed = await Promise.all(
      messages.map(async (msg) => {
        const full = await service.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "From"],
        });
        return {
          id: msg.id,
          snippet: full.data.snippet,
          headers: full.data.payload?.headers,
        };
      })
    );

    return detailed;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Listing emails by date", googleIntegration, service);

    const query = `after:${args.startDate} before:${args.endDate}`;
    const res = await service.users.messages.list({
      userId: "me",
      q: query,
      maxResults: args.maxResults,
    });

    return res.data.messages || [];
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Getting email by id", googleIntegration, service);

    const res = await service.users.messages.get({
      userId: "me",
      id: args.messageId,
      format: "full",
    });

    return res.data;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Getting thread by id", googleIntegration, service);

    const thread = await service.users.threads.get({
      userId: "me",
      id: args.threadId,
    });

    return thread.data;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Listing threads", googleIntegration, service);

    const res = await service.users.threads.list({
      userId: "me",
      maxResults: args.maxResults,
    });

    return res.data.threads || [];
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Marking as unread", googleIntegration, service);

    await service.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["LABEL_READ"],
      },
    });
    return { success: true };
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Trashing email", googleIntegration, service);

    await service.users.messages.trash({
      userId: "me",
      id: messageId,
    });
    return { success: true };
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Untrashing email", googleIntegration, service);

    await service.users.messages.untrash({
      userId: "me",
      id: messageId,
    });
    return { success: true };
  },
});

export const getLabels = tool({
  name: "get_labels",
  description: "Fetches all labels in the user's Gmail account",
  parameters: z.object({}),
  async execute(_, runContext?: RunContext<TIntegrations>) {
    const googleIntegration = runContext?.context?.["google"];
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Getting labels", googleIntegration, service);

    const res = await service.users.labels.list({ userId: "me" });
    return res.data.labels || [];
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Creating label", googleIntegration, service);

    const res = await service.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    return res.data;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Replying to email", googleIntegration, service);

    const rawMessage = encode({
      to,
      subject,
      body,
      inReplyTo: messageId,
    });

    const res = await service.users.messages.send({
      userId: "me",
      requestBody: {
        threadId,
        raw: rawMessage,
      },
    });

    return res.data;
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
    const service = await getGmailService({
      access_token: googleIntegration?.access_token!,
      refresh_token: googleIntegration?.refresh_token!,
      expires_at: googleIntegration?.expires_at,
    });

    console.log("Modifying email labels", googleIntegration, service);

    await service.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: addLabelIds || [],
        removeLabelIds: removeLabelIds || [],
      },
    });
    return { success: true };
  },
});
