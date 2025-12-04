import { tool, RunContext } from "@openai/agents";
import * as slackAdapters from "../services/adapters/slack";
import { z } from "zod";
import { TIntegrations } from "../../types/integrations";

export const listSlackChannels = tool({
  name: "list_slack_channels",
  description: "List all channels in the Slack workspace",
  parameters: z.object({}),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.listSlackChannels(access_token);
  },
});

export const getChannelInfo = tool({
  name: "get_channel_info",
  description: "Get information about a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.getChannelInfo(args.channelId, access_token);
  },
});

export const getUserInfo = tool({
  name: "get_user_info",
  description: "Get information about a specific user",
  parameters: z.object({
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.getUserInfo(args.userId, access_token);
  },
});

export const getChannelMessages = tool({
  name: "get_channel_messages",
  description: "Get messages from a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.getChannelMessages(args.channelId, access_token);
  },
});

export const sendMessage = tool({
  name: "send_message",
  description: "Send a message to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.sendMessage(
      args.channelId,
      args.message,
      access_token
    );
  },
});

export const scheduleMessage = tool({
  name: "schedule_message",
  description: "Schedule a message to be sent to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    message: z.string(),
    scheduledTime: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.scheduleMessage(
      args.channelId,
      args.message,
      args.scheduledTime,
      access_token
    );
  },
});

export const deleteScheduledMessage = tool({
  name: "delete_scheduled_message",
  description: "Delete a scheduled message",
  parameters: z.object({
    scheduledMessageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.deleteScheduledMessage(
      args.scheduledMessageId,
      access_token
    );
  },
});

export const updateScheduledMessage = tool({
  name: "update_scheduled_message",
  description: "Update a scheduled message",
  parameters: z.object({
    scheduledMessageId: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.updateScheduledMessage(
      args.scheduledMessageId,
      args.message,
      access_token
    );
  },
});

export const getScheduledMessages = tool({
  name: "get_scheduled_messages",
  description: "Get scheduled messages from a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.getScheduledMessages(args.channelId, access_token);
  },
});

export const deleteMessage = tool({
  name: "delete_message",
  description: "Delete a message from a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.deleteMessage(
      args.channelId,
      args.messageId,
      access_token
    );
  },
});

export const sendEphemeralMessage = tool({
  name: "send_ephemeral_message",
  description: "Send an ephemeral message to a specific user",
  parameters: z.object({
    userId: z.string(),
    message: z.string(),
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.sendEphemeralMessage(
      args.userId,
      args.channelId,
      args.message,
      access_token
    );
  },
});

export const updateMessage = tool({
  name: "update_message",
  description: "Update a message in a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
    message: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.updateMessage(
      args.channelId,
      args.messageId,
      args.message,
      access_token
    );
  },
});

export const getPresence = tool({
  name: "get_presence",
  description: "Get the presence of a specific user",
  parameters: z.object({
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.getPresence(args.userId, access_token);
  },
});

export const setStatus = tool({
  name: "set_status",
  description: "Set the status of a specific user",
  parameters: z.object({
    status: z.enum(["auto", "away"]),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.setStatus(args.status, access_token);
  },
});

export const kickFromChannel = tool({
  name: "kick_from_channel",
  description: "Kick a user from a specific channel",
  parameters: z.object({
    channelId: z.string(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.kickFromChannel(
      args.channelId,
      args.userId,
      access_token
    );
  },
});

export const joinChannel = tool({
  name: "join_channel",
  description: "Join a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.joinChannel(args.channelId, access_token);
  },
});

export const leaveChannel = tool({
  name: "leave_channel",
  description: "Leave a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.leaveChannel(args.channelId, access_token);
  },
});

export const inviteToChannel = tool({
  name: "invite_to_channel",
  description: "Invite a user to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    userId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.inviteToChannel(
      args.channelId,
      args.userId,
      access_token
    );
  },
});

export const addReaction = tool({
  name: "add_reaction",
  description: "Add a reaction to a specific message",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
    reaction: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.addReaction(
      args.channelId,
      args.messageId,
      args.reaction,
      access_token
    );
  },
});

export const removeReaction = tool({
  name: "remove_reaction",
  description: "Remove a reaction from a specific message",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
    reaction: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.removeReaction(
      args.channelId,
      args.messageId,
      args.reaction,
      access_token
    );
  },
});

export const unpinMessage = tool({
  name: "unpin_message",
  description: "Unpin a message from a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.unpinMessage(
      args.channelId,
      args.messageId,
      access_token
    );
  },
});

export const pinMessage = tool({
  name: "pin_message",
  description: "Pin a message to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.pinMessage(
      args.channelId,
      args.messageId,
      access_token
    );
  },
});

export const uploadFile = tool({
  name: "upload_file",
  description: "Upload a file to a specific channel",
  parameters: z.object({
    channelId: z.string(),
    file: z.instanceof(File),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.uploadFile(
      args.channelId,
      args.file,
      access_token
    );
  },
});

export const getUnreadMessages = tool({
  name: "get_unread_messages",
  description: "Get unread messages from all joined channels",
  parameters: z.object({}),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.getUnreadMessages(access_token);
  },
});

export const archiveChannel = tool({
  name: "archive_channel",
  description: "Archive a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.archiveChannel(args.channelId, access_token);
  },
});

export const unarchiveChannel = tool({
  name: "unarchive_channel",
  description: "Unarchive a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.unarchiveChannel(args.channelId, access_token);
  },
});

export const getChannelMembers = tool({
  name: "get_channel_members",
  description: "Get members of a specific channel",
  parameters: z.object({
    channelId: z.string(),
  }),
  async execute(args, runContext?: RunContext<TIntegrations>) {
    const access_token = runContext?.context?.["slack"].access_token!;
    return slackAdapters.getChannelMembers(args.channelId, access_token);
  },
});
