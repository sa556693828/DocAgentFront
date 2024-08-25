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
      .limit(10)
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

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("DocAgent");
    const data = await request.json();

    const { files } = data;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files to upload" },
        { status: 400 }
      );
    }

    const insertOperations = files.map((file: any) => ({
      insertOne: {
        document: {
          name: file.name,
          type: file.type,
          size: file.size,
          base64: file.base64,
        },
      },
    }));

    await db.collection("input_files").bulkWrite(insertOperations);

    return NextResponse.json(
      { message: "Files uploaded successfully" },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
