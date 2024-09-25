"use client";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { BookType } from "@/types/books";
import { keyConfig, StandardFormat } from "@/constant/standard";
import { Table, Tooltip, Input, Button, Modal } from "antd";

const OutputPage: React.FC = () => {
  const [data, setData] = useState<BookType[]>([]);
  const [selectedRow, setSelectedRow] = useState<BookType | null>(null); // State for selected row
  const [writingStyle, setWritingStyle] = useState(""); // State for writing style input
  const [isModalVisible, setIsModalVisible] = useState(false); // State for Modal visibility
  const [loading, setLoading] = useState(false); // State for loading
  const [aiResponse, setAiResponse] = useState(""); // State for AI response

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/books");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const keyArray = Object.keys(StandardFormat);
  const wrapperStyle: React.CSSProperties = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
  };

  const columns: TableProps<BookType>["columns"] = keyArray.map((key) => {
    const baseColumn = {
      title: keyConfig[key]?.name || key,
      dataIndex: key,
      key: key,
      ellipsis: true,
      width: keyConfig[key]?.w || 150,
      className: "text-base",
    };

    if (
      key === "商品簡介" ||
      key === "作者簡介" ||
      key === "目錄／曲目" ||
      key === "內文試閱" ||
      key === "前言／序" ||
      key === "譯者簡介" ||
      key === "媒体推薦" ||
      key === "名人推薦" ||
      key === "得獎紀錄"
    ) {
      return {
        ...baseColumn,
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip
            title={text}
            placement="topLeft"
            overlayStyle={{ maxWidth: "50%" }}
          >
            <div
              style={{
                ...wrapperStyle,
                maxHeight: "100px",
                overflow: "hidden",
              }}
            >
              {text || "-"}
            </div>
          </Tooltip>
        ),
      };
    }
    return {
      ...baseColumn,
      render: (text) => <div style={wrapperStyle}>{text || "-"}</div>,
    };
  });

  // Handler for row click
  const onRowClick = (record: BookType) => {
    setSelectedRow(record); // Set the selected row data
    setIsModalVisible(true); // Show modal
    setAiResponse(""); // Clear AI response on new row selection
  };

  // Handler for writing style input change
  const handleWritingStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWritingStyle(e.target.value); // Update writing style input
  };

  // Function to handle backend AI call when submitting writing style
  const handleSubmitWritingStyle = async () => {
    if (!selectedRow || !writingStyle) return;
  
    setLoading(true);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/users/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `Analyze the book ${selectedRow["主要商品名稱"]} based on the writing style: ${writingStyle}`,
          book_name: selectedRow["主要商品名稱"], // Book name
          intro: selectedRow["簡介"],          // 簡介 (intro)
          product_intro: selectedRow["商品簡介"], // 商品簡介 (product intro)
          catalog: selectedRow["目錄／曲目"],     // 目錄／曲目 (catalog)
          keywords: selectedRow["關鍵字詞"],     // 關鍵字詞 (keywords)
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }
  
      // Reading the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedChunks = ""; // Store the accumulated chunks
      let fullContent = ""; // This will store the final content
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        // Decode the current chunk value and accumulate it
        accumulatedChunks += decoder.decode(value, { stream: true });
  
        // Split by newlines, because the backend is sending multiple JSON objects separated by newlines
        const lines = accumulatedChunks.split("\n");
        accumulatedChunks = lines.pop(); // Keep any incomplete line for the next loop
  
        // Parse each complete JSON object and check for 'full_content'
        for (const line of lines) {
          try {
            const jsonChunk = JSON.parse(line.trim());
  
            // If the chunk has the 'full_content' field, store it
            if (jsonChunk && jsonChunk.full_content) {
              fullContent = jsonChunk.full_content;
            }
          } catch (err) {
            console.error("Error parsing JSON chunk:", err);
          }
        }
      }
  
      // After stream reading is complete, process any remaining chunk if it's valid JSON
      if (accumulatedChunks) {
        try {
          const finalJsonChunk = JSON.parse(accumulatedChunks.trim());
          if (finalJsonChunk && finalJsonChunk.full_content) {
            fullContent = finalJsonChunk.full_content;
          }
        } catch (err) {
          console.error("Error parsing final JSON chunk:", err);
        }
      }
  
      // Set the AI response with the final full content
      setAiResponse(fullContent || "No content received");
  
      // Log the full content for debugging
      console.log("Full content received:", fullContent);
  
    } catch (error) {
      console.error("Error calling AI backend:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Close modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setWritingStyle(""); // Reset writing style input
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-6">
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
            // onClick={exportToCSV}
          >
            輸出標準格式
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4">已上傳表格</h2>

        <style jsx global>{`
          .ant-table-container table > thead > tr:first-child th {
            border-right: 1px solid #f0f0f0;
          }
          .ant-table-container table > thead > tr:first-child th:last-child {
            border-right: none;
          }
          .ant-table-container table > tbody > tr > td {
            border-right: 1px solid #f0f0f0;
            max-height: 100px;
            overflow: hidden;
          }
          .ant-table-container table > tbody > tr > td:last-child {
            border-right: none;
          }
        `}</style>

        <Table
          pagination={{ pageSize: 10 }}
          columns={columns}
          dataSource={data}
          rowKey={(row) => row._id}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => onRowClick(record), // On row click, show modal
          })}
          className="whitespace-pre-wrap"
        />

        {/* Modal to show row content and input writing style */}
        <Modal
          title="Selected Book Details"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="cancel" onClick={handleModalClose}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSubmitWritingStyle}
            >
              Submit Writing Style
            </Button>,
          ]}
        >
          {selectedRow && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Book Information:</h3>

              {/* Conditionally display AI response or original book details */}
              {aiResponse ? (
                <div>
                  <h4>AI Generated Response:</h4>
                  <pre className="whitespace-pre-wrap">{aiResponse}</pre>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(selectedRow, null, 2)}
                </pre>
              )}

              {/* Writing Style Input */}
              <Input
                placeholder="Enter writing style"
                value={writingStyle}
                onChange={handleWritingStyleChange}
                className="mt-4"
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default OutputPage;
