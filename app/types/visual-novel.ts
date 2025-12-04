// Visual Novel Type Definitions

export interface Character {
  id: string;
  name: string;
  displayName: string;
  // Character sprite images for different expressions/poses
  sprites: {
    [expression: string]: string; // e.g., { happy: "/characters/alice-happy.png", sad: "/characters/alice-sad.png" }
  };
  defaultExpression: string;
  // Character position on screen
  position?: "left" | "center" | "right";
  // Character color theme for dialogue name
  nameColor?: string;
  // Default scale for this character (1 = 100%, 0.5 = 50%, 2 = 200%)
  scale?: number;
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  // Optional: conditions to show this choice
  condition?: {
    variable: string;
    operator: "==" | "!=" | ">" | "<" | ">=" | "<=";
    value: string | number | boolean;
  };
  // Optional: set variables when this choice is selected
  setVariables?: {
    [variable: string]: string | number | boolean;
  };
  // Optional: add to numeric variables (increment/decrement)
  addVariables?: {
    [variable: string]: number; // e.g., { relationship_lk: 1 } adds 1 to relationship_lk
  };
}

export interface DialogueNode {
  id: string;
  type: "dialogue" | "choice" | "narration" | "end" | "input" | "llm_input";
  // For dialogue and narration
  characterId?: string; // Who is speaking (undefined for narration)
  speakerName?: string; // Custom speaker name (overrides character displayName, supports {variables})
  expression?: string; // Character expression to display
  text?: string;
  // For choice nodes
  choices?: Choice[];
  // For input nodes - store user's response in this variable
  inputConfig?: {
    variableName: string; // Variable name to store the input
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
    inputType?: "text" | "number" | "email";
    validation?: string; // RegExp pattern as string
    validationMessage?: string;
  };
  // For LLM input nodes - sends user input to Gemini for evaluation
  llmConfig?: {
    userInputVariable: string; // Variable name to store user's input
    // Response variables - LLM returns structured JSON
    characterResponseVariable: string; // Variable to store character's dialogue response
    emotionVariable: string; // Variable to store character's emotion (for sprite changes)
    evaluationVariable: string; // Variable to store evaluation of player's response
    // Allowed emotions for the character
    allowedEmotions?: string[]; // e.g., ["happy", "sad", "angry", "neutral"]
    context: string; // Context/instructions for the LLM on how to respond
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
    // Rating system - LLM rates response as good/neutral/bad, mapped to points
    ratingConfig?: {
      variableToModify: string; // e.g., "relationship_lk"
      goodPoints: number;       // Points for good response (e.g., 20)
      neutralPoints: number;    // Points for neutral response (e.g., 0)
      badPoints: number;        // Points for bad response (e.g., -20)
    };
  };
  // Background to display
  background?: string;
  // Next node (for non-choice nodes)
  nextNodeId?: string;
  // Characters visible in this scene
  visibleCharacters?: {
    characterId: string;
    expression?: string;
    position: "left" | "center" | "right";
    // Override scale for this specific appearance (1 = 100%, 0.5 = 50%, 2 = 200%)
    scale?: number;
    // Horizontal offset in pixels (positive = right, negative = left)
    offsetX?: number;
    // Vertical offset in pixels (positive = up, negative = down)
    offsetY?: number;
  }[];
  // Sound effects or music
  audio?: {
    type: "sfx" | "bgm";
    src: string;
    loop?: boolean;
  };
  // Variables to set when entering this node
  setVariables?: {
    [variable: string]: string | number | boolean;
  };
  // Variables to add to (increment/decrement) when entering this node
  addVariables?: {
    [variable: string]: number; // e.g., { relationship_lk: 1 } adds 1
  };
  // Transition effect
  transition?: "fade" | "slide" | "none";
}

export interface Scene {
  id: string;
  name: string;
  startNodeId: string;
  nodes: DialogueNode[];
}

export interface StoryData {
  title: string;
  author?: string;
  version?: string;
  characters: Character[];
  backgrounds: {
    id: string;
    name: string;
    src: string;
  }[];
  scenes: Scene[];
  startSceneId: string;
  // Global variables that persist across scenes
  variables?: {
    [variable: string]: string | number | boolean;
  };
  // Game settings
  settings?: {
    // Whether to prompt for player name at start
    askForName?: boolean;
    // Customize name input screen
    nameInputTitle?: string;
    nameInputPrompt?: string;
    nameInputPlaceholder?: string;
    nameMinLength?: number;
    nameMaxLength?: number;
    // Default player name if not asking
    defaultPlayerName?: string;
    // Audio settings
    defaultBgm?: string; // Path to default background music
    clickSfx?: string; // Path to click/select sound effect
  };
}

// Feedback entry from LLM interactions
export interface FeedbackEntry {
  nodeId: string;
  sceneId: string;
  userInput: string;
  evaluation: string;
  rating: "good" | "neutral" | "bad";
  context: string; // What situation the player was responding to
}

export interface GameState {
  currentSceneId: string;
  currentNodeId: string;
  variables: {
    [variable: string]: string | number | boolean;
  };
  history: {
    nodeId: string;
    sceneId: string;
    choiceId?: string;
  }[];
  // Player's chosen name
  userName?: string;
  // Whether the game has started (past name input)
  gameStarted?: boolean;
  // Collected feedback from LLM interactions
  feedback?: FeedbackEntry[];
  // Whether to show the feedback summary screen
  showFeedbackScreen?: boolean;
}
