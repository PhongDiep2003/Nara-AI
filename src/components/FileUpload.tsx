import React, { useRef } from "react";
import { Presentation, Trash2, Upload } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
const FileUpload = () => {
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadedFile,
    setUploadedFile,
    setScript,
    setIsAudioGenerated,
    setIsFinalClipGenerated,
  } = useAppContext();

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if file is selected and its type is pptx
    if (
      e.target.files &&
      e.target.files.length > 0 &&
      e.target.files[0].type ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      const file = e.target.files[0];
      setUploadedFile({
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
    } else {
      setUploadedFile(null);
    }
  };

  // Remove file
  const removeFile = async () => {
    try {
      await fetch("http://localhost:8000/clean-up");
      setUploadedFile(null);
      setScript("");
      setIsAudioGenerated(false);
      setIsFinalClipGenerated(false);
    } catch (error) {
      console.log("Error in cleaning up dirs and files", error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: any) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex flex-row justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upload Presentation Materials
        </h2>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pptx"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-600 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Support: PowerPoint Documents
        </p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={!!uploadedFile}
        >
          Choose Files
        </button>
      </div>

      {/* Uploaded Files */}
      {uploadedFile && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Files
          </h3>
          <div className="space-y-2">
            <div
              key={uploadedFile.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Presentation className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile()}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
