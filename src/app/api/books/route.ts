import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 禁用缓存

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Doc-Agent");
    const books = await db
      .collection("standard_docs")
      .find({})
      .sort({ metacritic: -1, _id: 1 }) // 添加 _id: 1 以確保排序有效
      // .limit(10)
      .toArray();

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
    const { publisher_name, content } = await request.json();
    const client = await clientPromise;
    const db = client.db("Doc-Agent");
    const collection = db.collection("standard_docs");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          publisher_name,
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
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "无效的ID列表" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Doc-Agent");
    const collection = db.collection("standard_docs");

    const objectIds = ids.map((id) => new ObjectId(id));
    const result = await collection.deleteMany({ _id: { $in: objectIds } });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "未找到要删除的书籍" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `成功删除 ${result.deletedCount} 本书籍`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("批量删除书籍时出错:", error);
    return NextResponse.json({ error: "批量删除书籍失败" }, { status: 500 });
  }
}
