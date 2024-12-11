"use client";
import { cn } from "@/lib/utils";
import axios from "axios";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

interface FileWithPreview extends File {
  preview: string;
  base64?: string; // 新增 base64 屬性
}

const UploadSection: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<"documents" | "spreadsheets">(
    "documents"
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const {
    getRootProps: getDocumentRootProps,
    getInputProps: getDocumentInputProps,
  } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 5,
    accept: {
      // "application/pdf": [".pdf"],
      // "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const {
    getRootProps: getSpreadsheetRootProps,
    getInputProps: getSpreadsheetInputProps,
  } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 5,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  const saveToMongoDB = async (fileInfos: { name: string; url: string }[]) => {
    try {
      const response = await fetch("/api/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: fileInfos.map((file) => ({
            name: file.name,
            url: file.url,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("保存到MongoDB失敗");
      }

      const result = await response.json();
      return result.ids;
    } catch (error) {
      console.error("保存到MongoDB時出錯:", error);
    }
  };
  const handleUpload = async () => {
    setLoading(true);
    const toastId = toast.loading(`正在上傳`);
    try {
      const uploadPromises = files.map(async (file) => {
        setFileStatus((prev) => ({ ...prev, [file.name]: "上傳中" }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          setFileStatus((prev) => ({
            ...prev,
            [file.name]: "上傳失敗，請小於4MB",
          }));
          throw new Error(`上傳文件 ${file.name} 失敗`);
        }

        const result = await response.json();
        setFileStatus((prev) => ({ ...prev, [file.name]: "上傳完成" }));
        return { name: file.name, url: result.fileUrl };
      });

      const fileUrls = await Promise.all(uploadPromises);
      const ids = await saveToMongoDB(fileUrls);
      toast.success("所有文件上傳成功", {
        id: toastId,
      });
      if (ids.length > 0) {
        const promises = ids.map((id: string, index: number) =>
          callDocAgentAPI(id, fileUrls[index].name)
        );
        const results = await Promise.allSettled(promises);

        // 處理結果
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            console.log(`文件 ${fileUrls[index].name} 轉換成功`);
          } else {
            console.error(
              `文件 ${fileUrls[index].name} 轉換失敗:`,
              result.reason
            );
          }
        });
      }
    } catch (error) {
      console.error("上傳文件時出錯:", error);
      toast.error("上傳失敗", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };
  const callDocAgentAPI = async (fileId: string, fileName: string) => {
    setFileStatus((prev) => ({ ...prev, [fileName]: "轉換中" }));
    setAgentLoading(true);
    const toastId = toast.loading(`正在轉換 ${fileName}`);
    try {
      const url = process.env.NEXT_PUBLIC_NGROK_URL + "/transformV2";
      const axiosInstance = axios.create({
        timeout: 600000,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid_api_key",
        },
      });

      const res = await axiosInstance.post(url, {
        file_id: fileId,
      });
      if (res.data.error) {
        throw new Error(res.data.error);
      }
      toast.success(`轉換 ${fileName} 成功`, {
        id: toastId,
      });
      toast.dismiss(toastId);
      setFileStatus((prev) => ({ ...prev, [fileName]: "轉換完成" }));
      return res.data;
    } catch (error: any) {
      setFileStatus((prev) => ({ ...prev, [fileName]: "轉換失敗" }));
      console.error("調用DocAgent API時出錯:", error.response.data.error);
      toast.error(`轉換 ${fileName} 過長或失敗: ${error.response.data.error}`, {
        id: toastId,
      });
      toast.dismiss(toastId);
      throw error;
    } finally {
      setAgentLoading(false);
    }
  };
  const handleReupload = () => {
    setFiles([]);
    setFileStatus({});
  };

  return (
    <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${
              activeTab === "documents"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("documents")}
          >
            文檔上傳 V3
          </button>
        </div>
      </div>
      {files.length === 0 ? (
        <div
          {...(activeTab === "documents"
            ? getDocumentRootProps()
            : getSpreadsheetRootProps())}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <input
            {...(activeTab === "documents"
              ? getDocumentInputProps()
              : getSpreadsheetInputProps())}
          />
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
          <p className="text-gray-600 whitespace-pre-wrap mb-2">
            {activeTab === "documents"
              ? "上傳 .DOCX 文檔"
              : // ? "上傳文檔 (PDF, DOCX)\n請將 .doc 轉成 .docx 再做使用\n以便提高準確率"
                "上傳表格 (XLSX, XLS, CSV)"}
          </p>
          <p className="text-gray-400 text-sm">最多5筆</p>
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
                <span className="text-gray-700">{file.name.split(".")[0]}</span>
                <span className="text-sm text-gray-500">
                  {fileStatus[file.name] || "等待上傳"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div className="mt-6 text-center flex justify-center gap-4">
          <button
            className={cn(
              "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded",
              loading || agentLoading ? "opacity-50 cursor-not-allowed" : ""
            )}
            onClick={handleReupload}
            disabled={loading || agentLoading}
          >
            重新上傳
          </button>
          <button
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
              loading && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handleUpload()}
          >
            {loading || agentLoading ? "上傳中..." : "確認上傳"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
