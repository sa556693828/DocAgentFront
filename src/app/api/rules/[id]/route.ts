import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 禁用缓存

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("DocAgent");
    const { id } = params;
    const books = await db.collection("standard_form").find({
      _id: new ObjectId(id),
    });

    const response = NextResponse.json(books);

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
    const { supplier_name, content } = await request.json();

    const client = await clientPromise;
    const db = client.db("DocAgent");
    const collection = db.collection("standard_form");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          supplier_name,
          content,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "找不到該書籍" }, { status: 404 });
    }

    return NextResponse.json({ message: "更新成功" }, { status: 200 });
  } catch (error) {
    console.error("更新書籍時出錯:", error);
    return NextResponse.json({ error: "更新書籍失敗" }, { status: 500 });
  }
}
