"use client";

import { useState, useEffect, useRef } from "react";

interface LLMResponse {
  characterResponse: string;
  emotion: string;
  evaluation: string;
  rating: "good" | "neutral" | "bad";
}

interface LLMInputProps {
  prompt?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  llmContext: string;
  allowedEmotions?: string[];
  onSubmit: (userInput: string, response: LLMResponse) => void;
}

export default function LLMInput({
  prompt = "Enter your response:",
  placeholder = "Type here...",
  minLength = 1,
  maxLength = 500,
  llmContext,
  allowedEmotions = ["happy", "sad", "angry", "neutral"],
  onSubmit,
}: LLMInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus the input when not loading
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Animated loading text
  useEffect(() => {
    if (!isLoading) return;
    
    const dots = ["LK pauses for a moment to think", "LK pauses for a moment to think.", "LK pauses for a moment to think..", "LK pauses for a moment to think..."];
    let index = 0;
    
    const timer = setInterval(() => {
      index = (index + 1) % dots.length;
      setLoadingText(dots[index]);
    }, 400);
    
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < minLength) {
      setError(`Please enter at least ${minLength} character${minLength > 1 ? "s" : ""}`);
      return;
    }
    
    if (trimmedValue.length > maxLength) {
      setError(`Please enter ${maxLength} characters or less`);
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: trimmedValue,
          context: llmContext,
          allowedEmotions: allowedEmotions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
      const llmResponse: LLMResponse = {
        characterResponse: data.characterResponse || "...",
        emotion: data.emotion || "neutral",
        evaluation: data.evaluation || "No evaluation",
        rating: data.rating || "neutral",
      };
      
      onSubmit(trimmedValue, llmResponse);
    } catch (err) {
      console.error("LLM Error:", err);
      setError("Failed to get AI response. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent space from triggering dialogue advance
    e.stopPropagation();
    
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
          {/* Prompt */}
          <p className="text-white text-lg md:text-xl mb-4 text-center">
            {prompt}
          </p>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              {/* Spinner */}
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              
              {/* Loading Text */}
              <p className="text-purple-400 text-lg font-medium">
                {loadingText}
              </p>
              
              {/* User's input preview */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg max-w-full">
                <p className="text-gray-400 text-sm">Your response:</p>
                <p className="text-white text-sm mt-1 break-words">&quot;{value}&quot;</p>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  ref={inputRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                    e.stopPropagation();
                  }}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                    text-white text-lg placeholder-white/40 resize-none
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200"
                  autoComplete="off"
                />
                
                {/* Character count and error */}
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-red-400">{error}</span>
                  <span className="text-gray-400">
                    {value.length}/{maxLength}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={value.trim().length < minLength || isLoading}
                className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 
                  disabled:bg-gray-600 disabled:cursor-not-allowed
                  text-white font-semibold rounded-lg
                  transform transition-all duration-200
                  hover:scale-[1.02] active:scale-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  flex items-center justify-center gap-2"
              >
                <span>Submit</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
              
              <p className="text-gray-500 text-xs text-center">
                Press Enter to submit • Shift+Enter for new line
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
