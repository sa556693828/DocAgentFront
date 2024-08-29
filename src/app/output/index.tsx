"use client";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { BookType } from "@/types/books";
import { keyConfig, StandardFormat } from "@/constant/standard";
import { Table, Tooltip } from "antd";

const OutputPage: React.FC = () => {
  // const;
  const [data, setData] = useState<BookType[]>([]);

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
  const exportToCSV = () => {
    try {
      const headers = columns.map((column) => column.title);

      const rows = data.map((item: any) =>
        columns.map((column: any) => {
          const cellValue = item[column.dataIndex] || "";
          // 處理包含逗號、引號或換行符的單元格
          if (/[",\n\r]/.test(cellValue)) {
            return `"${cellValue.replace(/"/g, '""')}"`;
          }
          return cellValue;
        })
      );

      // 生成CSV內容
      const csvContent = [headers.join(",")]
        .concat(rows.map((row) => row.join(",")))
        .join("\n");

      // Create Blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "標準格式檔案.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // toast.success("CSV file exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      // toast.error("Failed to export CSV file");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-6">
          {/* <div className="space-x-4">
            <button className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors">
              資料列
            </button>
            <button className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors">
              自定義輸出
            </button>
          </div> */}
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
          columns={[...columns]}
          dataSource={data}
          rowKey={(row) => row._id}
          scroll={{ x: "max-content" }}
          className="whitespace-pre-wrap"
        />
      </div>
    </div>
  );
};

export default OutputPage;
