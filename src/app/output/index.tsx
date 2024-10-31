"use client";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { BookData, BookType } from "@/types/books";
import { outputKeyConfig, StandardFormat } from "@/constant/standard";
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

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
        publisher_name: record.publisher_name,
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
  const handleBatchDelete = async () => {
    try {
      const response = await axios.delete("/api/books", {
        data: { ids: selectedRowKeys },
      });

      if (response.status === 200) {
        toast.success(`成功刪除了 ${response.data.deletedCount} 本書籍`); // 重新获取数据
        setSelectedRowKeys([]); // 清空选择
        fetchData();
      }
    } catch (error) {
      console.error("批量刪除書籍時出錯:", error);
      toast.error("批量刪除書籍失敗");
    }
  };
  const keyArray = [
    "supplier_name",
    "publisher_name",
    ...Object.keys(StandardFormat.content),
  ];
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
        <div className="flex flex-col gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(record);
            }}
          >
            編輯
          </Button>
        </div>
      ),
    },
    ...keyArray.map((key) => {
      const baseColumn = {
        title: outputKeyConfig[key]?.name || key,
        dataIndex: ["content", key],
        key: key,
        ellipsis: true,
        width: outputKeyConfig[key]?.w || 150,
        className: "text-base",
      };
      if (key === "publisher_name") {
        return {
          ...baseColumn,
          fixed: "left" as any,
          render: (text: any, row: any) => {
            return <div style={wrapperStyle}>{row[key] || "-"}</div>;
          },
        };
      }
      if (key === "supplier_name") {
        return {
          ...baseColumn,
          fixed: "left" as any,
          render: (text: any, row: any) => {
            return <div style={wrapperStyle}>{row[key] || "-"}</div>;
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
      // const headers = ["publisher_name", ...Object.keys(data[0]?.content || {})];
      const selectedData = data.filter((item) =>
        selectedRowKeys.includes(item._id)
      );

      if (selectedData.length === 0) {
        toast.error("請至少選擇一行數據進行導出");
        return;
      }

      const headers = [...Object.keys(selectedData[0]?.content || {})];
      const rows = selectedData.map((item) =>
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
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };
  const filteredData = isFiltered
    ? data.filter(
        (item) => !item.content["供應商代碼"] || !item.content["出版社代碼"]
      )
    : data;

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full mx-auto bg-white rounded-lg shadow-md gap-6  flex flex-col p-6">
        <div className="flex w-full justify-between items-center">
          <button
            disabled={selectedRowKeys.length === 0}
            className={cn(
              "bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors",
              selectedRowKeys.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
            onClick={exportToCSV}
          >
            導出選擇的標準格式
          </button>
          <button
            className={cn(
              "bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors",
              isFiltered ? "bg-yellow-600" : ""
            )}
            onClick={handleFilterToggle}
          >
            {isFiltered
              ? "顯示全部資料"
              : "顯示沒有供應商代碼或出版社代碼的資料"}
          </button>
          {selectedRowKeys.length > 0 && (
            <span className="font-bold text-xl">
              已選擇 {selectedRowKeys.length} 項
            </span>
          )}
          <button
            className={cn(
              "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors",
              selectedRowKeys.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          >
            刪除選擇項目
          </button>
        </div>
        {/* <h2 className="text-2xl font-bold ">已上傳表格</h2> */}
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
          rowSelection={rowSelection}
          pagination={{ pageSize: 10 }}
          columns={columns}
          dataSource={filteredData}
          rowKey={(row) => row._id}
          scroll={{ x: "max-content" }}
          sticky={true} // 添加 sticky 屬性
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
                  <label className="block mb-1">出版社名稱</label>
                  <Input
                    value={editingRecord.publisher_name}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        publisher_name: e.target.value,
                      })
                    }
                    placeholder="出版社名稱"
                  />
                </div>
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
                      {outputKeyConfig[key]?.name || key}
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
                        placeholder={outputKeyConfig[key]?.name || key}
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
                        placeholder={outputKeyConfig[key]?.name || key}
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
