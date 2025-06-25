import axios from "axios";

type ToolContext = {
  userId: string;
  input: string;
};

// Replace with your own user-token fetching logic
async function getUserFigmaToken(userId: string): Promise<string> {
  // e.g., from DB
  return "user-figma-token";
}

export const listRecentFigmaFiles = {
  name: "list_recent_figma_files",
  description: "Lists the user's most recently accessed Figma files.",
  async execute({ userId }: ToolContext) {
    const token = await getUserFigmaToken(userId);

    const res = await axios.get("https://api.figma.com/v1/me/files", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const files = res.data?.files || [];
    if (files.length === 0) return "No recent Figma files found.";

    return files
      .slice(0, 5)
      .map((f: any) => `• ${f.name} — ${f.last_modified}`)
      .join("\n");
  },
};

export const findFigmaFileByName = {
  name: "find_figma_file_by_name",
  description: "Searches for a Figma file by name using keyword(s).",
  async execute({ userId, input }: ToolContext) {
    const token = await getUserFigmaToken(userId);

    const res = await axios.get("https://api.figma.com/v1/me/files", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const files = res.data?.files || [];
    const match = files.find((f: any) =>
      f.name.toLowerCase().includes(input.toLowerCase())
    );

    if (!match) return `No file found matching "${input}".`;

    return `Found: ${match.name} — ${match.last_modified}\nLink: ${match.thumbnail_url}`;
  },
};

export const listCommentsInFigmaFile = {
  name: "list_figma_comments",
  description:
    "Lists all comments in a Figma file given its file key or name keyword.",
  async execute({ userId, input }: ToolContext) {
    const token = await getUserFigmaToken(userId);

    const res = await axios.get("https://api.figma.com/v1/me/files", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const files = res.data?.files || [];
    const file = files.find((f: any) =>
      f.name.toLowerCase().includes(input.toLowerCase())
    );

    if (!file) return `No file found matching "${input}".`;

    const commentsRes = await axios.get(
      `https://api.figma.com/v1/files/${file.key}/comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const comments = commentsRes.data?.comments || [];
    if (comments.length === 0) return `No comments found in "${file.name}".`;

    return comments
      .map(
        (c: any) =>
          `• ${c.user.handle}: ${c.message} (at ${new Date(
            c.created_at
          ).toLocaleString()})`
      )
      .join("\n");
  },
};

export const summarizeFigmaFile = {
  name: "summarize_figma_file",
  description:
    "Summarizes the frames and components inside a Figma file using its name.",
  async execute({ userId, input }: ToolContext) {
    const token = await getUserFigmaToken(userId);

    const res = await axios.get("https://api.figma.com/v1/me/files", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const files = res.data?.files || [];
    const file = files.find((f: any) =>
      f.name.toLowerCase().includes(input.toLowerCase())
    );

    if (!file) return `No file found matching "${input}".`;

    const fileData = await axios.get(
      `https://api.figma.com/v1/files/${file.key}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const pages = fileData.data?.document?.children || [];

    let output: string[] = [];

    for (const page of pages) {
      output.push(`Page: ${page.name}`);
      for (const node of page.children || []) {
        if (node.type === "FRAME" || node.type === "COMPONENT") {
          output.push(`  - ${node.type}: ${node.name}`);
        }
      }
    }

    return output.join("\n");
  },
};
