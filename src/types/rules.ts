export interface SupplierRule {
  _id: string;
  publisher_id: string;
  supplier_id: string;
  publisher_name: string;
  supplier_name: string;
  rule: string;
  score: number;
  tips: string;
}
