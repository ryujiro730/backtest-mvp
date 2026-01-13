// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const bucket = process.env.MINIO_BUCKET!;
  const key = `${Date.now()}-${file.name}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ACL: "public-read" as any // MinIOでは不要なことが多い。anonymous download を設定済みなら省略可
  }));

  const publicBase = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL!;
  return NextResponse.json({
    success: true,
    url: `${publicBase}/${bucket}/${key}`, // これを<img>のsrcに使える
  });
}
