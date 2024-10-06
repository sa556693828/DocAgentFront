"use client";
import React, { useEffect, useState } from "react";
import { BookArticleData, BookData } from "@/types/books";
import { Modal } from "antd";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import axios from "axios";

interface NormalModalProps {
  selectedRow: BookData;
}
const NormalModal: React.FC<NormalModalProps> = ({ selectedRow }) => {
  const [generated, setGenerated] = useState(false);
  const [firstArticle, setFirstArticle] = useState("");
  const [secondArticle, setSecondArticle] = useState("");
  const [thirdArticle, setThirdArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchBookArticle = async (bookId: string) => {
    try {
      const response = await fetch(
        `/api/book_article?book_id=${bookId}&type=normal`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = (await response.json()) as BookArticleData[];
      if (data.length === 0) {
        setFirstArticle("");
        setSecondArticle("");
        setThirdArticle("");
        setGenerated(false);
        return;
      }
      setFirstArticle(data[0]["Content-oriented"]);
      setSecondArticle(data[0]["Promotional"]);
      setThirdArticle(data[0]["Threat-based"]);
      setGenerated(true);
    } catch (error) {
      setFirstArticle("");
      setSecondArticle("");
      setThirdArticle("");
      setGenerated(false);
      console.error("Error fetching data:", error);
    }
  };
  const deleteArticle = async (bookId: string) => {
    if (!bookId) return;
    try {
      const response = await fetch(
        `/api/book_article?book_id=${bookId}&type=normal`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除文章时发生错误");
      }

      const result = await response.json();
      if (result.success) {
        setFirstArticle("");
        setSecondArticle("");
        setThirdArticle("");
        setGenerated(false);
      }
    } catch (error) {
      console.error("删除文章时发生错误:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "未知错误",
      };
    }
  };

  const generateArticle = async () => {
    if (!selectedRow) return;
    const toastId = toast.loading(`正在生成推薦文`);

    setLoading(true);
    try {
      const response = await axios.post(
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_NGROK_URL + "/generate_article"
          : "http://localhost:9000/generate_article",
        {
          book_id: selectedRow._id,
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
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(selectedRow);
    fetchBookArticle(selectedRow._id);
  }, [selectedRow, selectedRow._id]);
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
          <p className="text-xl font-semibold">尚未生成推薦文</p>
        </div>
      )}
      <button
        onClick={
          generated
            ? () => deleteArticle(selectedRow!._id)
            : () => generateArticle()
        }
        disabled={loading}
        className={cn(
          "bg-indigo-500 text-white px-4 py-2 text-xl w-1/2 mx-auto rounded hover:bg-indigo-600 transition-colors",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        {loading ? "產生中..." : generated ? "重新產生" : "生成推薦文"}
      </button>
    </div>
  );
};

export default NormalModal;
