"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "./AudioManager";

interface DialogueBoxProps {
  characterName?: string;
  nameColor?: string;
  text: string;
  isNarration?: boolean;
  onComplete?: () => void;
  typingSpeed?: number;
  charsPerTick?: number; // Characters to reveal per tick for faster typing
}

export default function DialogueBox({
  characterName,
  nameColor = "#ffffff",
  text,
  isNarration = false,
  onComplete,
  typingSpeed = 20,
  charsPerTick = 2, // Reveal 2 characters at a time for better performance
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const currentIndexRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { sfxVolume, isMuted } = useAudio();

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Stop the typing sound
  const stopTypingSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Start the typing sound (looped)
  const startTypingSound = useCallback(() => {
    if (isMuted) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/text_scroll.mp3");
      audioRef.current.loop = true;
    }
    audioRef.current.volume = sfxVolume;
    audioRef.current.play().catch(() => {});
  }, [sfxVolume, isMuted]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : sfxVolume;
    }
  }, [sfxVolume, isMuted]);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    currentIndexRef.current = 0;
    lastUpdateRef.current = 0;
    stopAnimation();
    startTypingSound();

    const animate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      
      const elapsed = timestamp - lastUpdateRef.current;
      
      if (elapsed >= typingSpeed) {
        lastUpdateRef.current = timestamp;
        currentIndexRef.current = Math.min(
          currentIndexRef.current + charsPerTick,
          text.length
        );
        setDisplayedText(text.slice(0, currentIndexRef.current));
        
        if (currentIndexRef.current >= text.length) {
          setIsTyping(false);
          stopTypingSound();
          return;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      stopAnimation();
      stopTypingSound();
    };
  }, [text, typingSpeed, charsPerTick, stopAnimation, startTypingSound, stopTypingSound]);

  const handleClick = () => {
    if (isTyping) {
      // Skip typing animation - show full text immediately
      stopAnimation();
      stopTypingSound();
      setDisplayedText(text);
      setIsTyping(false);
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm 
        border-t-2 border-white/20 cursor-pointer select-none"
      onClick={handleClick}
    >
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Character name tag - show "Narrator" for narration, otherwise show character name */}
        {(characterName || isNarration) && (
          <div
            className="inline-block px-4 py-1 mb-2 rounded-md font-bold text-lg"
            style={{
              backgroundColor: isNarration ? "#88888820" : `${nameColor}20`,
              color: isNarration ? "#888888" : nameColor,
              borderLeft: `3px solid ${isNarration ? "#888888" : nameColor}`,
            }}
          >
            {isNarration ? (characterName || "Narrator") : characterName}
          </div>
        )}

        {/* Dialogue text */}
        <p
          className={`text-white text-lg md:text-xl leading-relaxed min-h-[80px]
            ${isNarration ? "italic text-gray-300 text-center" : ""}`}
        >
          {displayedText}
          {isTyping && (
            <span className="animate-pulse text-white/50">▌</span>
          )}
        </p>

        {/* Continue indicator */}
        {!isTyping && (
          <div className="text-right mt-2">
            <span className="text-white/50 text-sm animate-bounce inline-block">
              Click to continue ▼
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
