"use client";
import React, { useState } from "react";
import MP3Player from "../components/MP3Player";
import AudioGenerationPanel from "../components/AudioGenerationPanel";
import FileUpload from "../components/FileUpload";
import ScriptDisplayPanel from "../components/ScriptDisplayPanel";
import MP4Player from "../components/MP4Player";
import NavBar from "../components/NavBar";
import { useAppContext } from "@/context/AppContext";

const PresentationDemoApp = () => {
  const {
    script,
    selectedSlide,
    isAudioGenerated,
    isFinalClipGenerated,
    setIsFinalClipGenerated,
  } = useAppContext();
  const [isFinalClipGenerating, setIsFinalClipGenerating] = useState(false);
  const generateFinalClipHandler = async () => {
    setIsFinalClipGenerating(true);
    setIsFinalClipGenerated(false);

    try {
      await fetch("http://localhost:8000/final-presentation-generation", {
        method: "POST",
      });
      setIsFinalClipGenerated(true);
    } catch (error) {
      console.error("Final presentation generation failed:", error);
    } finally {
      setIsFinalClipGenerating(false); // ensure button is re-enabled
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Bar */}
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          {/* Main Content */}
          <div className="space-y-8">
            {/* File Upload Section */}
            <FileUpload />
            {/* Script Generation */}
            <ScriptDisplayPanel />
            {/* Audio Generation */}
            {script && <AudioGenerationPanel />}
            {isAudioGenerated && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Audio Playback
                  </h2>
                </div>

                <div className="bg-white ">
                  <div className="flex">
                    {/* Right Content - Script Display/Edit */}
                    <div className="flex-1 flex flex-col">
                      {/* Content Header */}
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            Slide {selectedSlide + 1} Narration
                          </h3>
                        </div>
                      </div>
                      {/* Video Playback */}

                      {!isFinalClipGenerating && (
                        <MP3Player
                          audioSrc={`/script_speech/speech_slide_${
                            selectedSlide + 1
                          }.mp3`}
                        />
                      )}

                      {isFinalClipGenerating && (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">
                              Injecting voice into slides and generating final
                              presentation...
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center ">
                        <button
                          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={generateFinalClipHandler}
                        >
                          Generate Final Presentation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isFinalClipGenerated && (
              <MP4Player videoSrc="/final_presentation.mp4" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationDemoApp;
