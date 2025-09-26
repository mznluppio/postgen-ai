export type PromptBrief = {
  id: string;
  title: string;
  description: string;
  tone: "professional" | "friendly" | "inspiring" | "casual";
  instructions: string;
};

import prompts from "@/data/prompts.json";

export const PROMPT_LIBRARY: PromptBrief[] = prompts satisfies PromptBrief[];

export function getPromptById(id: string | null | undefined): PromptBrief | undefined {
  if (!id) return undefined;
  return PROMPT_LIBRARY.find((prompt) => prompt.id === id);
}

export function filterPrompts({
  query,
  tone,
}: {
  query?: string;
  tone?: PromptBrief["tone"] | "all";
}): PromptBrief[] {
  const normalizedQuery = query?.trim().toLowerCase();
  return PROMPT_LIBRARY.filter((prompt) => {
    const matchesTone = tone && tone !== "all" ? prompt.tone === tone : true;
    const matchesQuery = normalizedQuery
      ? [prompt.title, prompt.description, prompt.instructions]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    return matchesTone && matchesQuery;
  });
}
