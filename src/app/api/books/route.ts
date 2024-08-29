import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("DocAgent");
    const books = await db
      .collection("standard_form")
      .find({})
      .sort({ metacritic: -1 })
      // .limit(10)
      .toArray();

    return NextResponse.json(books);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
