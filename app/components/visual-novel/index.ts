// Visual Novel Components - Export all components from a single file

export { default as VisualNovelEngine } from "./VisualNovelEngine";
export { default as Background } from "./Background";
export { default as CharacterSprite } from "./CharacterSprite";
export { default as DialogueBox } from "./DialogueBox";
export { default as ChoiceMenu } from "./ChoiceMenu";
export { default as NameInput } from "./NameInput";
export { default as TextInput } from "./TextInput";
export { default as LLMInput } from "./LLMInput";
export { default as FeedbackScreen } from "./FeedbackScreen";
export { AudioProvider, AudioControls, useAudio } from "./AudioManager";

// Re-export types for convenience
export type {
  Character,
  Choice,
  DialogueNode,
  Scene,
  StoryData,
  GameState,
  FeedbackEntry,
} from "@/app/types/visual-novel";
