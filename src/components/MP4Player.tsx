import React, { useState, useRef, useEffect } from "react";

interface MP4PlayerProps {
  videoSrc: string;
  className?: string;
}

const MP4Player: React.FC<MP4PlayerProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoadedMetadata = () => {
      setIsLoaded(true);
    };

    const handleLoadStart = () => {
      setIsLoaded(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadstart", handleLoadStart);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadstart", handleLoadStart);
    };
  }, [videoSrc]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden `}>
      {/* Video Element */}
      <video ref={videoRef} src={videoSrc} autoPlay={false} controls />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MP4Player;
