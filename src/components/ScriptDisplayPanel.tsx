import React, { useState, useEffect } from "react";
import { Edit3, RefreshCw, Save, X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const ScriptDisplayPanel = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingContent, setEditingContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const {
    script,
    setScript,
    uploadedFile,
    selectedSlide,
    setSelectedSlide,
    setIsAudioGenerated,
    setIsFinalClipGenerated,
    setTotalSlides,
    parsedSlides,
    setParsedSlides,
  } = useAppContext();

  useEffect(() => {
    if (script) {
      const parseSlides = (text: string) => {
        const slides = [];

        // Split on "Slide(s)" markers but keep them
        const parts = script.split(/(?=Slide\(s\)\s*\d+)/);

        for (const part of parts) {
          const match = part.match(
            /^Slide\(s\)\s*(\d+)(?:-(\d+))?:\s*([\s\S]*)$/
          );
          if (match) {
            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : start;
            const content = match[3].trim();

            for (let i = start; i <= end; i++) {
              slides.push({
                slideNumber: i.toString(),
                content,
              });
            }
          }
        }

        return slides;
      };
      setParsedSlides(parseSlides(script));
      setTotalSlides(parseSlides.length);
    } else {
      setParsedSlides([]);
      setSelectedSlide(0);
      setTotalSlides(0);
    }
  }, [script]);

  const cleanScriptWithRegex = (text: string) => {
    return (
      text
        // Remove multiple consecutive newlines
        .replace(/\\n\\s*\\n/g, "\\n")
        // Remove leading/trailing whitespace from each line
        .replace(/^[ \\t]+|[ \\t]+$/gm, "")
        // Remove completely empty lines
        .replace(/^\\s*$/gm, "")
        // Remove any remaining multiple newlines
        .replace(/\\n+/g, "\\n")
        .trim()
    );
  };

  const generateScript = async () => {
    try {
      setIsGenerating(true);
      setScript("");
      setIsAudioGenerated(false);
      setIsFinalClipGenerated(false);
      if (uploadedFile && uploadedFile.file) {
        const formData = new FormData();
        formData.append("file", uploadedFile.file);

        const res = await fetch("http://localhost:8000/upload-file", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setScript(formatScriptWithRegex(data.response));
        }
      }
    } catch (error) {
      console.error("Error generating script:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  function formatScriptWithRegex(text: string) {
    const cleaned = cleanScriptWithRegex(text);
    return cleaned
      .split("\\n")
      .map((line, index, array) => {
        if (line.startsWith("Slide(s)")) {
          // Add blank line before slide headers (except for the first one)
          const prefix = index > 0 ? "\\n" : "";
          return prefix + line;
        } else {
          return line;
        }
      })
      .join("\\n");
  }

  const handleSaveEdit = () => {
    if (parsedSlides[selectedSlide]) {
      const updatedSlides = [...parsedSlides];
      updatedSlides[selectedSlide] = {
        ...updatedSlides[selectedSlide],
        content: editingContent,
      };
      setParsedSlides(updatedSlides);
      setTotalSlides(updatedSlides.length);

      // Reconstruct the full script
      const reconstructedScript = updatedSlides
        .map((slide) => `Slide(s) ${slide.slideNumber}:\n${slide.content}`)
        .join("\n\n");

      setScript(reconstructedScript);
      setIsEditing(false);
      setEditingContent("");
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingContent("");
  };

  const handleEditClick = () => {
    if (parsedSlides[selectedSlide]) {
      setEditingContent(parsedSlides[selectedSlide].content);
      setIsEditing(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Generated Script
        </h2>
        <div className="flex items-center space-x-2">
          {script && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? "Cancel" : "Edit"}</span>
            </button>
          )}

          <button
            onClick={generateScript}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={!uploadedFile || isGenerating}
          >
            <RefreshCw
              className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            <span>{isGenerating ? "Generating..." : "Generate Script"}</span>
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Analyzing content and generating script...
            </p>
          </div>
        </div>
      )}

      {script && !isGenerating && parsedSlides.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Script Editor
              </h2>
              <div className="text-sm text-gray-500">
                {parsedSlides.length} slide
                {parsedSlides.length !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>

          <div className="flex h-96">
            {/* Left Sidebar - Slide List */}
            <div className="w-64 border-r bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Slides
                </h3>
                <div className="space-y-2">
                  {parsedSlides.map((slide, index) => (
                    <button
                      disabled={isEditing}
                      key={index}
                      onClick={() => setSelectedSlide(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSlide === index
                          ? "bg-blue-100 border-blue-300 border"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-6 rounded text-xs flex items-center justify-center font-medium ${
                            selectedSlide === index
                              ? "bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {slide.slideNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              selectedSlide === index
                                ? "text-blue-900"
                                : "text-gray-900"
                            }`}
                          >
                            Slide {slide.slideNumber}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {slide.content.substring(0, 40)}...
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Script Display/Edit */}
            <div className="flex-1 flex flex-col">
              {/* Content Header */}
              <div className="px-6 py-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Slide {parsedSlides[selectedSlide]?.slideNumber}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditClick}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6">
                {isEditing ? (
                  <div className="h-full">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full h-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 leading-relaxed"
                      placeholder="Edit the script for this slide..."
                    />
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <div className="bg-gray-50 p-4 rounded-lg h-full">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {parsedSlides[selectedSlide]?.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptDisplayPanel;
