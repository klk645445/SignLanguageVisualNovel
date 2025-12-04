"use client";

import { Character } from "@/app/types/visual-novel";
import Image from "next/image";

interface CharacterSpriteProps {
  character: Character;
  expression?: string;
  position: "left" | "center" | "right";
  isActive?: boolean;
  scale?: number; // Scale multiplier (1 = 100%, 0.5 = 50%, 2 = 200%)
  offsetX?: number; // Horizontal offset in pixels (positive = right, negative = left)
  offsetY?: number; // Vertical offset in pixels (positive = up, negative = down)
}

export default function CharacterSprite({
  character,
  expression,
  position,
  isActive = false,
  scale,
  offsetX = 0,
  offsetY = 0,
}: CharacterSpriteProps) {
  const currentExpression = expression || character.defaultExpression;
  const spriteUrl = character.sprites[currentExpression] || character.sprites[character.defaultExpression];
  
  // Use provided scale, fall back to character default, then to 1
  const finalScale = scale ?? character.scale ?? 1;
  
  // Calculate dimensions based on scale
  const baseWidth = 256; // md:w-64 = 256px
  const baseHeight = 384; // md:h-96 = 384px
  const scaledWidth = baseWidth * finalScale;
  const scaledHeight = baseHeight * finalScale;

  // Position styles
  const positionStyles = {
    left: "left-[5%] translate-x-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-[5%] translate-x-0",
  };

  // If no sprite URL, render a placeholder
  if (!spriteUrl) {
    return (
      <div
        className={`absolute bottom-0 ${position === "right" ? "right-[5%]" : positionStyles[position]} 
          transition-all duration-300 ease-in-out
          ${isActive ? "brightness-100" : "brightness-75"}`}
        style={{
          transform: `${position === "center" ? "translateX(-50%)" : ""} scale(${isActive ? finalScale * 1.05 : finalScale})`,
          transformOrigin: "bottom center",
        }}
      >
        <div 
          className="bg-gradient-to-t from-purple-500/50 to-transparent rounded-t-full flex items-end justify-center pb-4"
          style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}
        >
          <span className="text-white font-semibold text-lg">{character.displayName}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute bottom-0 ${position === "right" ? "right-[5%]" : positionStyles[position]}
        transition-all duration-300 ease-in-out
        ${isActive ? "brightness-100 z-10" : "brightness-75 z-0"}`}
      style={{
        transform: `${position === "center" ? "translateX(-50%)" : ""} scale(${isActive ? finalScale * 1.05 : finalScale}) translateX(${offsetX}px) translateY(${-offsetY}px)`,
        transformOrigin: "bottom center",
      }}
    >
      <div className="relative" style={{ width: `${baseWidth}px`, height: `${baseHeight}px` }}>
        <Image
          src={spriteUrl}
          alt={`${character.displayName} - ${currentExpression}`}
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
}
