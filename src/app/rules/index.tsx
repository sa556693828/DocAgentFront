"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { SupplierRule } from "@/types/rules";
import type { TableProps } from "antd";
import { Table, Button, Modal, Input } from "antd";
import toast from "react-hot-toast";
interface KeyObject {
  name: string;
  w: number;
}

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<SupplierRule[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SupplierRule | null>(null);

  const getRules = async () => {
    try {
      const response = await axios.get("/api/rules");
      console.log(response.data);
      setRules(response.data);
    } catch (error) {
      console.error("獲取規則時出錯:", error);
    }
  };

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
  const keyArray =
    rules.length > 0
      ? Object.keys(rules[0]).filter((key) => key !== "_id")
      : [];
  const wrapperStyle: React.CSSProperties = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
  };
  const rulesKeyConfig: { [key: string]: KeyObject } = {
    _id: { name: "_id", w: 120 },
    publisher_name: { name: "出版社名稱", w: 100 },
    supplier_name: { name: "供應商名稱", w: 100 },
    publisher_id: { name: "出版社代碼", w: 100 },
    supplier_id: { name: "供應商代碼", w: 100 },
    rule: { name: "轉換規則", w: 300 },
    tips: { name: "注意事項", w: 300 },
    score: { name: "分數", w: 50 },
  };
  const columnOrder = [
    "supplier_name",
    "publisher_name",
    "supplier_id",
    "publisher_id",
    "rule",
    "tips",
    "score",
  ];
  const columns: TableProps<SupplierRule>["columns"] = [
    {
      title: "操作",
      key: "action",
      fixed: "left",
      width: 90,
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
    ...columnOrder.map((key) => {
      const baseColumn = {
        title: rulesKeyConfig[key]?.name || key,
        dataIndex: ["content", key],
        key: key,
        ellipsis: true,
        width: rulesKeyConfig[key]?.w || 150,
        className: "text-base",
      };
      if (key === "publisher_name") {
        return {
          ...baseColumn,
          fixed: "left" as any,
          render: (text: any, row: any) => {
            return <div style={wrapperStyle}>{row.publisher_name || "-"}</div>;
          },
        };
      }
      if (key === "rule" || key === "tips") {
        return {
          ...baseColumn,
          render: (text: any, row: any) => {
            return (
              <div
                style={{
                  ...wrapperStyle,
                  maxHeight: "300px", // 設置最大高度
                  overflowY: "auto", // 添加垂直滾動條
                  padding: "5px", // 添加一些內邊距以提高可讀性
                }}
              >
                {row[key]?.split("\n").map((line: string, index: number) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < row[key].split("\n").length - 1 && <br />}
                  </React.Fragment>
                )) || "-"}
              </div>
            );
          },
        };
      }
      if (key === "rule") {
        return {
          ...baseColumn,
          render: (text: any, row: any) => {
            return (
              <div
                style={{
                  ...wrapperStyle,
                  maxHeight: "300px", // 設置最大高度
                  overflowY: "auto", // 添加垂直滾動條
                  padding: "5px", // 添加一些內邊距以提高可讀性
                }}
              >
                {row[key]?.split("\n").map((line: string, index: number) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < row[key].split("\n").length - 1 && <br />}
                  </React.Fragment>
                )) || "-"}
              </div>
            );
          },
        };
      }
      return {
        ...baseColumn,
        render: (text: any, row: any) => {
          return <div style={wrapperStyle}>{row[key] || "-"}</div>;
        },
      };
    }),
  ];
  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
  };
  const handleEdit = async (record: SupplierRule) => {
    try {
      console.log(record);
      const response = await axios.put(`/api/rules/${record._id}`, {
        publisher_name: record.publisher_name || "",
        supplier_name: record.supplier_name || "",
        publisher_id: record.publisher_id || "",
        supplier_id: record.supplier_id || "",
        rule: record.rule || "",
        tips: record.tips || "",
        score: record.score || "",
      });

      if (response.status === 200) {
        toast.success("規則更新成功");
        getRules();
      }
    } catch (error) {
      console.error("更新書籍資訊時出錯:", error);
      toast.error("更新書籍資訊失敗");
    }
  };
  const handleEditClick = (record: SupplierRule) => {
    setEditingRecord(record);
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    getRules();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Table
        pagination={{ pageSize: 10 }}
        columns={columns}
        dataSource={rules}
        rowKey={(row) => row._id}
        scroll={{ x: "max-content" }}
        sticky={true} // 添加 sticky 屬性
        // onRow={(record) => ({
        //   onClick: () => onRowClick(record), // On row click, show modal
        // })}
        className="whitespace-pre-wrap"
      />

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
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block mb-1">出版社 ID</label>
                <Input
                  value={editingRecord.publisher_id}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      publisher_id: e.target.value,
                    })
                  }
                  placeholder="出版社 ID"
                />
              </div>
              <div>
                <label className="block mb-1">供應商 ID</label>
                <Input
                  value={editingRecord.supplier_id}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      supplier_id: e.target.value,
                    })
                  }
                  placeholder="供應商 ID"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {Object.entries(editingRecord)
                .filter(
                  ([key]) =>
                    key !== "_id" &&
                    key !== "supplier_id" &&
                    key !== "publisher_id" &&
                    key !== "supplier_name" &&
                    key !== "publisher_name"
                )
                .sort(
                  (a, b) =>
                    columnOrder.indexOf(a[0]) - columnOrder.indexOf(b[0])
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <label className="block mb-1">
                      {rulesKeyConfig[key]?.name || key}
                    </label>
                    {key === "rule" || key === "tips" ? (
                      <Input.TextArea
                        value={value as string}
                        autoSize={{ minRows: 4, maxRows: 10 }} // 替換固定高度
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            [key]: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <Input
                        value={value as string}
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={rulesKeyConfig[key]?.name || key}
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
  );
};

export default RulesPage;
