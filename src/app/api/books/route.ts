import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 禁用缓存

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const client = await clientPromise;
    const db = client.db("Doc-Agent");
    const collection = db.collection("standard_docs");

    // 獲取總文檔數
    const total = await collection.countDocuments();

    // 計算要跳過的文檔數
    const skip = (page - 1) * pageSize;

    const books = await collection
      .find({})
      .sort({ metacritic: -1, _id: 1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const response = NextResponse.json({
      data: books,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });

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
