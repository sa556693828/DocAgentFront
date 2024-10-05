import { BookData, BookType } from "@/types/books";

interface KeyObject {
  name: string;
  w: number;
}
export const StandardFormat: BookData = {
  _id: "",
  supplier_name: "",
  content: {
    供應商代碼: "",
    出版社代碼: "",
    原文出版社: "",
    "商品條碼(EAN)": "",
    "ISBN/ISSN": "",
    EISBN: "",
    商品貨號: "",
    業種別: "",
    主要商品名稱: "",
    次要商品名稱: "",
    期數: "",
    主要作者: "",
    次要作者: "",
    出版日期: "",
    譯者: "",
    編者: "",
    繪者: "",
    頁數: "",
    冊數: "",
    版別: "",
    出版國: "",
    內容語言別: "",
    語文對照: "",
    注音註記: "",
    印刷模式: "",
    編排型式: "",
    出版型式: "",
    裝訂型式: "",
    裝訂型式補述: "",
    "叢書名稱(書系)": "",
    CIP: "",
    學思行分類: "",
    商品內容分級: "",
    "適合年齡(起)": "",
    "適合年齡(迄)": "",
    商品單位代碼: "",
    商品定價: "",
    商品特價: "",
    商品批價: "",
    進貨折扣: "",
    銷售地區限制: "",
    海外商品原幣別: "",
    海外商品原定價: "",
    商品銷售稅別: "",
    商品長度: "",
    商品寛度: "",
    商品高度: "",
    商品重量: "",
    "特別收錄／編輯的話": "",
    商品簡介: "",
    封面故事: "",
    作者簡介: "",
    譯者簡介: "",
    內容頁次: "",
    "前言／序": "",
    內文試閱: "",
    名人導讀: "",
    媒体推薦: "",
    名人推薦: "",
    得獎紀錄: "",
    "目錄／曲目": "",
    附加商品標題: "",
    附加商品內容: "",
    絕版註記: "",
    外幣兌匯率: "",
    有庫存才賣註記: "",
    二手書銷售註記: "",
    系列代碼: "",
    廠商店內碼: "",
    紙張開數: "",
    "關鍵字詞。各關鍵字之間，請以「,」為區隔符號。": "",
    商品截退日期: "",
    銷售通路限制: "",
    首批進倉日期: "",
    "(商品)隨貨附件": "",
  },
};
export const keyConfig: { [key: string]: KeyObject } = {
  supplier_name: { name: "供應商名稱", w: 120 },
  供應商代碼: { name: "供應商代碼", w: 120 },
  出版社代碼: { name: "出版社代碼", w: 120 },
  原文出版社: { name: "原文出版社", w: 120 },
  "商品條碼(EAN)": { name: "商品條碼(EAN)", w: 160 },
  "ISBN/ISSN": { name: "ISBN/ISSN", w: 160 },
  EISBN: { name: "EISBN", w: 100 },
  商品貨號: { name: "商品貨號", w: 100 },
  業種別: { name: "業種別", w: 100 },
  主要商品名稱: { name: "主要商品名稱", w: 150 },
  次要商品名稱: { name: "次要商品名稱", w: 150 },
  期數: { name: "期數", w: 100 },
  主要作者: { name: "主要作者", w: 100 },
  次要作者: { name: "次要作者", w: 100 },
  出版日期: { name: "出版日期", w: 110 },
  譯者: { name: "譯者", w: 100 },
  編者: { name: "編者", w: 100 },
  繪者: { name: "繪者", w: 100 },
  頁數: { name: "頁數", w: 100 },
  冊數: { name: "冊數", w: 100 },
  版別: { name: "版別", w: 100 },
  出版國: { name: "出版國", w: 100 },
  內容語言別: { name: "內容語言別", w: 100 },
  語文對照: { name: "語文對照", w: 100 },
  注音註記: { name: "注音註記", w: 100 },
  印刷模式: { name: "印刷模式", w: 100 },
  編排型式: { name: "編排型式", w: 100 },
  出版型式: { name: "出版型式", w: 100 },
  裝訂型式: { name: "裝訂型式", w: 100 },
  裝訂型式補述: { name: "裝訂型式補述 ", w: 100 },
  "叢書名稱(書系)": { name: "叢書名稱(書系)", w: 100 },
  CIP: { name: "CIP", w: 100 },
  學思行分類: { name: "學思行分類", w: 100 },
  商品內容分級: { name: "商品內容分級", w: 100 },
  "適合年齡(起)": { name: "適合年齡(起)", w: 100 },
  "適合年齡(迄)": { name: "適合年齡(迄)", w: 100 },
  商品單位代碼: { name: "商品單位代碼", w: 100 },
  商品定價: { name: "商品定價", w: 100 },
  商品特價: { name: "商品特價", w: 100 },
  商品批價: { name: "商品批價", w: 100 },
  進貨折扣: { name: "進貨折扣", w: 100 },
  銷售地區限制: { name: "銷售地區限制", w: 100 },
  海外商品原幣別: { name: "海外商品原幣別", w: 100 },
  海外商品原定價: { name: "海外商品原定價", w: 100 },
  商品銷售稅別: { name: "商品銷售稅別", w: 100 },
  商品長度: { name: "商品長度", w: 100 },
  商品寛度: { name: "商品寛度", w: 100 },
  商品高度: { name: "商品高度", w: 100 },
  商品重量: { name: "商品重量", w: 100 },
  "特別收錄／編輯的話": { name: "特別收錄／編輯的話", w: 500 },
  商品簡介: { name: "商品簡介", w: 500 },
  封面故事: { name: "封面故事", w: 100 },
  作者簡介: { name: "作者簡介", w: 500 },
  譯者簡介: { name: "譯者簡介", w: 100 },
  內容頁次: { name: "內容頁次", w: 500 },
  "前言／序": { name: "前言／序", w: 500 },
  內文試閱: { name: "內文試閱", w: 500 },
  名人導讀: { name: "名人導讀", w: 100 },
  媒体推薦: { name: "媒体推薦", w: 100 },
  名人推薦: { name: "名人推薦", w: 100 },
  得獎紀錄: { name: "得獎紀錄", w: 100 },
  "目錄／曲目": { name: "目錄／曲目", w: 500 },
  附加商品標題: { name: "附加商品標題", w: 100 },
  附加商品內容: { name: "附加商品內容", w: 100 },
  絕版註記: { name: "絕版註記", w: 100 },
  外幣兌匯率: { name: "外幣兌匯率", w: 100 },
  有庫存才賣註記: { name: "有庫存才賣註記", w: 100 },
  二手書銷售註記: { name: "二手書銷售註記", w: 100 },
  系列代碼: { name: "系列代碼", w: 100 },
  廠商店內碼: { name: "廠商店內碼", w: 100 },
  紙張開數: { name: "紙張開數", w: 100 },
  "關鍵字詞。各關鍵字之間，請以「,」為區隔符號。": {
    name: "關鍵字詞。各關鍵字之間，請以「,」為區隔符號。",
    w: 100,
  },
  商品截退日期: { name: "商品截退日期", w: 100 },
  銷售通路限制: { name: "銷售通路限制", w: 100 },
  首批進倉日期: { name: "首批進倉日期", w: 100 },
  "(商品)隨貨附件": { name: "(商品)隨貨附件", w: 100 },
};
