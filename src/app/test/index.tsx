"use client";
import { cn } from "@/lib/utils";
import axios from "axios";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { RemoteRunnable } from "@langchain/core/runnables/remote";

interface FileWithPreview extends File {
  preview: string;
  base64?: string; // 新增 base64 屬性
}

const InputPage: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");

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
      "application/pdf": [".pdf"],
      // "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
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
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`上傳文件 ${file.name} 失敗`);
        }

        const result = await response.json();
        return { name: file.name, url: result.fileUrl };
      });

      const fileUrls = await Promise.all(uploadPromises);
      const ids = await saveToMongoDB(fileUrls);
      setIds(ids);
      toast.success("所有文件上傳成功");
      console.log(ids);

      if (ids.length > 0) {
        const promises = ids.map((id: string, index: number) =>
          callDocAgentAPI(id, fileUrls[index].name)
        );
        await Promise.all(promises);
      }
    } catch (error) {
      console.error("上傳文件時出錯:", error);
      toast.error("上傳失敗");
    } finally {
      setLoading(false);
    }
  };

  const callDocAgentAPI = async (fileId: string, fileName: string) => {
    setAgentLoading(true);
    const toastId = toast.loading(`正在轉換 ${fileName}`);
    try {
      const response = await fetch(
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_NGROK_URL + "/docAgent/stream"
          : "http://localhost:9000/docAgent/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid_api_key",
          },
          body: JSON.stringify({
            input: {
              input: `此為新書資料 file_id: ${fileId}`,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value }: any = await reader?.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        fullResponse += chunkText;
        console.log("收到的數據片段:", chunkText);
        // 在這裡可以更新UI，顯示部分響應
        setResult((prev) => prev + chunkText);
      }

      console.log("完整響應:", fullResponse);
      toast.success(`轉換 ${fileName} 成功`);
      toast.dismiss(toastId);

      return fullResponse;
    } catch (error) {
      console.error("調用DocAgent API時出錯:", error);
      toast.error(`轉換 ${fileName} 失敗`);
      toast.dismiss(toastId);
      throw error;
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <button
        className={cn(
          "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
          loading && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => callDocAgentAPI("66d03c3db3bdb368e9bbf2f9", "test")}
      >
        {loading || agentLoading ? "上傳中..." : "確認上傳"}
      </button>
      <div>{result}</div>
    </div>
  );
};

export default InputPage;
