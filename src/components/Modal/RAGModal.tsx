"use client";
import React, { useCallback, useEffect, useState } from "react";
import { BookArticleData, BookData } from "@/types/books";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
interface FileWithPreview extends File {
  preview: string;
  base64?: string; // 新增 base64 屬性
}
interface RAGModalProps {
  selectedRow: BookData;
}
const RAGModal: React.FC<RAGModalProps> = ({ selectedRow }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [message, setMessage] = useState("");
  const [articleId, setArticleId] = useState<string[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [firstArticle, setFirstArticle] = useState("");
  const [secondArticle, setSecondArticle] = useState("");
  const [thirdArticle, setThirdArticle] = useState("");

  const fetchBookArticle = async (bookId: string) => {
    try {
      const response = await fetch(
        `/api/book_article?book_id=${bookId}&type=RAG`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = (await response.json()) as BookArticleData[];
      if (data.length === 0) {
        return;
      }
      setFirstArticle(data[0]["Content-oriented"]);
      setSecondArticle(data[0]["Promotional"]);
      setThirdArticle(data[0]["Threat-based"]);
      setGenerated(true);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchBookArticle(selectedRow._id);
  }, [selectedRow._id]);
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
    multiple: false,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });
  const uploadFile = async () => {
    if (!files) {
      setMessage("請選擇一個文件");
      return;
    }
    const toastId = toast.loading(`正在解析、上傳此篇文件`);
    const formData = new FormData();
    formData.append("file", files[0]);

    setUploadLoading(true);
    try {
      const response = await axios.post(
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_API_URL + "/upload"
          : "http://localhost:9000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      setUploadSuccess(true);
      setArticleId(response.data.article_id);
      // setFiles([]);
      toast.success(`上傳成功`);
      toast.dismiss(toastId);
    } catch (error: any) {
      toast.error(`上傳失敗`);
      toast.dismiss(toastId);
      setUploadSuccess(false);
      setMessage(error.response?.data?.error || "failed");
    } finally {
      setUploadLoading(false);
    }
  };
  const deleteArticle = async (bookId: string) => {
    if (!bookId) return;
    try {
      const response = await fetch(
        `/api/book_article?book_id=${bookId}&type=RAG`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "刪除文章時發生錯誤");
      }

      const result = await response.json();
      if (result.success) {
        setFirstArticle("");
        setSecondArticle("");
        setThirdArticle("");
        setGenerated(false);
        setUploadSuccess(false);
      }
    } catch (error) {
      console.error("刪除文章時發生錯誤:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "未知錯誤",
      };
    }
  };
  const generateArticle = async () => {
    if (!selectedRow) return;
    const toastId = toast.loading(`正在根據上傳的文件生成三種推薦文`);

    setAgentLoading(true);
    try {
      const response = await axios.post(
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_API_URL + "/generate_article"
          : "http://localhost:9000/generate_article",
        {
          book_id: selectedRow._id,
          article_id: articleId,
          custom_style: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid_api_key",
          },
        }
      );

      const data = response.data;
      if (data.articles && Array.isArray(data.articles)) {
        const firstArticle = data.articles[0];
        const secondArticle = data.articles[1];
        const thirdArticle = data.articles[2];
        setFirstArticle(firstArticle.content);
        setSecondArticle(secondArticle.content);
        setThirdArticle(thirdArticle.content);
        setGenerated(true);
        toast.success(`生成推薦文成功`);
        toast.dismiss(toastId);
      } else {
        throw new Error("未收到預期的內容");
      }
    } catch (error) {
      console.error("Error calling AI backend:", error);
      toast.error(`生成推薦文失敗: ${error}`);
      toast.dismiss(toastId);
      setGenerated(false);
    } finally {
      setAgentLoading(false);
    }
  };
  return (
    <div className="w-full gap-4 flex flex-col">
      {selectedRow && (
        <div className="w-full gap-4">
          <h1 className="text-xl font-semibold">所選書籍：</h1>
          <div className="flex flex-col gap-2">
            <pre className="whitespace-pre-wrap pl-4 text-lg">
              書名：{selectedRow.content["主要商品名稱"]}
            </pre>
          </div>
        </div>
      )}
      {uploadSuccess ? (
        <div className="flex flex-col gap-2">{/* <p>上傳成功</p> */}</div>
      ) : files.length === 0 ? (
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
          <p className="text-gray-600 mb-2">上傳你想作為參考的範本</p>
          <p className="text-gray-400 text-sm">最多1筆</p>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          <h2 className="text-xl font-semibold text-center mb-4">
            你已經上傳 {files.length} 筆資料
          </h2>
          <div className="mx-auto flex flex-col gap-2">
            {files.map((file, index) => (
              <div key={file.name} className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm uppercase">
                  {file.name.split(".")[1]}
                </div>
                <span className="text-gray-700">{file.name.split(".")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {generated ? (
        <div className="overflow-y-auto max-h-[50vh] px-2 my-4 gap-4 flex flex-col">
          {firstArticle && (
            <div className="flex flex-col gap-2 border-b border-gray-700 pb-4">
              <h1 className="text-xl font-semibold">推薦文一（內容導向）：</h1>
              <pre className="whitespace-pre-wrap pl-4 text-lg">
                {firstArticle}
              </pre>
            </div>
          )}
          {secondArticle && (
            <div className="flex flex-col gap-2 border-b border-gray-700 pb-4">
              <h1 className="text-xl font-semibold">推薦文二（促銷）：</h1>
              <pre className="whitespace-pre-wrap pl-4 text-lg">
                {secondArticle}
              </pre>
            </div>
          )}
          {thirdArticle && (
            <div className="flex flex-col gap-2 border-gray-700 pb-4">
              <h1 className="text-xl font-semibold">推薦文三（FOMO心態）：</h1>
              <pre className="whitespace-pre-wrap pl-4 text-lg">
                {thirdArticle}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[50vh] flex justify-center items-center my-4 gap-4">
          {/* <p className="text-xl font-semibold">請先上傳文件</p> */}
        </div>
      )}
      {uploadSuccess ? (
        <button
          onClick={
            generated
              ? () => deleteArticle(selectedRow!._id)
              : () => generateArticle()
          }
          disabled={agentLoading}
          className={cn(
            "bg-indigo-500 text-white px-4 py-2 text-xl w-1/2 mx-auto rounded hover:bg-indigo-600 transition-colors",
            agentLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {agentLoading ? "產生中..." : generated ? "重新產生" : "生成推薦文"}
        </button>
      ) : (
        <div className="mt-6 text-center flex gap-4 justify-center">
          <button
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
              uploadLoading && "opacity-50 cursor-not-allowed"
            )}
            disabled={uploadLoading}
            onClick={() => setFiles([])}
          >
            重新上傳
          </button>
          <button
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
              uploadLoading ||
                (files.length === 0 && "opacity-50 cursor-not-allowed")
            )}
            disabled={uploadLoading || files.length === 0}
            onClick={() => uploadFile()}
          >
            {agentLoading || uploadLoading ? "上傳中..." : "確認上傳"}
          </button>
        </div>
      )}
    </div>
  );
};

export default RAGModal;
