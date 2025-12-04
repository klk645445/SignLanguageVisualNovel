"use client";

import { useState, useEffect, useRef } from "react";

interface TextInputProps {
  prompt?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  inputType?: "text" | "number" | "email";
  validation?: RegExp;
  validationMessage?: string;
  onSubmit: (value: string) => void;
}

export default function TextInput({
  prompt = "Enter your response:",
  placeholder = "Type here...",
  minLength = 1,
  maxLength = 100,
  inputType = "text",
  validation,
  validationMessage = "Invalid input",
  onSubmit,
}: TextInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
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

    if (validation && !validation.test(trimmedValue)) {
      setError(validationMessage);
      return;
    }
    
    setError("");
    onSubmit(trimmedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent space from triggering dialogue advance
    e.stopPropagation();
    
    if (e.key === "Enter") {
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type={inputType}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                  text-white text-lg placeholder-white/40
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
              disabled={value.trim().length < minLength}
              className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 
                disabled:bg-gray-600 disabled:cursor-not-allowed
                text-white font-semibold rounded-lg
                transform transition-all duration-200
                hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
