import React, { useState, useRef, useEffect } from "react";
interface Mp3PlayerProps {
  audioSrc: string;
}

const MP3Player: React.FC<Mp3PlayerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setIsLoaded(true);
    };

    const handleLoadStart = () => {
      setIsLoaded(false);
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [audioSrc]);

  return (
    <div className={`bg-white rounded-lg border p-4  mb-4`}>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        className="w-full"
        controls
        preload="metadata"
      />
    </div>
  );
};

export default MP3Player;
