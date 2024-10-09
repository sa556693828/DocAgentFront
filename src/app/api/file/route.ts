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

    const fileIds = [];
    for (const file of files) {
      const existingFile = await db.collection("input_files").findOne({ name: file.name });
      if (existingFile) {
        fileIds.push(existingFile._id);
      } else {
        const result = await db.collection("input_files").insertOne({
          name: file.name,
          url: file.url,
        });
        fileIds.push(result.insertedId);
      }
    }
    
    return NextResponse.json(
      { message: "文件處理成功", ids: fileIds },
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
