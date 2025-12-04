"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface NameInputProps {
  title?: string;
  prompt?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  onSubmit: (name: string) => void;
}

export default function NameInput({
  title = "Welcome",
  prompt = "Please enter your name:",
  placeholder = "Your name...",
  minLength = 1,
  maxLength = 20,
  onSubmit,
}: NameInputProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < minLength) {
      setError(`Name must be at least ${minLength} character${minLength > 1 ? "s" : ""}`);
      return;
    }
    
    if (trimmedName.length > maxLength) {
      setError(`Name must be ${maxLength} characters or less`);
      return;
    }
    
    setError("");
    onSubmit(trimmedName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-0">
        {/* Logo - Above the input card */}
        <div className="mb-10 w-full max-w-lg">
          <Image
            src="/common_ground_logo.png"
            alt="Common Ground"
            width={700}
            height={350}
            className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] w-full h-auto"
            priority
          />
        </div>

        {/* Input Card */}
        <div className="mt-4 bg-black/70 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl w-full max-w-md">
          {/* Prompt */}
          <p className="text-white text-center mb-6 text-lg">
            {prompt}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                  text-white text-lg placeholder-white/40
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                  transition-all duration-200"
              />
              
              {/* Character count */}
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-red-400">{error}</span>
                <span className="text-gray-300">
                  {name.length}/{maxLength}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={name.trim().length < minLength}
              className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 
                disabled:bg-gray-600 disabled:cursor-not-allowed
                text-black font-bold rounded-lg
                transform transition-all duration-200
                hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Start Game
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
