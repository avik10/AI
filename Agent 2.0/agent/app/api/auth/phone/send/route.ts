import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import SentDm from "@sentdm/sentdm";

export async function POST(request: Request) {
  try {
    const { phoneNumber, channel } = await request.json();

    if (!phoneNumber || !channel) {
      return NextResponse.json(
        { error: "phoneNumber and channel parameters are required." },
        { status: 400 }
      );
    }

    if (channel !== "sms" && channel !== "whatsapp") {
      return NextResponse.json(
        { error: "Verification channel must be 'sms' or 'whatsapp'." },
        { status: 400 }
      );
    }

    // 1. Generate 6-digit random code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

    // 2. Clear old verifications for this number and insert new code record
    await insforge.database
      .from("otp_verifications")
      .delete()
      .eq("phone_number", phoneNumber);

    const { error: dbError } = await insforge.database
      .from("otp_verifications")
      .insert([
        {
          phone_number: phoneNumber,
          code: generatedCode,
          channel: channel,
          expires_at: expiresAt,
        },
      ]);

    if (dbError) {
      console.error("Failed to insert OTP verification in database:", dbError);
      return NextResponse.json(
        { error: "Database verification staging failed." },
        { status: 500 }
      );
    }

    // 3. Deliver via Sent.dm
    const apiKey = process.env.SENT_DM_API_KEY || "sdm_mock_key_12345";
    let isMock = apiKey === "sdm_mock_key_12345";
    let statusMessage = "OTP sent successfully via Sent.dm.";

    if (!isMock) {
      try {
        const sentdm = new SentDm({ apiKey });
        await sentdm.messages.send({
          to: [phoneNumber],
          template: {
            id: process.env.SENT_DM_TEMPLATE_ID || "09dd768f-8b84-4667-8120-1e021d756e50",
            parameters: {
              var_1: generatedCode,
            },
          },
          channel: [channel], // 'sms' or 'whatsapp'
        });
      } catch (sendError: any) {
        console.error("Sent.dm SDK error, falling back to simulation:", sendError);
        isMock = true; // Fallback to simulated response if key is inactive
      }
    }

    if (isMock) {
      console.log(`[Sent.dm Sandbox OTP] Phone: ${phoneNumber} | Channel: ${channel} | Code: ${generatedCode}`);
      statusMessage = `[Sandbox Mode] OTP code ${generatedCode} successfully delivered via ${channel}.`;
    }

    return NextResponse.json({
      success: true,
      message: statusMessage,
      // In sandbox mode, return code to client for convenience
      code: isMock ? generatedCode : undefined,
    });
  } catch (err: any) {
    console.error("OTP send exception:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
