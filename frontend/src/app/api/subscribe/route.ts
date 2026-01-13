// app/api/subscribe/route.ts
export const runtime = 'nodejs'; // ← 重要（edge だと失敗）

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !emailRe.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    // env が入ってるか最低限確認（値は出さない）
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP env missing");
      return NextResponse.json({ ok: false, error: "env_missing" }, { status: 500 });
    }

    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465=SMTPSのみtrue
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      logger: true, // ← コンソールに詳細ログ
      debug: true,
    });

    // 接続確認（ここで失敗理由がログに出る）
    await transporter.verify();

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: "info@delvertrade.com",
      subject: "New Early Access request",
      text: `New signup: ${email}`,
      html: `<p><strong>New signup:</strong> ${email}</p>`,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MAIL_ERROR:", err);
    return NextResponse.json({ ok: false, error: "mail_failed" }, { status: 500 });
  }
}
