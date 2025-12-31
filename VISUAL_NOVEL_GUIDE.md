# Visual Novel Framework

This is a customizable visual novel framework built with Next.js, React, and TypeScript.

## Features

- **Multiple Characters** - Define characters with different sprites/expressions
- **Dialogue System** - Typewriter text effect with click-to-advance
- **Branching Choices** - Create decision trees with multiple paths
- **Custom Backgrounds** - Set backgrounds for each scene
- **Save/Load System** - Save progress to localStorage
- **Responsive Design** - Works on desktop and mobile
- **Keyboard Navigation** - Press Enter/Space to advance, ESC for menu
- **Name Input** - Prompt player for their name at game start
- **Text Input** - Capture user text responses and store in variables
- **LLM Integration** - AI-evaluated responses with dynamic character reactions
- **Character Scaling** - Scale character sprites globally or per-scene

## Project Structure

```
app/
├── components/visual-novel/
│   ├── Background.tsx        # Background image component
│   ├── CharacterSprite.tsx   # Character sprite display
│   ├── ChoiceMenu.tsx        # Choice selection UI
│   ├── DialogueBox.tsx       # Text display with typing effect
│   ├── NameInput.tsx         # Name input screen
│   ├── TextInput.tsx         # In-game text input
│   ├── LLMInput.tsx          # LLM-evaluated text input
│   ├── VisualNovelEngine.tsx # Main game engine
│   └── index.ts              # Exports
├── api/
│   └── gemini/route.ts       # Gemini API endpoint
├── data/
│   └── sample-story.ts       # Sample story data (customize this!)
├── types/
│   └── visual-novel.ts       # TypeScript type definitions
└── page.tsx                  # Main page

public/
├── characters/               # Put character sprites here
└── backgrounds/              # Put background images here
```

## How to Customize Your Story

### 1. Add Characters

Edit `app/data/sample-story.ts` and define your characters:

```typescript
characters: [
  {
    id: "hero",
    name: "hero",
    displayName: "Alex",
    sprites: {
      neutral: "/characters/hero-neutral.png",
      happy: "/characters/hero-happy.png",
      sad: "/characters/hero-sad.png",
      angry: "/characters/hero-angry.png",
    },
    defaultExpression: "neutral",
    nameColor: "#4CAF50", // Color of name in dialogue box
    scale: 1.2, // Default scale (1 = 100%, 1.2 = 120%)
  },
]
```

### 2. Add Backgrounds

Add background images to `public/backgrounds/` and register them:

```typescript
backgrounds: [
  {
    id: "forest",
    name: "Enchanted Forest",
    src: "/backgrounds/forest.jpg",
  },
]
```

### 3. Game Settings - Name Input

Configure the name input screen:

```typescript
settings: {
  askForName: true,  // Set to false to skip name input
  nameInputTitle: "Welcome to My Game",
  nameInputPrompt: "What is your name, adventurer?",
  nameInputPlaceholder: "Enter your name...",
  nameMinLength: 2,
  nameMaxLength: 15,
  defaultPlayerName: "Player",  // Used if askForName is false
},
```

### 4. Create Dialogue Nodes

Each scene contains an array of dialogue nodes:

```typescript
{
  id: "node_1",
  type: "dialogue",           // dialogue, narration, choice, input, llm_input, or end
  characterId: "hero",        // Who is speaking
  expression: "happy",        // Character expression
  text: "Hello, {userName}!", // Use {variableName} for interpolation
  background: "forest",       // Background ID (optional)
  nextNodeId: "node_2",       // Next node to go to
  visibleCharacters: [        // Characters visible on screen
    { characterId: "hero", expression: "happy", position: "center", scale: 1.5 }
  ],
}
```

### 5. Create Choice Nodes

For branching paths:

```typescript
{
  id: "choice_node",
  type: "choice",
  text: "What do you do?",    // Prompt shown above choices
  choices: [
    {
      id: "choice_a",
      text: "Go left",
      nextNodeId: "node_left",
      setVariables: { path: "left" },  // Set game variables
    },
    {
      id: "choice_b",
      text: "Go right",
      nextNodeId: "node_right",
      condition: {                      // Conditional choice
        variable: "hasKey",
        operator: "==",
        value: true
      }
    }
  ]
}
```

### 6. Text Input Nodes

Capture user text input:

