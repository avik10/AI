import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET: Fetch connected platforms for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required." }, { status: 400 });
    }

    const { data, error } = await insforge.database
      .from("user_integrations")
      .select("platform")
      .eq("user_id", userId)
      .eq("status", "connected");

    if (error) {
      console.error("Database fetch error for user integrations:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const platforms = data ? data.map((item: any) => item.platform) : [];
    return NextResponse.json({ success: true, platforms });
  } catch (err: any) {
    console.error("Integrations GET exception:", err);
    return NextResponse.json({ error: err.message || "Unexpected error." }, { status: 500 });
  }
}

// POST: Connect/Disconnect platform
export async function POST(request: Request) {
  try {
    const { userId, platform, action } = await request.json();

    if (!userId || !platform || !action) {
      return NextResponse.json({ error: "userId, platform, and action parameters are required." }, { status: 400 });
    }

    const connectionId = `${userId}_${platform}`;

    if (action === "connect") {
      const { error } = await insforge.database
        .from("user_integrations")
        .upsert([
          {
            id: connectionId,
            user_id: userId,
            platform,
            status: "connected",
            connected_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error("Database insert error on integration connect:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: "connected" });
    } else if (action === "disconnect") {
      const { error } = await insforge.database
        .from("user_integrations")
        .delete()
        .eq("id", connectionId);

      if (error) {
        console.error("Database delete error on integration disconnect:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: "disconnected" });
    } else {
      return NextResponse.json({ error: "Invalid action. Must be 'connect' or 'disconnect'." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Integrations POST exception:", err);
    return NextResponse.json({ error: err.message || "Unexpected error." }, { status: 500 });
  }
}
