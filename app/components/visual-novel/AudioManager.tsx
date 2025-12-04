"use client";

import { useEffect, useRef, useCallback, useState, createContext, useContext } from "react";

interface AudioContextType {
  playBgm: (src: string, loop?: boolean) => void;
  stopBgm: () => void;
  pauseBgm: () => void;
  resumeBgm: () => void;
  playSfx: (src: string) => void;
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  bgmVolume: number;
  sfxVolume: number;
  isBgmPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  children: React.ReactNode;
  defaultBgmVolume?: number;
  defaultSfxVolume?: number;
}

export function AudioProvider({
  children,
  defaultBgmVolume = 0.3,
  defaultSfxVolume = 0.5,
}: AudioProviderProps) {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [bgmVolume, setBgmVolumeState] = useState(defaultBgmVolume);
  const [sfxVolume, setSfxVolumeState] = useState(defaultSfxVolume);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBgmSrc, setCurrentBgmSrc] = useState<string | null>(null);
  const [pendingBgm, setPendingBgm] = useState<string | null>(null);

  // Initialize BGM audio element
  useEffect(() => {
    if (typeof window !== "undefined" && !bgmRef.current) {
      bgmRef.current = new Audio();
      bgmRef.current.volume = bgmVolume;
    }
  }, []);

  // Handle user interaction to start pending audio (browser autoplay policy)
  useEffect(() => {
    if (!pendingBgm) return;

    const tryPlayPendingAudio = () => {
      if (!pendingBgm || isBgmPlaying) return;
      
      // Create a fresh audio element on user interaction
      const audio = new Audio(pendingBgm);
      audio.loop = true;
      audio.volume = isMuted ? 0 : bgmVolume;
      
      audio.play()
        .then(() => {
          // Replace the ref with the working audio element
          if (bgmRef.current && bgmRef.current !== audio) {
            bgmRef.current.pause();
          }
          bgmRef.current = audio;
          setIsBgmPlaying(true);
          setPendingBgm(null);
          
          // Clear media session to prevent AirPods/media keys from controlling
          if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.setActionHandler("play", null);
            navigator.mediaSession.setActionHandler("pause", null);
          }
        })
        .catch(() => {});
    };

    // Add listeners
    window.addEventListener("click", tryPlayPendingAudio, { once: true });
    window.addEventListener("keydown", tryPlayPendingAudio, { once: true });
    window.addEventListener("touchstart", tryPlayPendingAudio, { once: true });

    return () => {
      window.removeEventListener("click", tryPlayPendingAudio);
      window.removeEventListener("keydown", tryPlayPendingAudio);
      window.removeEventListener("touchstart", tryPlayPendingAudio);
    };
  }, [pendingBgm, isBgmPlaying, bgmVolume, isMuted]);

  // Update BGM volume when it changes
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  const playBgm = useCallback((src: string, loop: boolean = true) => {
    // Prevent duplicate calls for same source
    if (currentBgmSrc === src || pendingBgm === src) {
      return;
    }
    
    if (!bgmRef.current) {
      bgmRef.current = new Audio();
    }

    bgmRef.current.src = src;
    bgmRef.current.loop = loop;
    bgmRef.current.volume = isMuted ? 0 : bgmVolume;
    
    // Handle autoplay restrictions
    const playPromise = bgmRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsBgmPlaying(true);
          setCurrentBgmSrc(src);
          
          // Clear media session to prevent AirPods/media keys from controlling
          if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.setActionHandler("play", null);
            navigator.mediaSession.setActionHandler("pause", null);
          }
        })
        .catch(() => {
          // Store the src so we can try again on user interaction
          setCurrentBgmSrc(src);
          setPendingBgm(src);
        });
    }
  }, [bgmVolume, isMuted, currentBgmSrc, pendingBgm]);

  const stopBgm = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      setIsBgmPlaying(false);
      setCurrentBgmSrc(null);
    }
  }, []);

  const pauseBgm = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      setIsBgmPlaying(false);
    }
  }, []);

  const resumeBgm = useCallback(() => {
    if (bgmRef.current && currentBgmSrc) {
      const playPromise = bgmRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsBgmPlaying(true))
          .catch(() => {});
      }
    }
  }, [currentBgmSrc]);

  const playSfx = useCallback((src: string) => {
    if (isMuted) return;
    
    // Create a new Audio element for each SFX to allow overlapping sounds
    const sfx = new Audio(src);
    sfx.volume = sfxVolume;
    sfx.play().catch(() => {});
  }, [sfxVolume, isMuted]);

  const setBgmVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setBgmVolumeState(clampedVolume);
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setSfxVolumeState(clampedVolume);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const value: AudioContextType = {
    playBgm,
    stopBgm,
    pauseBgm,
    resumeBgm,
    playSfx,
    setBgmVolume,
    setSfxVolume,
    bgmVolume,
    sfxVolume,
    isBgmPlaying,
    isMuted,
    toggleMute,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

// Audio Controls Component for use in game menu
export function AudioControls() {
  const {
    bgmVolume,
    sfxVolume,
    setBgmVolume,
    setSfxVolume,
    isMuted,
    toggleMute,
  } = useAudio();

  return (
    <div className="space-y-4">
      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isMuted ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            Unmute
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            Mute
          </>
        )}
      </button>

      {/* BGM Volume */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm flex justify-between">
          <span>Music Volume</span>
          <span>{Math.round(bgmVolume * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={bgmVolume}
          onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* SFX Volume */}
      <div className="space-y-2">
        <label className="text-gray-300 text-sm flex justify-between">
          <span>Sound Effects</span>
          <span>{Math.round(sfxVolume * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={sfxVolume}
          onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    </div>
  );
}

export default AudioProvider;
