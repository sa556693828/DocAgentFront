"use client";
import { cn } from "@/lib/utils";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

interface FileWithPreview extends File {
  preview: string;
  base64?: string; // 新增 base64 屬性
}

const InputPage: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);

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
    maxFiles: 5,
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
    const filesWithBase64 = await Promise.all(
      files.map(async (file) => {
        const base64 = await convertFileToBase64(file);
        return { name: file.name, base64 }; // Add base64 data to file object
      })
    );
    setLoading(true);
    try {
      const response = await fetch("/api/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: filesWithBase64.map((file) => ({
            name: file.name,
            base64: file.base64,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("上傳失敗");
      }

      const result = await response.json();
      console.log("result", result.ids);
      toast.success("上傳成功");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("上傳失敗");
    } finally {
      setLoading(false);
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
              className={cn(
                "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
                loading && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleUpload}
            >
              {loading ? "上傳中..." : "確認上傳"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPage;
