import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET as string;

const bucket = storage.bucket(bucketName);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "没有找到文件" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const blob = bucket.file(file.name);
    const blobStream = blob.createWriteStream();

    return new Promise<Response>((resolve, reject) => {
      blobStream.on("error", (err) => {
        console.error("上传文件时出错:", err);
        resolve(NextResponse.json({ error: "上传失败" }, { status: 500 }));
      });

      blobStream.on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(NextResponse.json({ fileUrl: publicUrl }));
      });

      blobStream.end(Buffer.from(buffer));
    });
  } catch (error) {
    console.error("上传文件时出错:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
