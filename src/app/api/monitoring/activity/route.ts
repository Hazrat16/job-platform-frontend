import { NextRequest, NextResponse } from "next/server";
import { getActivitySummary, pushActivityEvent } from "@/lib/activity-store";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.event !== "string" ||
      typeof payload.timestamp !== "number" ||
      typeof payload.path !== "string"
    ) {
      return NextResponse.json({ success: false, message: "Invalid activity payload" }, { status: 400 });
    }
    pushActivityEvent({
      event: payload.event,
      timestamp: payload.timestamp,
      path: payload.path,
      href: typeof payload.href === "string" ? payload.href : "",
      role: typeof payload.role === "string" ? payload.role : "unknown",
      userId: typeof payload.userId === "string" ? payload.userId : null,
      properties:
        payload.properties && typeof payload.properties === "object"
          ? payload.properties
          : {},
    });
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

export async function GET() {
  const summary = getActivitySummary();
  return NextResponse.json({
    success: true,
    message: "Activity summary loaded",
    data: summary,
  });
}
