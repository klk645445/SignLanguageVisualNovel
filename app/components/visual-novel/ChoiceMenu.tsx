"use client";

import { Choice } from "@/app/types/visual-novel";
import { useAudio } from "./AudioManager";

interface ChoiceMenuProps {
  prompt?: string;
  choices: Choice[];
  onSelect: (choice: Choice) => void;
  variables?: { [key: string]: string | number | boolean };
}

export default function ChoiceMenu({
  prompt,
  choices,
  onSelect,
  variables = {},
}: ChoiceMenuProps) {
  const { playSfx } = useAudio();

  // Filter choices based on conditions
  const availableChoices = choices.filter((choice) => {
    if (!choice.condition) return true;

    const { variable, operator, value } = choice.condition;
    const currentValue = variables[variable];

    switch (operator) {
      case "==":
        return currentValue === value;
      case "!=":
        return currentValue !== value;
      case ">":
        return Number(currentValue) > Number(value);
      case "<":
        return Number(currentValue) < Number(value);
      case ">=":
        return Number(currentValue) >= Number(value);
      case "<=":
        return Number(currentValue) <= Number(value);
      default:
        return true;
    }
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-2xl w-full mx-4 p-6 bg-black/80 rounded-xl border border-white/20">
        {prompt && (
          <p className="text-white text-center text-xl mb-6 italic">{prompt}</p>
        )}

        <div className="space-y-3">
          {availableChoices.map((choice, index) => (
            <button
              key={choice.id}
              onClick={() => {
                playSfx("/audio/button_click.mp3");
                onSelect(choice);
              }}
              className="w-full p-4 text-left text-white bg-white/10 hover:bg-white/20 
                rounded-lg border border-white/20 hover:border-white/40
                transition-all duration-200 ease-in-out
                transform hover:scale-[1.02] hover:translate-x-2
                focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <span className="text-purple-400 font-bold mr-3">
                {index + 1}.
              </span>
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
