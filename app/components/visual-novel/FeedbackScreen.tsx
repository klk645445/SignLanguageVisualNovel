"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FeedbackEntry } from "@/app/types/visual-novel";

interface Recommendations {
  overallAssessment: string;
  strengths: string[];
  areasForImprovement: string[];
  tips: string[];
  encouragement: string;
}

interface FeedbackScreenProps {
  feedback: FeedbackEntry[];
  playerName: string;
  finalScore: number;
  onRestart: () => void;
  onClose: () => void;
}

export default function FeedbackScreen({
  feedback,
  playerName,
  finalScore,
  onRestart,
  onClose,
}: FeedbackScreenProps) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/gemini/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedback,
            playerName,
            finalScore,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get recommendations");
        }

        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (feedback.length > 0) {
      fetchRecommendations();
    } else {
      setIsLoading(false);
      setRecommendations({
        overallAssessment: "You completed the game!",
        strengths: ["You finished the story"],
        areasForImprovement: ["Try interacting more with LK next time"],
        tips: ["Be patient when communicating with deaf individuals"],
        encouragement: "Great job!",
      });
    }
  }, [feedback, playerName, finalScore]);

  // Count ratings
  const goodCount = feedback.filter((f) => f.rating === "good").length;
  const neutralCount = feedback.filter((f) => f.rating === "neutral").length;
  const badCount = feedback.filter((f) => f.rating === "bad").length;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background Image - Fixed to cover entire viewport */}
      <Image
        src="/background.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      
      {/* Scrollable Content Container */}
      <div className="absolute inset-0 overflow-auto">
        <div className="relative z-10 min-h-full flex flex-col items-center justify-start py-12 px-4">
        
        {/* Logo */}
        <div className="mb-6 w-full max-w-md">
          <Image
            src="/common_ground_logo.png"
            alt="Common Ground"
            width={500}
            height={250}
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] w-full h-auto"
            priority
          />
        </div>
        
        <div className="max-w-2xl w-full space-y-5">
          {/* Header */}
          <div className="text-center mb-2 bg-black/80 backdrop-blur-sm rounded-2xl p-4">
            <h1 className="text-3xl font-bold text-amber-100 mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Game Complete!
            </h1>
            <p className="text-amber-200/90 text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Great job, {playerName}!
            </p>
          </div>

          {/* Score Summary */}
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-amber-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <h2 className="text-xl font-bold text-amber-100 mb-4 text-center drop-shadow-md">
              Your Results
            </h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-amber-800/40 rounded-xl p-4 text-center border border-amber-600/30">
                <p className="text-amber-300 text-3xl font-bold drop-shadow-md">{finalScore}</p>
                <p className="text-amber-200/70 text-sm">Relationship Score</p>
              </div>
              <div className="bg-amber-800/40 rounded-xl p-4 text-center border border-amber-600/30">
                <p className="text-amber-300 text-3xl font-bold drop-shadow-md">{feedback.length}</p>
                <p className="text-amber-200/70 text-sm">Interactions</p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="flex justify-center gap-8 mt-4 pt-3 border-t border-amber-700/30">
              <div className="text-center">
                <span className="text-emerald-400 text-2xl font-bold drop-shadow-md">{goodCount}</span>
                <p className="text-amber-200/60 text-xs">Good</p>
              </div>
              <div className="text-center">
                <span className="text-yellow-400 text-2xl font-bold drop-shadow-md">{neutralCount}</span>
                <p className="text-amber-200/60 text-xs">Neutral</p>
              </div>
              <div className="text-center">
                <span className="text-rose-400 text-2xl font-bold drop-shadow-md">{badCount}</span>
                <p className="text-amber-200/60 text-xs">Bad</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {isLoading ? (
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-700/50 text-center shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-amber-200">Generating personalized feedback...</p>
            </div>
          ) : error ? (
            <div className="bg-black/80 rounded-2xl p-6 border-2 border-rose-700/50 text-center shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <p className="text-rose-300">{error}</p>
            </div>
          ) : recommendations ? (
            <>
              {/* Overall Assessment */}
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-amber-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <h2 className="text-lg font-bold text-amber-100 mb-3 drop-shadow-md">Overall Assessment</h2>
                <p className="text-amber-200/90 leading-relaxed">{recommendations.overallAssessment}</p>
              </div>

              {/* Strengths */}
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-emerald-700/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <h2 className="text-lg font-bold text-emerald-300 mb-3 drop-shadow-md">What You Did Well</h2>
                <ul className="space-y-2">
                  {recommendations.strengths.map((strength, index) => (
                    <li key={index} className="text-emerald-100/90 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-700/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <h2 className="text-lg font-bold text-orange-300 mb-3 drop-shadow-md">Areas to Improve</h2>
                <ul className="space-y-2">
                  {recommendations.areasForImprovement.map((area, index) => (
                    <li key={index} className="text-orange-100/90 flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-sky-700/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <h2 className="text-lg font-bold text-sky-300 mb-3 drop-shadow-md">Tips for Real Life</h2>
                <ul className="space-y-2">
                  {recommendations.tips.map((tip, index) => (
                    <li key={index} className="text-sky-100/90 flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">{index + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Encouragement */}
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-violet-700/40 text-center shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <p className="text-lg text-violet-200 italic leading-relaxed">&quot;{recommendations.encouragement}&quot;</p>
              </div>
            </>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2 pb-8">
            <button
              onClick={onRestart}
              className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] border-2 border-amber-500/50"
            >
              Play Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-black/70 hover:bg-black/80 text-amber-200 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-amber-700/50"
            >
              Close
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
