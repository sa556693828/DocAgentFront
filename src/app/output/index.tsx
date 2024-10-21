"use client";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { BookArticleData, BookData, BookType } from "@/types/books";
import { keyConfig, StandardFormat } from "@/constant/standard";
import { Table, Tooltip, Input, Button, Modal } from "antd";
import { cn } from "@/lib/utils";
import axios from "axios";
import toast from "react-hot-toast";
import NormalModal from "@/components/Modal/NormalModal";
import RAGModal from "@/components/Modal/RAGModal";

const OutputPage: React.FC = () => {
  const [data, setData] = useState<BookData[]>([]);
  const [selectedRow, setSelectedRow] = useState<BookData | null>(null); // State for selected row
  const [isModalVisible, setIsModalVisible] = useState(false); // State for Modal visibility
  const [mode, setMode] = useState<"normal" | "RAG">("normal");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BookData | null>(null);
  const fetchData = async () => {
    try {
      const response = await fetch("/api/books");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = (await response.json()) as BookData[];
      data.reverse();
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = async (record: BookData) => {
    try {
      console.log(record);
      const response = await axios.put(`/api/books/${record._id}`, {
        // 這裡放入你要更新的數據
        supplier_name: record.supplier_name,
        content: record.content,
      });

      if (response.status === 200) {
        toast.success("書籍資訊更新成功");
        fetchData();
      }
    } catch (error) {
      console.error("更新書籍資訊時出錯:", error);
      toast.error("更新書籍資訊失敗");
    }
  };
  const handleEditClick = (record: BookData) => {
    setEditingRecord(record);
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
  };

  const keyArray = ["supplier_name", ...Object.keys(StandardFormat.content)];
  const wrapperStyle: React.CSSProperties = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
  };
  const columns: TableProps<BookData>["columns"] = [
    {
      title: "操作",
      key: "action",
      fixed: "left",
      width: 100,
      render: (_, record) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(record);
          }}
        >
          編輯
        </Button>
      ),
    },
    ...keyArray.map((key) => {
      const baseColumn = {
        title: keyConfig[key]?.name || key,
        dataIndex: ["content", key],
        key: key,
        ellipsis: true,
        width: keyConfig[key]?.w || 150,
        className: "text-base",
      };
      if (key === "supplier_name") {
        return {
          ...baseColumn,
          fixed: "left" as any,
          render: (text: any, row: any) => {
            return <div style={wrapperStyle}>{row.supplier_name || "-"}</div>;
          },
        };
      }
      if (
        key === "商品簡介" ||
        key === "作者簡介" ||
        key === "目錄／曲目" ||
        key === "內文試閱" ||
        key === "前言／序" ||
        key === "譯者簡介" ||
        key === "媒体推薦" ||
        key === "名人推薦" ||
        key === "得獎紀錄" ||
        key === "內容頁次" ||
        key === "特別收錄／編輯的話"
      ) {
        return {
          ...baseColumn,
          ellipsis: {
            showTitle: false,
          },
          render: (text: any) => (
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
        render: (text: any) => <div style={wrapperStyle}>{text || "-"}</div>,
      };
    }),
  ];
  const onRowClick = (record: BookData) => {
    setSelectedRow(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const exportToCSV = () => {
    try {
      // const headers = ["supplier_name", ...Object.keys(data[0]?.content || {})];
      const headers = [...Object.keys(data[0]?.content || {})];
      const rows = data.map((item) =>
        headers.map((key) => {
          let cellValue = item.content[key as keyof BookType] || "";

          // 特殊處理"關鍵字詞"欄位
          if (key === "關鍵字詞。各關鍵字之間，請以「,」為區隔符號。") {
            console.log(cellValue);
            // 將整個欄位內容用引號包裹，確保不會被分割
            return `"${cellValue.replace(/"/g, '""')}"`;
          }

          // 處理其他包含逗號、引號或換行符的單元格
          if (/[",\n\r]/.test(cellValue)) {
            return `"${cellValue.replace(/"/g, '""')}"`;
          }
          return cellValue;
        })
      );

      // 生成CSV內容
      const csvContent = [
        headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(","),
      ]
        .concat(rows.map((row) => row.join(",")))
        .join("\n");

      const BOM = "\uFEFF";
      const csvContentWithBOM = BOM + csvContent;

      // Create Blob and download link
      const blob = new Blob([csvContentWithBOM], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "標準格式檔案.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="w-full mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-6">
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
            onClick={exportToCSV}
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
        <Modal
          title={<span className="text-2xl">AI 推薦文產生器</span>}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[]}
          width={800}
          centered
        >
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={() => setMode("normal")}
              className={cn(
                "bg-blue-500 text-white px-4 py-2 w-1/3 rounded hover:bg-blue-400 transition-colors",
                mode === "normal" ? "bg-blue-300" : ""
              )}
            >
              一般生成
            </button>
            <button
              onClick={() => setMode("RAG")}
              className={cn(
                "bg-blue-500 text-white px-4 py-2 w-1/3 rounded hover:bg-blue-400 transition-colors",
                mode === "RAG" ? "bg-blue-300" : ""
              )}
            >
              增強式生成
            </button>
          </div>
          {mode === "normal" ? (
            <NormalModal selectedRow={selectedRow as BookData} />
          ) : (
            <RAGModal selectedRow={selectedRow as BookData} />
          )}
        </Modal>
        <Modal
          title="編輯書籍信息"
          open={isEditModalVisible}
          onCancel={handleEditModalClose}
          footer={null}
          width={1000}
        >
          {editingRecord && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingRecord);
                handleEditModalClose();
              }}
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">供應商名稱</label>
                  <Input
                    value={editingRecord.supplier_name}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        supplier_name: e.target.value,
                      })
                    }
                    placeholder="供應商名稱"
                  />
                </div>
                {Object.entries(editingRecord.content).map(([key, value]) => (
                  <div key={key}>
                    <label className="block mb-1">
                      {keyConfig[key]?.name || key}
                    </label>
                    {key === "商品簡介" ||
                    key === "作者簡介" ||
                    key === "目錄／曲目" ||
                    key === "內文試閱" ||
                    key === "前言／序" ||
                    key === "譯者簡介" ||
                    key === "媒体推薦" ||
                    key === "名人推薦" ||
                    key === "得獎紀錄" ||
                    key === "內容頁次" ||
                    key === "特別收錄／編輯的話" ? (
                      <Input.TextArea
                        value={value as string}
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            content: {
                              ...editingRecord.content,
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder={keyConfig[key]?.name || key}
                        rows={4}
                      />
                    ) : (
                      <Input
                        value={value as string}
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            content: {
                              ...editingRecord.content,
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder={keyConfig[key]?.name || key}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default OutputPage;
