import React, { createContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

type AudioContextType = {
  ambientOn: boolean;
  toggleAmbient: () => void;
};

export const AudioContext = createContext<AudioContextType>({
  ambientOn: false,
  toggleAmbient: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ambientOn, setAmbientOn] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const loadAndPlay = async () => {
    if (soundRef.current) return;

    const { sound } = await Audio.Sound.createAsync(
      require('../asserts/ambient.mp3'), // 🎵 Place your ambient mp3 file here
      {
        isLooping: true,
        volume: 0.2,
        shouldPlay: true,
      }
    );
    soundRef.current = sound;
    await sound.playAsync();
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const toggleAmbient = () => {
    const newVal = !ambientOn;
    setAmbientOn(newVal);
    if (newVal) {
      loadAndPlay();
    } else {
      stopSound();
    }
  };

  useEffect(() => {
    return () => {
      stopSound(); // Clean up when provider unmounts
    };
  }, []);

  return (
    <AudioContext.Provider value={{ ambientOn, toggleAmbient }}>
      {children}
    </AudioContext.Provider>
  );
};
export default AudioProvider;