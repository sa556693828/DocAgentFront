"use client";
import Collapse from "@/components/Collapes";
import UploadSection from "@/components/Upload/UploadSection";
import { MappingRule } from "@/types/rules";
import { Button, Input, Modal, Table, TableProps } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface KeyObject {
  name: string;
  w: number;
}
interface ExpandedData {
  _id: string;
  standard: string;
  pre_col_key: string;
  pre_col_values: string[];
}

const InputPage: React.FC = () => {
  const [mapping, setMapping] = useState<ExpandedData[]>([]);
  const [selectedRow, setSelectedRow] = useState<ExpandedData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ExpandedData | null>(null);
  const testUrl = process.env.NEXT_PUBLIC_DEVELOPMENT_URL;
  const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL;

  const getMapping = async () => {
    try {
      const baseUrl = testUrl;
      const response = await axios.get(`${baseUrl}/get_mapping`);
      const data = response.data.data;
      const filterData = data.filter(
        (item: MappingRule) => item.standard !== ""
      );
      const expandedData = filterData.flatMap(
        (item: MappingRule, raw_index: number) => {
          const keys = Object.keys(item.pre_col);
          return keys.map((key, index) => ({
            id: `${raw_index}-${index}`,
            standard: item.standard,
            pre_col_key: key,
            pre_col_values: item.pre_col[key],
          }));
        }
      );
      setMapping(expandedData);
    } catch (error) {
      console.error("獲取規則時出錯:", error);
    }
  };
  const wrapperStyle: React.CSSProperties = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
  };
  const columns: TableProps<any>["columns"] = [
    {
      title: "標準欄位",
      width: 150,
      dataIndex: "standard",
      key: "standard",
      fixed: "left",
      render: (text: any, row: any, index: number) => {
        if (!text) {
          return {
            children: (
              <div style={wrapperStyle} className="text-lg font-bold">
                {"-"}
              </div>
            ),
            props: {
              rowSpan: 1,
            },
          };
        }

        const sameStandardRows = mapping.filter(
          (item) => item.standard === row.standard
        );
        const firstIndex = mapping.findIndex(
          (item) => item.standard === row.standard
        );
        const rowSpan = index === firstIndex ? sameStandardRows.length : 0;
        return {
          children: (
            <div style={wrapperStyle} className="text-lg font-bold">
              {text}
            </div>
          ),
          props: {
            rowSpan,
          },
        };
      },
    },
    {
      title: "預處理欄位",
      dataIndex: "pre_col_key",
      key: "pre_col_key",
      render: (text: any) => <div style={wrapperStyle}>{text}</div>,
    },
    {
      title: "出版社欄位名稱",
      dataIndex: "pre_col_values",
      key: "pre_col_values",
      render: (values: any) => (
        <div style={wrapperStyle} className="text-base max-w-[400px]">
          {values.join(" ｜ ")}
        </div>
      ),
    },
  ];
  const onRowClick = (record: any) => {
    setSelectedRow(record);
    setEditingRecord(record);
    setIsModalVisible(true);
  };
  const handleEdit = async (record: any) => {
    try {
      const baseUrl = testUrl;
      const res = await axios.post(`${baseUrl}/update_mapping`, {
        pre_column: record.pre_col_key,
        raw_column_list: record.pre_col_values,
      });
      if (res.data.status === "success") {
        toast.success(res.data.message);
        setIsModalVisible(false);
        getMapping();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("更新規則時出錯:", error);
    }
  };
  useEffect(() => {
    getMapping();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center w-full flex-col p-4">
      testing
      <Collapse header="1. 確認上傳文檔格式" isTrain={true}>
        <div className="space-y-4">
          <div>
            <p>請將 .doc 轉成 .docx，確保模型穩定運作。</p>
            <a
              href="https://www.freeconvert.com/doc-to-docx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
            >
              轉換工具請參考
            </a>
          </div>
          {/* <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            onClick={() => {
              setStep(1);
            }}
          >
            已轉成標準格式
          </button> */}
        </div>
      </Collapse>
      <Collapse header="2. 確認出版社長文本欄位" isTrain={true}>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">
              請先確認長文本欄位對應表，將新出版社的長文本欄位名稱填入
            </p>
            <p>
              {`例如：『本書特色』需要對應到『商品簡介』，則點擊『商品簡介』下最適合的預處理欄位，填入『本書特色』，請用 , 分隔每一個欄位名稱`}
            </p>
            {/* <p>{`不需要對應到任何表準欄位的長文本欄位，請填入 '-'`}</p> */}
          </div>
          <Table
            onRow={(record) => ({
              onClick: () => onRowClick(record),
            })}
            pagination={{ pageSizeOptions: [20, 50, 100], pageSize: 20 }}
            columns={columns}
            dataSource={mapping}
            rowKey={(row) => row.id}
            scroll={{ x: "max-content" }}
            sticky={true} // 添加 sticky 屬性
            className="whitespace-pre-wrap"
          />
        </div>
      </Collapse>
      <Collapse header="3. 上傳文檔">
        <div className="space-y-4 flex flex-col items-center justify-center">
          <UploadSection />
        </div>
      </Collapse>
      <Modal
        title="編輯長文本欄位對應表"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRow && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit(editingRecord);
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-lg">標準欄位</label>
                <Input
                  value={editingRecord?.standard}
                  disabled={true}
                  // onChange={(e) =>
                  //   setEditingRecord({
                  //     ...selectedRow,
                  //     standard: e.target.value,
                  //   })
                  // }
                  placeholder="標準欄位"
                />
              </div>
              <div>
                <label className="block mb-1 text-lg">預處理欄位</label>
                <Input
                  value={editingRecord?.pre_col_key}
                  disabled={true}
                  // onChange={(e) =>
                  //   setEditingRecord({
                  //     ...selectedRow,
                  //     pre_col_key: e.target.value,
                  //   })
                  // }
                  placeholder="預處理欄位"
                />
              </div>
            </div>
            <div className="mt-4 w-full ">
              <label className="block mb-1 text-lg">
                出版社欄位名稱(用,分隔每一個欄位名稱)
              </label>
              <Input
                value={editingRecord?.pre_col_values.join(",")}
                onChange={(e) =>
                  setEditingRecord({
                    ...selectedRow,
                    pre_col_values: e.target.value.split(","),
                  })
                }
                placeholder="出版社欄位名稱"
              />
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

export default InputPage;
