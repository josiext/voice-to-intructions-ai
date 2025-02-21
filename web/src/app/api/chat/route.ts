import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    tools: {
      createProject: tool({
        description: "Create a new project",
        parameters: z.object({
          name: z.string().describe("The name of the project"),
        }),
        execute: async ({ name }) => {
          return { name };
        },
      }),
      seeProject: tool({
        description: "See a specific project created",
        parameters: z.object({
          name: z
            .string()
            .describe("The name of the project the user want to see"),
        }),
        execute: async ({ name }) => {
          return { project: name };
        },
      }),
      seeAllProjects: tool({
        description: "See all projects created",
        parameters: z.object({}),
        execute: async () => {
          return { project: "all" };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
