"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileWithPreview extends File {
  preview: string;
  base64?: string; // 新增 base64 屬性
}

const InputPage: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 10,
    accept: {
      "application/msword": [".doc", ".pdf", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  // Function to convert file to Base64
  const convertFileToBase64 = (file: FileWithPreview) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to handle file upload
  const handleUpload = async () => {
    // Convert all files to base64
    const filesWithBase64 = await Promise.all(
      files.map(async (file) => {
        const base64 = await convertFileToBase64(file);
        return { ...file, base64 }; // Add base64 data to file object
      })
    );

    // Call API to upload files
    try {
      const response = await fetch("/api/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: filesWithBase64.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            base64: file.base64,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      alert("Upload successful!");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        {files.length === 0 ? (
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <input {...getInputProps()} />
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-2">上傳資料 並可批量上傳</p>
            <p className="text-gray-400 text-sm">最多10筆</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-4">
              你已經上傳 {files.length} 筆資料
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, index) => (
                <div key={file.name} className="flex items-center space-x-2">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm uppercase">
                    {file.name.split(".")[1]}
                  </div>
                  <span className="text-gray-700">
                    {file.name.split(".")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-6 text-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              onClick={handleUpload} // Call the new handleUpload function
            >
              確認上傳
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPage;
