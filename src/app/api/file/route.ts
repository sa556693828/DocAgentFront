import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

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
          base64: file.base64,
        },
      },
    }));

    const result = await db
      .collection("input_files")
      .bulkWrite(insertOperations);

    const insertedIds = Object.values(result.insertedIds);

    return NextResponse.json(
      { message: "Files uploaded successfully", ids: insertedIds },
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
