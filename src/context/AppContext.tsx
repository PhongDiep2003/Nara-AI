"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  file: File;
}
interface ParsedSlide {
  slideNumber: string;
  content: string;
}
interface AppContextType {
  uploadedFile: UploadedFile | null;
  script: string;
  setUploadedFile: (file: UploadedFile | null) => void;
  setScript: (script: string) => void;
  selectedSlide: number;
  setSelectedSlide: (slide: number) => void;
  isAudioGenerated: boolean;
  setIsAudioGenerated: (generated: boolean) => void;
  isFinalClipGenerated: boolean;
  setIsFinalClipGenerated: (generated: boolean) => void;
  totalSlides: number;
  setTotalSlides: (total: number) => void;
  parsedSlides: ParsedSlide[];
  setParsedSlides: (slides: ParsedSlide[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [script, setScript] = useState<string>("");
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  const [isAudioGenerated, setIsAudioGenerated] = useState<boolean>(false);
  const [isFinalClipGenerated, setIsFinalClipGenerated] =
    useState<boolean>(false);
  const [totalSlides, setTotalSlides] = useState<number>(0);
  const [parsedSlides, setParsedSlides] = useState<ParsedSlide[]>([]);
  return (
    <AppContext.Provider
      value={{
        uploadedFile,
        script,
        setUploadedFile,
        setScript,
        selectedSlide,
        setSelectedSlide,
        isAudioGenerated,
        setIsAudioGenerated,
        isFinalClipGenerated,
        setIsFinalClipGenerated,
        totalSlides,
        setTotalSlides,
        parsedSlides,
        setParsedSlides,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
};
