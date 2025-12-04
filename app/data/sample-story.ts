import { StoryData } from "../types/visual-novel";

// Sample story data - customize this to create your own visual novel!
export const sampleStory: StoryData = {
  title: "The Mysterious Encounter",
  author: "Your Name",
  version: "1.0.0",

  // Game settings
  settings: {
    askForName: true,
    nameInputTitle: "Welcome to Common Ground",
    nameInputPrompt: "What is your name?",
    nameInputPlaceholder: "Enter your name...",
    nameMinLength: 2,
    nameMaxLength: 15,
    defaultPlayerName: "Player",
    // Audio settings - add your audio files to public/audio/
    defaultBgm: "/audio/canteen_sound.mp3", // Play BGM from game start
    clickSfx: "/audio/button_click.mp3", // Sound when selecting choices
  },

  // Define your characters here
  characters: [
    {
      id: "male_mc",
      name: "Male Main Character",
      displayName: "LK",
      sprites: {
        neutral: "/characters/male_mc/male_mc_neutral.png",
        happy: "/characters/male_mc/male_mc_happy.png",
        sad: "/characters/male_mc/male_mc_sad.png",
        angry: "/characters/male_mc/male_mc_angry.png",
      },
      defaultExpression: "neutral",
      nameColor: "#FF69B4",
    },
    {
      id: "female_mc",
      name: "Female Main Character",
      displayName: "Bob",
      sprites: {
        sad: "/characters/female_mc/female_mc_sad.png",
        happy: "/characters/female_mc/female_mc_happy.png",
        neutral: "/characters/female_mc/female_mc_neutral.png",
        angry: "/characters/female_mc/female_mc_angry.png",
      },
      defaultExpression: "neutral",
      nameColor: "#4169E1",
    },
    {
      id: "teacher",
      name: "teacher",
      displayName: "Teacher",
      sprites: {
            neutral: "/characters/teacher.png",
      },
      defaultExpression: "neutral",
      nameColor: "#888888",
    },

    {
      id: "canteen_uncle",
      name: "canteen_uncle",
      displayName: "Canteen Uncle",
      sprites: {
            neutral: "/characters/canteen_uncle.png",
      },
      defaultExpression: "neutral",
      nameColor: "#888888",
    },
  ],

  // Define your backgrounds here
  backgrounds: [
    {
      id: "primary_school_classroom",
      name: "Primary School Classroom",
      src: "/backgrounds/primary_school_class_bg.jpg",
    },
    {
      id: "primary_school_class_pixel_bg",
      name: "Primary School Classroom Pixel Background",
      src: "/backgrounds/primary_school_class_pixel_bg.jpg",
    },
    {
      id: "primary_school_canteen",
      name: "Primary School Canteen",
      src: "/backgrounds/primary_school_canteen.jpg",
    },
    {
      id: "night_street",
      name: "Night Street",
      src: "/backgrounds/night-street.jpg",
    },
  ],

  // Define your scenes and dialogue nodes
  scenes: [
    {
      id: "scene_1",
      name: "The Beginning",
      startNodeId: "context_node",
      nodes: [
        {
          id: "context_node",
          type: "narration",
          text: "A new day begins at school...",
          background: "primary_school_class_pixel_bg",
          nextNodeId: "node_1",
          speakerName: "Narrator",
          transition: "fade",
          audio: {
                type: "bgm",        // "bgm" or "sfx"
                src: "/audio/canteen_sound.mp3",
          },
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale:1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 },
          ],
        },
        {
          id: "node_1",
          type: "narration",
          text: "You walk into class and your deskmate, LK, is already sitting at her desk.",
          background: "primary_school_class_pixel_bg",
          nextNodeId: "introduce_yourself",
          speakerName: "Narrator",
          transition: "fade",
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale:1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 },
          ],
        },
        
        {
            id: "introduce_yourself",
            type: "input",
            text: "Introduce yourself to LK",
            inputConfig: {
                variableName: "introduction",  // Stores response in {favoriteColor}
                placeholder: "Introduce yourself to LK",
                minLength: 2,
                maxLength: 200,
                inputType: "text",              // "text", "number", or "email"

            },
              nextNodeId: "node_2",
        },

        {
          id: "node_2",
          type: "choice",
          characterId: "Y/N",
          expression: "happy",
          speakerName: "Narrator",
          text: "LK seems to have ignored you, what do you do?",
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale:1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 },
          ],
          choices: [
            {
              id: "choice_rude1",
              text: "OIIIIII LK!!!",
              nextNodeId: "node_3_unfriendly",
              setVariables: { relationship_lk: -10 },
            },
            {
              id: "choice_rude2",
              text: "Snap fingers near her ear",
              nextNodeId: "node_3_unfriendly",
              setVariables: { relationship_lk: -10 },
            },
            {
              id: "choice_rude3",
              text: "Clap hands in front of her face",
              nextNodeId: "node_3_unfriendly",
              setVariables: { relationship_lk: -10 },
            },
            {
              id: "choice_friendly",
              text: "Gently tap her shoulder",
              nextNodeId: "node_3_friendly",
              setVariables: { relationship_lk: 10 },
            },
          ],
          nextNodeId: "node_3",
        },
        {
          id: "node_3_unfriendly",
          type: "narration",
          speakerName: "Narrator",
          text: "LK looks visibly annoyed by your behavior",
          nextNodeId: "node_4_unfriendly",
        },
        {
          id: "node_4_unfriendly",
          type: "dialogue",
          characterId: "female_mc",
          speakerName: "LK",
          text: "Sorry I didnt hear you, my hearing aids were off,I'm LK",
          nextNodeId: "how_do_you_respond",
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale:1.5 },
            { characterId: "female_mc", expression: "sad", position: "right", scale:1.8 },
          ],
        },

        {
          id: "node_3_friendly",
          type: "narration",
          speakerName: "Narrator",
          text: "LK looks at you with a slight smile",
          nextNodeId: "node_4_friendly",
        },
        {
          id: "node_4_friendly",
          type: "dialogue",
          characterId: "female_mc",
          speakerName: "LK",
          text: "Oh! Hello! My hearing aids were off, I'm LK, nice to meet you!",
          nextNodeId: "how_do_you_respond",
          visibleCharacters: [
            { characterId: "female_mc", expression: "happy", position: "right", scale:1.8 },
            { characterId: "male_mc", expression: "happy", position: "left", scale:1.5 },
          ],
        },
        
        {
        id: "how_do_you_respond",
        type: "llm_input",
        speakerName: "Narrator",
        text: "How would you greet LK?",  // Prompt shown to user
        llmConfig: {
            userInputVariable: "playerGreeting",     // Stores what user typed
            characterResponseVariable: "lkResponse", // Stores LK's response dialogue
            emotionVariable: "lkEmotion",           // Stores LK's emotion (for sprite changes)
            evaluationVariable: "greetingEvaluation", // Stores evaluation of player's greeting
            allowedEmotions: ["happy", "sad", "neutral", "angry"], // Emotions LK can express
            context: `You are LK, a shy deaf student in a classroom. The player ({userName}) is trying to greet you.
            
        Evaluate their greeting and respond in character as LK. Be brief (1-2 sentences).
        If they're friendly, respond warmly and be happy. If they're rude, respond coldly and be sad or angry.
        
        If the user response is nonsense or does not match the current context, respond with confusion, and treat it as a bad response

        Previous context: The player introduced themselves by saying: "{introduction}"
        Their relationship with you so far: {relationship_lk}
        `,
            placeholder: "Type your greeting...",
            ratingConfig: {
                variableToModify: "relationship_lk",  // Which variable to modify
                goodPoints: 20,                        // +20 for good responses
                neutralPoints: 0,                      // +0 for neutral responses  
                badPoints: -20,                        // -20 for bad responses
            },
            minLength: 5,
            maxLength: 300,
        },
        nextNodeId: "show_lk_response",
        visibleCharacters: [
          { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
          { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
        ],
        },

        {
        id: "show_lk_response",
        type: "dialogue",
        characterId: "female_mc",
        speakerName: "LK",
        text: "{lkResponse}",  // Shows LK's response from the LLM
        nextNodeId: "show_evaluation",
        visibleCharacters: [
          { characterId: "male_mc", expression: "{lkEmotion}", position: "left", scale: 1.5 },  // Dynamic expression!
          { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
        ],
        },

        {
        id: "show_evaluation",
        type: "narration",
        speakerName: "Narrator",
        text: "[Feedback: {greetingEvaluation}]",  // Shows how well the player did
        nextNodeId: "scene_2/node_1",  // Transition to Scene 2!
        },
      ],
    },
    {
      id: "scene_2",
      name: "Group project",
      startNodeId: "node_1",
      nodes: [
        {
          id: "node_1",
          type: "narration",
          speakerName: "Narrator",
          text: "30 minutes later. Science Period.",
          background: "primary_school_class_pixel_bg",
          nextNodeId: "node_2",
          transition: "fade",
        },

        {
          id: "node_2",
          type: "dialogue",
          speakerName: "Mr Tan",
          text: "Class, get into groups of four! You're designing a butterfly life cycle poster!",
          nextNodeId: "node_3",
          transition: "fade",
          visibleCharacters: [
            { characterId: "teacher", expression: "neutral", position: "center", scale:2, offsetX: 70, offsetY: 70},
          ],
          
        },

        {
          id: "node_3",
          type: "narration",
          speakerName: "Narrator",
          text: "[The class erupts into chaos as students scramble to form groups.]",
          nextNodeId: "node_4",
          transition: "fade",
        },

        {
          id: "node_4",
          type: "narration",
          speakerName: "Narrator",
          text: "[Somehow in the chaos LK ends up in your group.]",
          nextNodeId: "node_5",
          transition: "fade",
        },

        {
          id: "node_5",
          type: "choice",
          characterId: "{userName}",
          speakerName: "{userName}",
          expression: "happy",
          text: "LK looks lost in the rapid conversation. Do you step in?",
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale:1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 },
          ],
          choices: [
            {
              id: "yes_choice",
              text: "Yes",
              nextNodeId: "node_13",
              addVariables: { relationship_lk: 10 },
            },
            {
              id: "no_choice",
              text: "No",
              nextNodeId: "node_6_no",
              addVariables: { relationship_lk: 0 },
            },
          ],
          nextNodeId: "node_3",
        },
        
        {
          id: "node_6_no",
          type: "narration",
          speakerName: "Narrator",
          text: "[Time passes, LK continues struggling to participate without your help.]",
          nextNodeId: "node_7",
          transition: "fade",
        },
        
        {
        id: "node_7",
        type: "narration",
        speakerName: "Narrator",
        text: "Mr Tan approaches",  // Shows how well the player did
        nextNodeId: "node_8",
        },

        {
          id: "node_8",
          type: "dialogue",
          speakerName: "Mr Tan",
          text: "LK, are you following along with your group?",
          nextNodeId: "node_9",
          transition: "fade",
          visibleCharacters: [
            { 
                characterId: "teacher", expression: "neutral", position: "center", scale:2, offsetX: 70, offsetY: 70
            },
            { 
                characterId: "male_mc", expression: "neutral", position: "left", scale:1.5 
            },
            { 
                characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 
            },
          ],
          
        },

        {
          id: "node_9",
          type: "dialogue",
          speakerName: "LK",
          text: "Ummm kind of?",
          nextNodeId: "node_10",
          transition: "fade",
          visibleCharacters: [
            { 
                characterId: "teacher", expression: "neutral", position: "left", scale:1.5 
            },
            { 
                characterId: "male_mc", expression: "neutral", position: "center", scale:1.5 
            },
            { 
                characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 
            },
          ],
        },

        {
          id: "node_10",
          type: "dialogue",
          speakerName: "LK",
          text: "Ummm kind of?",
          nextNodeId: "node_11",
          transition: "fade",
          visibleCharacters: [
            { 
                characterId: "teacher", expression: "neutral", position: "left", scale:1.5 
            },
            { 
                characterId: "male_mc", expression: "neutral", position: "center", scale:1.5 
            },
            { 
                characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 
            },
          ],
        },

        {
          id: "node_11",
          type: "dialogue",
          speakerName: "Mr Tan",
          text: "[Looks at the group] Friends, remember to ensure everyone is included!",
          nextNodeId: "node_12",
          transition: "fade",
          visibleCharacters: [
            { 
                characterId: "teacher", expression: "neutral", position: "left", scale:1.5 
            },
            { 
                characterId: "male_mc", expression: "neutral", position: "center", scale:1.5 
            },
            { 
                characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 
            },
          ],
        },

        {
          id: "node_12",
          type: "dialogue",
          speakerName: "{userName}",
          text: "Oh no... maybe I shouldve asked LK if she needed help..",
          nextNodeId: "node_13",
          transition: "fade",
          visibleCharacters: [
            { 
                characterId: "teacher", expression: "neutral", position: "left", scale:1.5 
            },
            { 
                characterId: "male_mc", expression: "neutral", position: "center", scale:1.5 
            },
            { 
                characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 
            },
          ],
        },

        {
          id: "node_13",
          type: "llm_input",
          llmConfig: {
            userInputVariable: "playerGreeting",     // Stores what user typed
            characterResponseVariable: "lkResponse", // Stores LK's response dialogue
            emotionVariable: "lkEmotion",           // Stores LK's emotion (for sprite changes)
            evaluationVariable: "helpEvaluation", // Stores evaluation of player's greeting
            allowedEmotions: ["happy", "sad", "neutral", "angry"], // Emotions LK can express
            context: `You are LK, a shy deaf student in a classroom. The player ({userName}) is trying to help you participate in the group project.
            
        Evaluate their help and respond in character as LK. Be brief (1-2 sentences).
        If they're friendly, respond warmly and be happy. If they're rude, respond coldly and be sad or angry.
        
        Previous context: Your teacher just introduced the group project to the class, however you are struggling to follow along with the rapid conversation."
        Their relationship with you so far: {relationship_lk}
        `,
                ratingConfig: {
                variableToModify: "relationship_lk",  // Which variable to modify
                goodPoints: 20,                        // +20 for good responses
                neutralPoints: 0,                      // +0 for neutral responses  
                badPoints: -20,                        // -20 for bad responses
            },
    
    },
          characterId: "{userName}",
          expression: "happy",
          
          text: "How do you help LK participate in the group project?",  // Prompt shown to user
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale:1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale:1.8 },
          ],
          nextNodeId: "show_lk_response",
        },
    
        {
        id: "show_lk_response",
        type: "dialogue",
        characterId: "female_mc",
        text: "{lkResponse}",  // Shows LK's response from the LLM
        nextNodeId: "show_evaluation",
        visibleCharacters: [
          { characterId: "male_mc", expression: "{lkEmotion}", position: "left", scale: 1.5 },  // Dynamic expression!
          { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
        ],
        },

        {
        id: "show_evaluation",
        type: "narration",
        text: "[Feedback: {helpEvaluation}]",  // Shows how well the player did
        nextNodeId: "node_end",
        },


        {
          id: "node_end",
          type: "narration",
          text: "[The class ends. You pack your things and to the canteen]",
          nextNodeId: "scene_3/node_1",
          transition: "fade",
        },
      ],
    },
     {
      id: "scene_3",
      name: "Canteen - Recess",
      startNodeId: "node_1",
      nodes: [
        // === INTRO ===
        {
          id: "node_1",
          type: "narration",
          speakerName: "Narrator",
          text: "[Students shouting orders, trays clattering, fans whirring.]",
          background: "primary_school_canteen",
          nextNodeId: "node_2",
          transition: "fade",
        },

        {
          id: "node_2",
          type: "narration",
          speakerName: "Narrator",
          text: "{userName} and LK are queueing at the Laksa stall.",
          nextNodeId: "node_3",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "node_3",
          type: "dialogue",
          speakerName: "Canteen Uncle",
          text: "Next! What you want?",
          nextNodeId: "node_4",
          visibleCharacters: [
            { characterId: "canteen_uncle", expression: "neutral", position: "center", scale: 2 },
          ],
        },

        {
          id: "node_4",
          type: "dialogue",
          speakerName: "LK",
          text: "One laksa, please.",
          nextNodeId: "node_5",
          visibleCharacters: [
            { characterId: "canteen_uncle", expression: "neutral", position: "left", scale: 2 },
            { characterId: "male_mc", expression: "neutral", position: "right", scale: 1.5 },
          ],
        },

        {
          id: "node_5",
          type: "dialogue",
          speakerName: "Canteen Uncle",
          text: "Spicy or not spicy?",
          nextNodeId: "node_6",
          visibleCharacters: [
            { characterId: "canteen_uncle", expression: "neutral", position: "left", scale: 2},
            { characterId: "male_mc", expression: "neutral", position: "right", scale: 1.5 },
          ],
        },

        {
          id: "node_6",
          type: "narration",
          speakerName: "Narrator",
          text: "[Noise from other stalls, students shouting orders]",
          nextNodeId: "node_7",
        },

        {
          id: "node_7",
          type: "dialogue",
          speakerName: "LK",
          text: "Sorry, what was that?",
          nextNodeId: "decision_3_1",
          visibleCharacters: [
            { characterId: "canteen_uncle", expression: "neutral", position: "left", scale: 2 },
            { characterId: "male_mc", expression: "neutral", position: "right", scale: 1.5 },
          ],
        },

        // === DECISION 3.1: Help LK hear Uncle? ===
        {
          id: "decision_3_1",
          type: "choice",
          speakerName: "Narrator",
          text: "The noise is overwhelming. LK can't hear Uncle's question. Do you help?",
          visibleCharacters: [
            { characterId: "canteen_uncle", expression: "neutral", position: "left", scale: 2 },
            { characterId: "male_mc", expression: "neutral", position: "center", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
          choices: [
            {
              id: "help_yes",
              text: "Yes",
              nextNodeId: "lk_orders_successfully",
              addVariables: { relationship_lk: 10 },
            },
            {
              id: "help_no",
              text: "No",
              nextNodeId: "no_help_result",
              addVariables: { relationship_lk: 0 },
            },
          ],
        },

        {
          id: "lk_orders_successfully",
          type: "narration",
          speakerName: "Narrator",
          text: "[You help LK and she successfully orders her laksa - not spicy, just the way she likes it.]",
          nextNodeId: "decision_3_2",
        },

        // === NO PATH: Uncle becomes impatient ===
        {
          id: "no_help_result",
          type: "narration",
          speakerName: "Narrator",
          text: "[The canteen uncle becomes impatient with the delay.]",
          nextNodeId: "uncle_impatient",
        },

        {
          id: "uncle_impatient",
          type: "dialogue",
          speakerName: "Canteen Uncle",
          text: "Aiya, never mind! Spicy for you!",
          nextNodeId: "lk_gets_spicy",
          visibleCharacters: [
            { characterId: "canteen_uncle", expression: "neutral", position: "center", scale: 2 },
          ],
        },

        {
          id: "lk_gets_spicy",
          type: "narration",
          speakerName: "Narrator",
          text: "[The uncle gives LK a spicy laksa. LK looks uncertain but accepts it.]",
          nextNodeId: "decision_3_2",
          addVariables: { relationship_lk: -10 },
        },

        // === DECISION 3.2: Where to sit? ===
        {
          id: "decision_3_2",
          type: "choice",
          speakerName: "Narrator",
          text: "Where should you sit with LK?",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
          choices: [
            {
              id: "sit_noisy",
              text: "Closest table to the queue",
              nextNodeId: "sit_noisy_result",
              setVariables: { seating_choice: "noisy" },
              addVariables: { relationship_lk: -10 },
            },
            {
              id: "sit_quiet",
              text: "Corner of canteen",
              nextNodeId: "sit_quiet_result",
              setVariables: { seating_choice: "quiet" },
              addVariables: { relationship_lk: 10 },
            },
          ],
        },

        // === NOISY SEATING PATH ===
        {
          id: "sit_noisy_result",
          type: "narration",
          speakerName: "Narrator",
          text: "[You sit at the closest table. The noise from the queue is overwhelming.]",
          nextNodeId: "check_helped_noisy",
        },

        // Check if player didn't help earlier (noisy path)
        {
          id: "check_helped_noisy",
          type: "narration",
          speakerName: "Narrator",
          text: "[You and LK settle down with your food.]",
          nextNodeId: "spicy_reaction_check",
        },

        // === QUIET SEATING PATH ===
        {
          id: "sit_quiet_result",
          type: "narration",
          speakerName: "Narrator",
          text: "[You find a quiet corner table away from the crowd. LK seems relieved.]",
          nextNodeId: "quiet_settle",
        },

        {
          id: "quiet_settle",
          type: "narration",
          speakerName: "Narrator",
          text: "[You and LK settle down with your food in the peaceful corner.]",
          nextNodeId: "spicy_reaction_check",
        },

        // === SPICY REACTION (if didn't help) ===
        {
          id: "spicy_reaction_check",
          type: "narration",
          speakerName: "Narrator",
          text: "[LK takes her first bite of laksa...]",
          nextNodeId: "conversation_branch",
        },

        // === DECISION 3.3: Conversation branching based on seating ===
        {
          id: "conversation_branch",
          type: "choice",
          speakerName: "Narrator",
          text: "[Time to start a conversation. What do you do?]",
          choices: [
            {
              id: "start_convo",
              text: "Start a conversation with LK",
              nextNodeId: "convo_noisy_1",
              condition: { variable: "seating_choice", operator: "==", value: "noisy" },
            },
            {
              id: "start_convo_quiet",
              text: "Start a conversation with LK",
              nextNodeId: "convo_quiet",
              condition: { variable: "seating_choice", operator: "==", value: "quiet" },
            },
          ],
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        // === 3.3.1 NOISY PATH - Multiple attempts ===
        {
          id: "convo_noisy_1",
          type: "input",
          speakerName: "Narrator",
          text: "How will you start a conversation with LK?",
          inputConfig: {
            variableName: "convo_attempt_1",
            placeholder: "e.g., Ask about LK's day...",
            minLength: 3,
            maxLength: 200,
          },
          nextNodeId: "lk_cant_hear_1",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "lk_cant_hear_1",
          type: "dialogue",
          speakerName: "LK",
          text: "Huh?",
          nextNodeId: "convo_noisy_2",
          visibleCharacters: [
            { characterId: "male_mc", expression: "confused", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "convo_noisy_2",
          type: "input",
          speakerName: "Narrator",
          text: "[The noise is making it hard. Try again?]",
          inputConfig: {
            variableName: "convo_attempt_2",
            placeholder: "Try speaking to LK again...",
            minLength: 3,
            maxLength: 200,
          },
          nextNodeId: "lk_cant_hear_2",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "lk_cant_hear_2",
          type: "dialogue",
          speakerName: "LK",
          text: "I can't hear you clearly...",
          nextNodeId: "convo_noisy_3",
          visibleCharacters: [
            { characterId: "male_mc", expression: "sad", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "convo_noisy_3",
          type: "llm_input",
          speakerName: "Narrator",
          text: "[One more try. How do you communicate with LK in this noisy environment?]",
          llmConfig: {
            userInputVariable: "convo_attempt_3",
            characterResponseVariable: "lkNoisyResponse",
            emotionVariable: "lkNoisyEmotion",
            evaluationVariable: "noisyConvoEvaluation",
            allowedEmotions: ["happy", "sad", "neutral", "frustrated"],
            context: `You are LK, a shy deaf student at a VERY NOISY canteen. The player ({userName}) has been trying to talk to you but you couldn't hear their first two attempts:
- First attempt: "{convo_attempt_1}"  
- Second attempt: "{convo_attempt_2}"

Now they're trying a third time. The environment is very noisy because they chose to sit at a table close to the queue.

Evaluate their third attempt. If they adapted (used gestures, wrote something down, moved closer, spoke more clearly facing you), respond positively. If they just kept trying to talk normally, express frustration about the noisy seating choice.

IMPORTANT: In your evaluation, mention that the noisy seating choice made communication difficult.

Their relationship with you: {relationship_lk}`,
            placeholder: "How do you try to communicate?",
            minLength: 5,
            maxLength: 300,
            ratingConfig: {
                variableToModify: "relationship_lk",  // Which variable to modify
                goodPoints: 20,                        // +20 for good responses
                neutralPoints: 0,                      // +0 for neutral responses  
                badPoints: -20,                        // -20 for bad responses
            },
          },
          nextNodeId: "lk_noisy_response",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "lk_noisy_response",
          type: "dialogue",
          speakerName: "LK",
          text: "{lkNoisyResponse}",
          nextNodeId: "noisy_evaluation",
          visibleCharacters: [
            { characterId: "male_mc", expression: "{lkNoisyEmotion}", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "noisy_evaluation",
          type: "narration",
          speakerName: "Narrator",
          text: "[Feedback: {noisyConvoEvaluation}]",
          nextNodeId: "scene_3_end",
        },

        // === 3.3.2 QUIET PATH - Easier conversation ===
        {
          id: "convo_quiet",
          type: "llm_input",
          speakerName: "Narrator",
          text: "How will you start a conversation with LK?",
          llmConfig: {
            userInputVariable: "quietConvoAttempt",
            characterResponseVariable: "lkQuietResponse",
            emotionVariable: "lkQuietEmotion",
            evaluationVariable: "quietConvoEvaluation",
            allowedEmotions: ["happy", "neutral", "grateful"],
            context: `You are LK, a shy deaf student at a canteen. The player ({userName}) chose a quiet corner table to sit with you - this was very thoughtful!

The environment is peaceful and you can focus on the conversation much better. Respond to their conversation starter warmly.

IMPORTANT: In your evaluation, praise them for choosing a quiet seating spot, which made communication much easier for you.

Their relationship with you: {relationship_lk}
Did they help you at the laksa stall earlier? {helped_lk_canteen}`,
            placeholder: "e.g., Ask about LK's day...",
            minLength: 5,
            maxLength: 300,
            ratingConfig: {
                variableToModify: "relationship_lk",  // Which variable to modify
                goodPoints: 20,                        // +20 for good responses
                neutralPoints: 0,                      // +0 for neutral responses  
                badPoints: -20,                        // -20 for bad responses
            },
          },
          nextNodeId: "lk_quiet_response",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "lk_quiet_response",
          type: "dialogue",
          speakerName: "LK",
          text: "{lkQuietResponse}",
          nextNodeId: "quiet_evaluation",
          addVariables: { relationship_lk: 3 },
          visibleCharacters: [
            { characterId: "male_mc", expression: "{lkQuietEmotion}", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "quiet_evaluation",
          type: "narration",
          speakerName: "Narrator",
          text: "[Feedback: {quietConvoEvaluation}]",
          nextNodeId: "scene_3_end",
        },

        // === SCENE END ===
        {
          id: "scene_3_end",
          type: "narration",
          speakerName: "Narrator",
          text: "[The recess bell rings. Time to head back to class.]",
          nextNodeId: "scene_4/node_1",  // Transition to Scene 4
        },
      ],
    },
    // === SCENE 4: END OF DAY ===
    {
      id: "scene_4",
      name: "End of Day",
      startNodeId: "node_1",
      nodes: [
        {
          id: "node_1",
          type: "narration",
          speakerName: "Narrator",
          text: "[School bell rings. Everyone starts packing up and leaving.]",
          background: "primary_school_class_pixel_bg",
          nextNodeId: "score_check",
          transition: "fade",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        // === SCORE BRANCHING ===
        {
          id: "score_check",
          type: "choice",
          speakerName: "Narrator",
          text: "[LK turns to you as you both pack up...]",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
          choices: [
            {
              id: "high_score_path",
              text: "Continue",
              nextNodeId: "ending_high_1",
              condition: { variable: "relationship_lk", operator: ">", value: 80 },
            },
            {
              id: "mid_score_path",
              text: "Continue",
              nextNodeId: "ending_mid",
              condition: { variable: "relationship_lk", operator: ">=", value: 50 },
            },
            {
              id: "low_score_path",
              text: "Continue",
              nextNodeId: "ending_low",
              condition: { variable: "relationship_lk", operator: "<", value: 50 },
            },
          ],
        },

        // === HIGH SCORE ENDING (> 80) ===
        {
          id: "ending_high_1",
          type: "dialogue",
          speakerName: "LK",
          text: "Thanks for helping me today.",
          nextNodeId: "ending_high_2",
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "ending_high_2",
          type: "dialogue",
          speakerName: "{userName}",
          text: "No problem.",
          nextNodeId: "ending_high_3",
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "happy", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "ending_high_3",
          type: "dialogue",
          speakerName: "LK",
          text: "Do you want to play Roblox with me later?",
          nextNodeId: "ending_high_final",
          visibleCharacters: [
            { characterId: "male_mc", expression: "happy", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "happy", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "ending_high_final",
          type: "end",
          speakerName: "Narrator",
          text: "🎉 Best Ending! You've made a great friend in LK!\n\nFinal Score: {relationship_lk}",
        },

        // === MID SCORE ENDING (50-80) ===
        {
          id: "ending_mid",
          type: "dialogue",
          speakerName: "LK",
          text: "See you tomorrow!",
          nextNodeId: "ending_mid_final",
          visibleCharacters: [
            { characterId: "male_mc", expression: "neutral", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "neutral", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "ending_mid_final",
          type: "end",
          speakerName: "Narrator",
          text: "Good Ending! You and LK are becoming friends.\n\nFinal Score: {relationship_lk}",
        },

        // === LOW SCORE ENDING (< 50) ===
        {
          id: "ending_low",
          type: "narration",
          speakerName: "LK",
          text: "[LK leaves without a word.]",
          nextNodeId: "ending_low_final",
          visibleCharacters: [
            { characterId: "male_mc", expression: "sad", position: "left", scale: 1.5 },
            { characterId: "female_mc", expression: "sad", position: "right", scale: 1.8 },
          ],
        },

        {
          id: "ending_low_final",
          type: "end",
          speakerName: "Narrator",
          text: "Neutral Ending. LK seems distant. Maybe you could have been more understanding...\n\nFinal Score: {relationship_lk}",
        },
      ],
    },
  ],

  startSceneId: "scene_1",

  // Initial game variables
  variables: {
    relationship_lk: 0,
    chapter: 1,
  },
};
