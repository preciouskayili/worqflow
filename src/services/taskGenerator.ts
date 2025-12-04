import openai from "../lib/openai";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime?: string;
  source: string;
  dueDate?: string;
  metadata?: any;
}

export interface TaskGenerationContext {
  emails: any[];
  calendarEvents: any[];
  slackMessages: any[];
  linearIssues: any[];
  githubNotifications: any[];
  githubIssues: any[];
  githubPRs: any[];
}

export async function generateTasksFromContext(
  context: TaskGenerationContext,
  userName: string
): Promise<Task[]> {
  const prompt = `You are a productivity assistant helping ${userName} organize their day. 

Based on the following data from their integrations, generate a prioritized list of tasks for today. Consider:
- Urgent emails that need responses
- Calendar events that require preparation
- Important Slack messages/mentions
- Linear issues assigned to them
- GitHub PRs that need review
- GitHub issues that need attention

Return a JSON array of tasks. Each task should have:
- id: a unique identifier (use "task-{index}")
- title: a clear, actionable task title (max 60 chars)
- description: a brief description of what needs to be done (max 150 chars)
- priority: "high", "medium", or "low"
- estimatedTime: estimated time to complete (e.g., "15 min", "1 hour", "30 min")
- source: where this task came from (gmail, calendar, slack, linear, github)
- dueDate: ISO date if there's a deadline
- metadata: relevant info like email ID, issue ID, etc.

Focus on actionable items that can be completed today. Don't create tasks for things that are just informational.

Context data:
${JSON.stringify(context, null, 2)}

Return ONLY a valid JSON array, no other text. Maximum 10 tasks.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful productivity assistant. Always return valid JSON arrays only. Never include markdown code blocks.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return [];

    // Try to parse JSON
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return parsed.tasks;
      }
      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    } catch {
      // Try to extract JSON array
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return [];
  } catch (error) {
    console.error("Error generating tasks:", error);
    return [];
  }
}

