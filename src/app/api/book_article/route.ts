import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 禁用缓存

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("writing_db");
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("book_id");
    const type = searchParams.get("type");

    if (!bookId) {
      return NextResponse.json({ error: "缺少 book_id 参数" }, { status: 400 });
    }

    const books = await db
      .collection("articles")
      .find({ book_id: bookId, type: type })
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

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("writing_db");
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("book_id");
    const type = searchParams.get("type");

    if (!bookId) {
      return NextResponse.json({ error: "缺少 book_id 参数" }, { status: 400 });
    }

    await db.collection("articles").deleteMany({ book_id: bookId, type: type });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
