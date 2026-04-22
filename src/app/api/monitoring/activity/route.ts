import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log(
      JSON.stringify({
        level: "info",
        event: "user_activity",
        timestamp: new Date().toISOString(),
        payload,
      }),
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
