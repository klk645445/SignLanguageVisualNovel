"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  StoryData,
  GameState,
  DialogueNode,
  Choice,
  Character,
  FeedbackEntry,
} from "@/app/types/visual-novel";
import Background from "./Background";
import CharacterSprite from "./CharacterSprite";
import DialogueBox from "./DialogueBox";
import ChoiceMenu from "./ChoiceMenu";
import NameInput from "./NameInput";
import TextInput from "./TextInput";
import LLMInput from "./LLMInput";
import FeedbackScreen from "./FeedbackScreen";
import { AudioProvider, AudioControls, useAudio } from "./AudioManager";

interface VisualNovelEngineProps {
  story: StoryData;
  onGameEnd?: (state: GameState) => void;
  onSave?: (state: GameState) => void;
  initialState?: GameState;
}

// Main export wraps the engine with AudioProvider
export default function VisualNovelEngine(props: VisualNovelEngineProps) {
  return (
    <AudioProvider>
      <VisualNovelEngineInner {...props} />
    </AudioProvider>
  );
}

function VisualNovelEngineInner({
  story,
  onGameEnd,
  onSave,
  initialState,
}: VisualNovelEngineProps) {
  // Audio hook
  const { playBgm, playSfx, stopBgm } = useAudio();
  // Initialize game state
  const [gameState, setGameState] = useState<GameState>(() => {
    if (initialState) return initialState;

    const startScene = story.scenes.find((s) => s.id === story.startSceneId);
    const askForName = story.settings?.askForName ?? true;
    
    return {
      currentSceneId: story.startSceneId,
      currentNodeId: startScene?.startNodeId || "",
      variables: { ...story.variables },
      history: [],
      userName: story.settings?.defaultPlayerName || "",
      gameStarted: !askForName, // Skip name input if not asking for name
      feedback: [], // Initialize empty feedback array
      showFeedbackScreen: false,
    };
  });

  // Handle name submission - play audio immediately on user click to satisfy browser autoplay policy
  const handleNameSubmit = useCallback((name: string) => {
    // Play BGM immediately within the user gesture context
    if (story.settings?.defaultBgm) {
      playBgm(story.settings.defaultBgm, true);
    }
    
    setGameState((prev) => ({
      ...prev,
      userName: name,
      gameStarted: true,
    }));
  }, [story.settings?.defaultBgm, playBgm]);

  // Interpolate variables in text (e.g., {userName} -> actual name)
  const interpolateText = useCallback((text: string): string => {
    if (!text) return text;
    
    return text.replace(/\{(\w+)\}/g, (match, varName) => {
      // Check for special variables first
      if (varName === "userName") {
        return gameState.userName || "Player";
      }
      // Then check game variables
      const value = gameState.variables[varName];
      if (value !== undefined) {
        return String(value);
      }
      // Return original if not found
      return match;
    });
  }, [gameState.userName, gameState.variables]);

  const [currentBackground, setCurrentBackground] = useState<string | undefined>();
  const [showMenu, setShowMenu] = useState(false);
  const lastPlayedAudio = useRef<string | null>(null);

  // Get current scene and node
  const currentScene = story.scenes.find((s) => s.id === gameState.currentSceneId);
  const currentNode = currentScene?.nodes.find((n) => n.id === gameState.currentNodeId);

  // Get character by ID
  const getCharacter = useCallback(
    (characterId: string): Character | undefined => {
      return story.characters.find((c) => c.id === characterId);
    },
    [story.characters]
  );

  // Get background URL
  const getBackgroundUrl = useCallback(
    (backgroundId?: string): string | undefined => {
      if (!backgroundId) return undefined;
      const bg = story.backgrounds.find((b) => b.id === backgroundId);
      return bg?.src;
    },
    [story.backgrounds]
  );

  // Update background when node changes
  useEffect(() => {
    if (currentNode?.background) {
      setCurrentBackground(getBackgroundUrl(currentNode.background));
    }
  }, [currentNode, getBackgroundUrl]);

  // Play default background music when game starts
  useEffect(() => {
    if (gameState.gameStarted && story.settings?.defaultBgm) {
      playBgm(story.settings.defaultBgm, true);
    }
    return () => {
      stopBgm();
    };
  }, [gameState.gameStarted, story.settings?.defaultBgm, playBgm, stopBgm]);

  // Handle node audio (BGM changes or SFX)
  useEffect(() => {
    if (currentNode?.audio) {
      const audioSrc = currentNode.audio.src;
      
      // Prevent playing the same audio repeatedly
      if (lastPlayedAudio.current === audioSrc) {
        return;
      }
      
      if (currentNode.audio.type === "bgm") {
        lastPlayedAudio.current = audioSrc;
        playBgm(audioSrc, currentNode.audio.loop ?? true);
      } else if (currentNode.audio.type === "sfx") {
        playSfx(audioSrc);
      }
    }
  }, [currentNode, playBgm, playSfx]);

  // Apply variables from node
  // Apply variables from node (setVariables and addVariables)
  useEffect(() => {
    if (currentNode?.setVariables || currentNode?.addVariables) {
      setGameState((prev) => {
        const newVariables = { ...prev.variables };
        
        // Apply set variables (overwrites)
        if (currentNode.setVariables) {
          Object.assign(newVariables, currentNode.setVariables);
        }
        
        // Apply add variables (increments)
        if (currentNode.addVariables) {
          for (const [key, value] of Object.entries(currentNode.addVariables)) {
            const currentValue = typeof newVariables[key] === 'number' ? newVariables[key] : 0;
            newVariables[key] = (currentValue as number) + value;
          }
        }
        
        return { ...prev, variables: newVariables };
      });
    }
  }, [currentNode]);

  // Advance to next node (supports cross-scene navigation with "sceneId/nodeId" format)
  const advanceToNode = useCallback(
    (nodeId: string, choiceId?: string) => {
      // Check if nodeId contains a scene reference (format: "sceneId/nodeId")
      if (nodeId.includes("/")) {
        const [targetSceneId, targetNodeId] = nodeId.split("/");
        setGameState((prev) => ({
          ...prev,
          currentSceneId: targetSceneId,
          currentNodeId: targetNodeId,
          history: [
            ...prev.history,
            {
              sceneId: prev.currentSceneId,
              nodeId: prev.currentNodeId,
              choiceId,
            },
          ],
        }));
      } else {
        // Same scene navigation
        setGameState((prev) => ({
          ...prev,
          currentNodeId: nodeId,
          history: [
            ...prev.history,
            {
              sceneId: prev.currentSceneId,
              nodeId: prev.currentNodeId,
              choiceId,
            },
          ],
        }));
      }
    },
    []
  );

  // Handle dialogue completion
  const handleDialogueComplete = useCallback(() => {
    if (currentNode?.nextNodeId) {
      advanceToNode(currentNode.nextNodeId);
    }
  }, [currentNode, advanceToNode]);

  // Handle choice selection
  const handleChoiceSelect = useCallback(
    (choice: Choice) => {
      // Play click sound effect
      if (story.settings?.clickSfx) {
        playSfx(story.settings.clickSfx);
      }

      setGameState((prev) => {
        const newVariables = { ...prev.variables };
        
        // Apply set variables (overwrites)
        if (choice.setVariables) {
          Object.assign(newVariables, choice.setVariables);
        }
        
        // Apply add variables (increments)
        if (choice.addVariables) {
          for (const [key, value] of Object.entries(choice.addVariables)) {
            const currentValue = typeof newVariables[key] === 'number' ? newVariables[key] : 0;
            newVariables[key] = (currentValue as number) + value;
          }
        }
        
        return { ...prev, variables: newVariables };
      });

      advanceToNode(choice.nextNodeId, choice.id);
    },
    [advanceToNode, playSfx, story.settings?.clickSfx]
  );

  // Handle game end
  useEffect(() => {
    if (currentNode?.type === "end" && onGameEnd) {
      onGameEnd(gameState);
    }
  }, [currentNode, gameState, onGameEnd]);

  // Save game
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(gameState);
    }
    // Also save to localStorage
    localStorage.setItem("visualNovelSave", JSON.stringify(gameState));
    alert("Game saved!");
  }, [gameState, onSave]);

  // Load game
  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem("visualNovelSave");
    if (saved) {
      setGameState(JSON.parse(saved));
      alert("Game loaded!");
    } else {
      alert("No save data found!");
    }
  }, []);

  // Restart game
  const handleRestart = useCallback(() => {
    if (confirm("Are you sure you want to restart? All progress will be lost.")) {
      const startScene = story.scenes.find((s) => s.id === story.startSceneId);
      const askForName = story.settings?.askForName ?? true;
      
      // Clear saved game
      localStorage.removeItem("visualNovelSave");
      
      setGameState({
        currentSceneId: story.startSceneId,
        currentNodeId: startScene?.startNodeId || "",
        variables: { ...story.variables },
        history: [],
        userName: story.settings?.defaultPlayerName || "",
        gameStarted: !askForName,
        feedback: [], // Reset feedback
        showFeedbackScreen: false,
      });
    }
  }, [story]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (currentNode?.type !== "choice" && currentNode?.type !== "input" && currentNode?.type !== "llm_input") {
          handleDialogueComplete();
        }
      }
      if (e.key === "Escape") {
        setShowMenu((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentNode, handleDialogueComplete]);

  if (!currentNode) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <p>Error: Could not find current node</p>
      </div>
    );
  }

  // Show name input screen if game hasn't started
  if (!gameState.gameStarted) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <NameInput
          title={story.settings?.nameInputTitle || story.title}
          prompt={story.settings?.nameInputPrompt || "Please enter your name:"}
          placeholder={story.settings?.nameInputPlaceholder || "Your name..."}
          minLength={story.settings?.nameMinLength || 1}
          maxLength={story.settings?.nameMaxLength || 20}
          onSubmit={handleNameSubmit}
        />
      </div>
    );
  }

  const speakingCharacter = currentNode.characterId
    ? getCharacter(currentNode.characterId)
    : undefined;

  // Get speaker name: use speakerName if provided, otherwise use character's displayName
  const getSpeakerName = (): string | undefined => {
    if (currentNode.speakerName) {
      return interpolateText(currentNode.speakerName);
    }
    return speakingCharacter?.displayName;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <Background
        src={currentBackground}
        transition={currentNode.transition}
        alt="Scene background"
      />

      {/* Characters */}
      {currentNode.visibleCharacters?.map((vc) => {
        const character = getCharacter(vc.characterId);
        if (!character) return null;

        // Interpolate expression to support dynamic expressions like {lkEmotion}
        const interpolatedExpression = vc.expression 
          ? interpolateText(vc.expression) 
          : undefined;

        return (
          <CharacterSprite
            key={vc.characterId}
            character={character}
            expression={interpolatedExpression}
            position={vc.position}
            isActive={currentNode.characterId === vc.characterId}
            scale={vc.scale}
            offsetX={vc.offsetX}
            offsetY={vc.offsetY}
          />
        );
      })}

      {/* Choice Menu */}
      {currentNode.type === "choice" && currentNode.choices && (
        <ChoiceMenu
          prompt={interpolateText(currentNode.text || "")}
          choices={currentNode.choices.map(c => ({
            ...c,
            text: interpolateText(c.text),
          }))}
          onSelect={handleChoiceSelect}
          variables={gameState.variables}
        />
      )}

      {/* Text Input */}
      {currentNode.type === "input" && currentNode.inputConfig && (
        <TextInput
          prompt={interpolateText(currentNode.text || "Enter your response:")}
          placeholder={currentNode.inputConfig.placeholder || "Type here..."}
          minLength={currentNode.inputConfig.minLength || 1}
          maxLength={currentNode.inputConfig.maxLength || 100}
          inputType={currentNode.inputConfig.inputType || "text"}
          validation={currentNode.inputConfig.validation ? new RegExp(currentNode.inputConfig.validation) : undefined}
          validationMessage={currentNode.inputConfig.validationMessage}
          onSubmit={(value) => {
            // Store the input AND advance to next node in a single state update
            setGameState((prev) => {
              const newVariables = {
                ...prev.variables,
                [currentNode.inputConfig!.variableName]: value,
              };
              
              const nextNodeId = currentNode.nextNodeId;
              if (!nextNodeId) {
                return { ...prev, variables: newVariables };
              }
              
              // Check if nodeId contains a scene reference (format: "sceneId/nodeId")
              if (nextNodeId.includes("/")) {
                const [targetSceneId, targetNodeId] = nextNodeId.split("/");
                return {
                  ...prev,
                  variables: newVariables,
                  currentSceneId: targetSceneId,
                  currentNodeId: targetNodeId,
                  history: [
                    ...prev.history,
                    {
                      sceneId: prev.currentSceneId,
                      nodeId: prev.currentNodeId,
                    },
                  ],
                };
              } else {
                return {
                  ...prev,
                  variables: newVariables,
                  currentNodeId: nextNodeId,
                  history: [
                    ...prev.history,
                    {
                      sceneId: prev.currentSceneId,
                      nodeId: prev.currentNodeId,
                    },
                  ],
                };
              }
            });
          }}
        />
      )}

      {/* LLM Input - Sends user input to Gemini for evaluation */}
      {currentNode.type === "llm_input" && currentNode.llmConfig && (
        <LLMInput
          prompt={interpolateText(currentNode.text || "Enter your response:")}
          placeholder={currentNode.llmConfig.placeholder || "Type your response..."}
          minLength={currentNode.llmConfig.minLength || 1}
          maxLength={currentNode.llmConfig.maxLength || 500}
          llmContext={interpolateText(currentNode.llmConfig.context)}
          allowedEmotions={currentNode.llmConfig.allowedEmotions}
          onSubmit={(userInput, llmResponse) => {
            // Store user input, LLM response, AND advance to next node in a single state update
            // This prevents the race condition where advanceToNode overwrites variable changes
            setGameState((prev) => {
              const newVariables = {
                ...prev.variables,
                [currentNode.llmConfig!.userInputVariable]: userInput,
                [currentNode.llmConfig!.characterResponseVariable]: llmResponse.characterResponse,
                [currentNode.llmConfig!.emotionVariable]: llmResponse.emotion,
                [currentNode.llmConfig!.evaluationVariable]: llmResponse.evaluation,
              };
              
              // Apply rating-based points if ratingConfig is defined
              const ratingConfig = currentNode.llmConfig!.ratingConfig;
              if (ratingConfig) {
                const currentValue = typeof newVariables[ratingConfig.variableToModify] === 'number' 
                  ? newVariables[ratingConfig.variableToModify] as number 
                  : 0;
                
                let pointsToAdd = ratingConfig.neutralPoints; // default to neutral
                if (llmResponse.rating === "good") {
                  pointsToAdd = ratingConfig.goodPoints;
                } else if (llmResponse.rating === "bad") {
                  pointsToAdd = ratingConfig.badPoints;
                }
                
                newVariables[ratingConfig.variableToModify] = currentValue + pointsToAdd;
                console.log(`[Rating] ${llmResponse.rating}: ${pointsToAdd} points → ${ratingConfig.variableToModify} = ${newVariables[ratingConfig.variableToModify]}`);
              }
              
              // Collect feedback for end-of-game summary
              const newFeedback: FeedbackEntry = {
                nodeId: currentNode.id,
                sceneId: prev.currentSceneId,
                userInput: userInput,
                evaluation: llmResponse.evaluation,
                rating: llmResponse.rating,
                context: currentNode.text || "Interaction with LK",
              };
              const updatedFeedback = [...(prev.feedback || []), newFeedback];
              
              // Handle node advancement within the same state update
              const nextNodeId = currentNode.nextNodeId;
              if (!nextNodeId) {
                return { ...prev, variables: newVariables, feedback: updatedFeedback };
              }
              
              // Check if nodeId contains a scene reference (format: "sceneId/nodeId")
              if (nextNodeId.includes("/")) {
                const [targetSceneId, targetNodeId] = nextNodeId.split("/");
                return {
                  ...prev,
                  variables: newVariables,
                  feedback: updatedFeedback,
                  currentSceneId: targetSceneId,
                  currentNodeId: targetNodeId,
                  history: [
                    ...prev.history,
                    {
                      sceneId: prev.currentSceneId,
                      nodeId: prev.currentNodeId,
                    },
                  ],
                };
              } else {
                return {
                  ...prev,
                  variables: newVariables,
                  feedback: updatedFeedback,
                  currentNodeId: nextNodeId,
                  history: [
                    ...prev.history,
                    {
                      sceneId: prev.currentSceneId,
                      nodeId: prev.currentNodeId,
                    },
                  ],
                };
              }
            });
          }}
        />
      )}

      {/* Dialogue Box */}
      {(currentNode.type === "dialogue" ||
        currentNode.type === "narration" ||
        currentNode.type === "end") &&
        currentNode.text && (
          <DialogueBox
            characterName={getSpeakerName()}
            nameColor={speakingCharacter?.nameColor}
            text={interpolateText(currentNode.text)}
            isNarration={currentNode.type === "narration" || currentNode.type === "end"}
            onComplete={currentNode.type !== "end" ? handleDialogueComplete : undefined}
          />
        )}

      {/* Show Feedback Button on End Screen */}
      {currentNode.type === "end" && (
        <button
          onClick={() => setGameState(prev => ({ ...prev, showFeedbackScreen: true }))}
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2 
            py-3 px-8 bg-yellow-500 hover:bg-yellow-600 text-black font-bold 
            rounded-lg transition-all hover:scale-105 z-40"
        >
          View Feedback & Tips
        </button>
      )}

      {/* Feedback Screen */}
      {gameState.showFeedbackScreen && (
        <FeedbackScreen
          feedback={gameState.feedback || []}
          playerName={gameState.userName || "Player"}
          finalScore={typeof gameState.variables.relationship_lk === 'number' ? gameState.variables.relationship_lk : 0}
          onRestart={handleRestart}
          onClose={() => setGameState(prev => ({ ...prev, showFeedbackScreen: false }))}
        />
      )}

      {/* Game Menu Button */}
      <button
        onClick={() => setShowMenu(true)}
        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 
          rounded-lg text-white transition-colors z-50"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Game Menu Overlay */}
      {showMenu && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              {story.title}
            </h2>

            <button
              onClick={() => setShowMenu(false)}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Resume
            </button>

            <button
              onClick={() => {
                handleSave();
                setShowMenu(false);
              }}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Game
            </button>

            <button
              onClick={() => {
                handleLoad();
                setShowMenu(false);
              }}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Load Game
            </button>

            <button
              onClick={handleRestart}
              className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Restart
            </button>

            {/* Audio Controls */}
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-white text-sm font-semibold mb-3">Audio Settings</h3>
              <AudioControls />
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm text-center">
                Press ESC to toggle menu
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 left-4 bg-black/70 text-white text-xs p-2 rounded max-w-xs">
          <p>Scene: {gameState.currentSceneId}</p>
          <p>Node: {gameState.currentNodeId}</p>
          <p>Player: {gameState.userName}</p>
          <p className="mt-2 text-yellow-400 font-bold text-sm">
            💛 LK Relationship: {gameState.variables.relationship_lk ?? 0}
          </p>
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-400">All Variables</summary>
            <pre className="text-[10px] mt-1 overflow-auto max-h-32">
              {JSON.stringify(gameState.variables, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
