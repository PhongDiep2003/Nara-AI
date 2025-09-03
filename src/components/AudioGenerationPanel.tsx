import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const AudioGenerationPanel = () => {
  // Voice reading script
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  // Reading script speed
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const voiceOptions = [
    { value: "alloy", label: "Alloy (Balanced)" },
    { value: "echo", label: "Echo (Male)" },
    { value: "fable", label: "Fable (British)" },
    { value: "onyx", label: "Onyx (Deep)" },
    { value: "nova", label: "Nova (Female)" },
    { value: "shimmer", label: "Shimmer (Soft)" },
  ];
  const { setIsAudioGenerated, setIsFinalClipGenerated, parsedSlides } =
    useAppContext();
  const audioGenerationHandler = async () => {
    setIsAudioGenerated(false);
    setIsFinalClipGenerated(false);
    setIsAudioGenerating(true);

    try {
      for (let i = 0; i < parsedSlides.length; i++) {
        await fetch("http://localhost:8000/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: parsedSlides[i].content,
            voice: selectedVoice,
            speech_rate: String(speechSpeed),
            slide_number: String(parsedSlides[i].slideNumber),
          }),
        });
      }
      setIsAudioGenerated(true);
    } catch (error) {
      console.error("Audio generation failed:", error);
    } finally {
      setIsAudioGenerating(false); // ensure button is re-enabled
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Audio Playback
      </h2>

      {isAudioGenerating && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Analyzing script and generating voice...
            </p>
          </div>
        </div>
      )}

      {!isAudioGenerating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              {voiceOptions.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed: {speechSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center space-x-4">
        <button
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={isAudioGenerating}
          onClick={audioGenerationHandler}
        >
          Generate Voice
        </button>
      </div>
    </div>
  );
};

export default AudioGenerationPanel;
