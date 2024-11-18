import { BookType } from "./books";

export interface SupplierRule {
  _id: string;
  standard_col: keyof BookType;
  pre: string[];
  exception: string;
  rules: string;
}