```typescript
{
  id: "ask_favorite_color",
  type: "input",
  text: "What's your favorite color?",
  inputConfig: {
    variableName: "favoriteColor",  // Stored as {favoriteColor}
    placeholder: "Type a color...",
    minLength: 2,
    maxLength: 20,
    inputType: "text",              // "text", "number", or "email"
    validation: "^[a-zA-Z]+$",      // Optional regex pattern
    validationMessage: "Letters only please",
  },
  nextNodeId: "next_node",
}
```

### 7. LLM Input Nodes (AI-Evaluated Responses)

Send user input to Gemini for evaluation with structured response:

```typescript
{
  id: "greet_character",
  type: "llm_input",
  text: "How do you greet the merchant?",
  llmConfig: {
    userInputVariable: "playerGreeting",       // What the player typed
    characterResponseVariable: "merchantReply", // Character's dialogue response
    emotionVariable: "merchantEmotion",        // Character's emotion (for sprite)
    evaluationVariable: "greetingFeedback",    // How well the player did
    allowedEmotions: ["happy", "neutral", "angry", "sad"],  // Restrict emotions
    context: `You are a grumpy merchant. The player ({userName}) is greeting you.
      Respond briefly (1-2 sentences) in character.
      If they're polite, warm up a little. If they're rude, be cold.`,
    placeholder: "Type your greeting...",
    minLength: 5,
    maxLength: 300,
  },
  nextNodeId: "show_response",
  visibleCharacters: [
    { characterId: "merchant", expression: "neutral", position: "center" }
  ],
},
{
  id: "show_response",
  type: "dialogue",
  characterId: "merchant",
  text: "{merchantReply}",  // Shows the AI-generated response
  visibleCharacters: [
    // Dynamic expression based on AI's emotion response!
    { characterId: "merchant", expression: "{merchantEmotion}", position: "center" }
  ],
  nextNodeId: "show_feedback",
},
{
  id: "show_feedback",
  type: "narration",
  text: "[Feedback: {greetingFeedback}]",  // Shows evaluation
  nextNodeId: "continue_story",
}
```

**LLM Response Structure:**
- `characterResponseVariable` - What the character says in response
- `emotionVariable` - The character's emotion (maps to sprite expression)
- `evaluationVariable` - Feedback on how well the player responded

### 8. Variables & Interpolation

You can track game state with variables and use them anywhere:

```typescript
// Initial variables
variables: {
  relationship_score: 0,
  hasKey: false,
  chapter: 1
}

// In a choice
setVariables: { relationship_score: 5 }

// Use in text with {variableName}
text: "Hello {userName}, you have {relationship_score} points!"

// Use in expressions for dynamic sprites
expression: "{merchantEmotion}"

// Conditional choice (only shows if condition is met)
condition: {
  variable: "relationship_score",
  operator: ">=",
  value: 10
}
```

### 9. Character Scaling

Scale characters globally or per-appearance:

```typescript
// Global scale in character definition
characters: [
  {
    id: "hero",
    scale: 1.5,  // 150% size by default
    // ...
  }
]

// Per-scene scale override
visibleCharacters: [
  { 
    characterId: "hero", 
    expression: "happy", 
    position: "left",
    scale: 2.0  // Override to 200% for this appearance
  }
]
```

## Node Types

| Type | Description |
|------|-------------|
| `dialogue` | Character speaks (shows name & portrait) |
| `narration` | Narrator text (italic, no name) |
| `choice` | Player makes a choice |
| `input` | Player types text input |
| `llm_input` | AI-evaluated text input |
| `end` | End of story/chapter |

## Character Positions

- `left` - Character on left side
- `center` - Character in center
- `right` - Character on right side

## Transitions

- `fade` - Fade transition
- `slide` - Slide transition
- `none` - No transition

## Environment Setup

For LLM features, add your Gemini API key to `.env.local`:

```
GEMINI_API_KEY=your_api_key_here
```

## Tips

1. **Start simple** - Begin with a linear story, then add branches
2. **Use meaningful IDs** - Make node IDs descriptive (e.g., `node_cafe_greeting`)
3. **Test often** - Run `npm run dev` and test your story frequently
4. **Add images gradually** - The engine shows placeholders if images are missing
5. **LLM context matters** - Give detailed context to get better AI responses
6. **Match emotions to sprites** - Make sure `allowedEmotions` matches your character's sprite keys

## Running the Project

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to play your visual novel!

## Adding Custom Assets

### Character Sprites
- Place PNG images in `public/characters/`
- Recommended size: 500x700px or similar portrait ratio
- Transparent backgrounds work best
- Name them descriptively: `character-expression.png`

### Background Images
- Place JPG/PNG images in `public/backgrounds/`
- Recommended size: 1920x1080px (16:9)
- They will be scaled to cover the screen
