import { StoryData } from "../types/visual-novel";

/**
 * Story Builder Utility
 * 
 * Use this to create your own custom stories with a more structured approach.
 * This file provides helper functions to make story creation easier.
 */

// Helper to create a character
export function createCharacter(
  id: string,
  displayName: string,
  sprites: { [expression: string]: string },
  options?: {
    defaultExpression?: string;
    nameColor?: string;
  }
) {
  return {
    id,
    name: id,
    displayName,
    sprites,
    defaultExpression: options?.defaultExpression || "neutral",
    nameColor: options?.nameColor || "#ffffff",
  };
}

// Helper to create a background
export function createBackground(id: string, name: string, src: string) {
  return { id, name, src };
}

// Helper to create a dialogue node
export function createDialogue(
  id: string,
  characterId: string,
  text: string,
  nextNodeId: string,
  options?: {
    expression?: string;
    background?: string;
    visibleCharacters?: {
      characterId: string;
      expression?: string;
      position: "left" | "center" | "right";
    }[];
    transition?: "fade" | "slide" | "none";
    setVariables?: { [key: string]: string | number | boolean };
  }
) {
  return {
    id,
    type: "dialogue" as const,
    characterId,
    text,
    nextNodeId,
    ...options,
  };
}

// Helper to create a narration node
export function createNarration(
  id: string,
  text: string,
  nextNodeId: string,
  options?: {
    background?: string;
    transition?: "fade" | "slide" | "none";
    setVariables?: { [key: string]: string | number | boolean };
  }
) {
  return {
    id,
    type: "narration" as const,
    text,
    nextNodeId,
    ...options,
  };
}

// Helper to create a choice node
export function createChoice(
  id: string,
  prompt: string,
  choices: {
    id: string;
    text: string;
    nextNodeId: string;
    setVariables?: { [key: string]: string | number | boolean };
    condition?: {
      variable: string;
      operator: "==" | "!=" | ">" | "<" | ">=" | "<=";
      value: string | number | boolean;
    };
  }[],
  options?: {
    background?: string;
    visibleCharacters?: {
      characterId: string;
      expression?: string;
      position: "left" | "center" | "right";
    }[];
  }
) {
  return {
    id,
    type: "choice" as const,
    text: prompt,
    choices,
    ...options,
  };
}

// Helper to create an end node
export function createEnd(id: string, text?: string) {
  return {
    id,
    type: "end" as const,
    text: text || "The End",
  };
}

// Helper to create a scene
export function createScene(
  id: string,
  name: string,
  startNodeId: string,
  nodes: ReturnType<
    | typeof createDialogue
    | typeof createNarration
    | typeof createChoice
    | typeof createEnd
  >[]
) {
  return {
    id,
    name,
    startNodeId,
    nodes,
  };
}

// Helper to create a complete story
export function createStory(config: {
  title: string;
  author?: string;
  version?: string;
  characters: ReturnType<typeof createCharacter>[];
  backgrounds: ReturnType<typeof createBackground>[];
  scenes: ReturnType<typeof createScene>[];
  startSceneId: string;
  variables?: { [key: string]: string | number | boolean };
}): StoryData {
  return config;
}

// ====================
// EXAMPLE USAGE
// ====================

/*
// Create a simple story using the helper functions:

const myStory = createStory({
  title: "My First Visual Novel",
  author: "Your Name",
  
  characters: [
    createCharacter("player", "You", {
      neutral: "/characters/player-neutral.png",
    }),
    createCharacter("npc", "Mysterious Stranger", {
      neutral: "/characters/npc-neutral.png",
      happy: "/characters/npc-happy.png",
    }, { nameColor: "#9C27B0" }),
  ],
  
  backgrounds: [
    createBackground("street", "City Street", "/backgrounds/street.jpg"),
  ],
  
  scenes: [
    createScene("intro", "Introduction", "start", [
      createNarration("start", "You find yourself on a quiet street...", "meet_npc", {
        background: "street",
        transition: "fade",
      }),
      createDialogue("meet_npc", "npc", "Hello there!", "first_choice", {
        visibleCharacters: [
          { characterId: "npc", expression: "neutral", position: "center" }
        ]
      }),
      createChoice("first_choice", "How do you respond?", [
        { id: "friendly", text: "Hello!", nextNodeId: "friendly_response" },
        { id: "cautious", text: "Who are you?", nextNodeId: "cautious_response" },
      ]),
      createDialogue("friendly_response", "npc", "What a pleasant greeting!", "end", {
        expression: "happy"
      }),
      createDialogue("cautious_response", "npc", "Just a traveler, like yourself.", "end"),
      createEnd("end", "To be continued..."),
    ]),
  ],
  
  startSceneId: "intro",
  variables: {
    reputation: 0,
  },
});

export { myStory };
*/
