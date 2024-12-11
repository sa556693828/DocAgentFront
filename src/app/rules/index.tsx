"use client";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { SupplierRule } from "@/types/rules";
import type { TableProps } from "antd";
import { Table, Button, Modal, Input } from "antd";
import toast from "react-hot-toast";
import { StandardFormat } from "@/constant/standard";
interface KeyObject {
  name: string;
  w: number;
}

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<SupplierRule[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [newRule, setNewRule] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const getRules = async () => {
    try {
      const response = await axios.get("/api/rules");
      const sortedRules = response.data.sort(
        (a: SupplierRule, b: SupplierRule) => {
          const standardKeys = Object.keys(StandardFormat.content);
          const aIndex = standardKeys.indexOf(a.standard_col);
          const bIndex = standardKeys.indexOf(b.standard_col);

          // 如果找不到对应的键，将其排到最后
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;

          return aIndex - bIndex;
        }
      );
      setRules(sortedRules);
    } catch (error) {
      console.error("獲取規則時出錯:", error);
    }
  };

  const updateRules = async (newRule: string) => {
    setAgentLoading(true);
    setNewRule("");
    const toastId = toast.loading(`正在更新規則： ${newRule}`);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "/update_rules";
      const result = await axios.post(
        url,
        {
          new_rule: newRule,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid_api_key",
          },
        }
      );
      console.log(result);
      toast.success(`更新規則 ${newRule} 成功`, {
        id: toastId,
      });
      toast.dismiss(toastId);
      getRules();
      return result;
    } catch (error: any) {
      console.error("調用DocAgent API時出錯:", error.response.data.error);
      toast.error(`更新規則 ${newRule} 失敗: ${error.response.data.error}`, {
        id: toastId,
      });
      toast.dismiss(toastId);
      throw error;
    } finally {
      setAgentLoading(false);
    }
  };
  const wrapperStyle: React.CSSProperties = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
  };
  const rulesKeyConfig: { [key: string]: KeyObject } = {
    standard_col: { name: "標準欄位", w: 100 },
    pre: { name: "預處理欄位", w: 100 },
    exception: { name: "例外規則", w: 100 },
    rules: { name: "轉換規則", w: 300 },
  };

  const columnOrder = [...Object.keys(rulesKeyConfig)];

  const columns: TableProps<SupplierRule>["columns"] = [
    ...columnOrder.map((key) => {
      const baseColumn = {
        title: rulesKeyConfig[key]?.name || key,
        dataIndex: ["content", key],
        key: key,
        ellipsis: true,
        width: rulesKeyConfig[key]?.w || 150,
        className: "text-base",
      };
      if (key === "standard_col") {
        return {
          ...baseColumn,
          fixed: "left" as any,
          render: (text: any, row: any) => {
            return (
              <div style={wrapperStyle} className="text-lg font-bold">
                {row.standard_col || "-"}
              </div>
            );
          },
        };
      }
      if (key === "pre") {
        return {
          ...baseColumn,
          fixed: "left" as any,
          render: (text: any, row: any) => {
            return (
              <div style={wrapperStyle} className="">
                {Array.isArray(row.pre) ? row.pre.join(", ") : row.pre || "-"}
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
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };
  // 添加輸入法事件處理
  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      // 如果正在輸入中文，直接返回
      if (isComposing) {
        return;
      }

      if (e.shiftKey) {
        return;
      } else if (!agentLoading) {
        e.preventDefault();
        const currentInput = newRule.trim();
        setNewRule("");
        if (currentInput) {
          await updateRules(currentInput);
        }
      }
    }
  };
  useEffect(() => {
    getRules();
  }, []);

  return (
    <div className="min-h-screen relative bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateRules(newRule);
        }}
        className="flex gap-2 fixed bottom-4 w-1/2 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-start w-full bg-[#202123] rounded-xl shadow-sm border border-gray-800/50">
          <textarea
            ref={textareaRef}
            rows={1}
            value={newRule}
            onChange={(e) => {
              setNewRule(e.target.value);
              adjustHeight();
            }}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            placeholder="輸入規則... (Enter 更新, Shift + Enter 換行)"
            className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none resize-none min-h-[48px] max-h-[200px] overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#4B5563 transparent",
            }}
          />
          <button
            type="submit"
            disabled={!newRule.trim() || agentLoading}
            className={`px-4 py-3 transition-colors self-end
              ${
                newRule.trim() && !agentLoading
                  ? "text-white hover:text-gray-300 cursor-pointer"
                  : "text-gray-600 cursor-not-allowed"
              }`}
            title={!newRule.trim() ? "請輸入規則" : "更新規則"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </form>
      <Table
        pagination={{ pageSizeOptions: [10, 38, 100], pageSize: 38 }}
        columns={columns}
        dataSource={rules}
        rowKey={(row) => row._id}
        scroll={{ x: "max-content" }}
        sticky={true} // 添加 sticky 屬性
        className="whitespace-pre-wrap"
      />
    </div>
  );
};

export default RulesPage;
