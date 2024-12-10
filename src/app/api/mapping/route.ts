import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 禁用缓存

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Doc-Agent");
    const rules = await db
      .collection("longtext_mapping")
      .find({})
      .sort({ metacritic: -1 })
      // .limit(10)
      .toArray();

    const response = NextResponse.json(rules);

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { standard, pre_col, pre_col_values } = await request.json();
    const client = await clientPromise;
    const db = client.db("Doc-Agent");
    const collection = db.collection("longtext_mapping");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          standard,
          pre_col,
          pre_col_values,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "找不到該規則" }, { status: 404 });
    }

    return NextResponse.json({ message: "更新成功" }, { status: 200 });
  } catch (error) {
    console.error("更新規則時出錯:", error);
    return NextResponse.json({ error: "更新規則失敗" }, { status: 500 });
  }
}
