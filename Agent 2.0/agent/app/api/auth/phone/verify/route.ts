import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { phoneNumber, code, name } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "phoneNumber and code parameters are required." },
        { status: 400 }
      );
    }

    // 1. Query OTP details from database
    const { data: otpRecords, error: dbError } = await insforge.database
      .from("otp_verifications")
      .select("*")
      .eq("phone_number", phoneNumber);

    if (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json(
        { error: "Database query failed." },
        { status: 500 }
      );
    }

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: "No pending verification found for this phone number." },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    // 2. Validate code and expiration
    if (otpRecord.code !== code) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 }
      );
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Clear OTP record after successful verification
    await insforge.database
      .from("otp_verifications")
      .delete()
      .eq("phone_number", phoneNumber);

    // 4. Authenticate User & Upsert Profile in users table
    const cleanPhone = phoneNumber.replace(/\+/g, "");
    const userId = `usr_phone_${cleanPhone}`;
    const now = new Date().toISOString();

    const { data: existingUsers, error: userQueryError } = await insforge.database
      .from("users")
      .select("*")
      .eq("id", userId);

    if (userQueryError) {
      console.error("Failed to query existing user details:", userQueryError);
    }

    let finalUser: any = null;

    if (existingUsers && existingUsers.length > 0) {
      // User exists - update last login date
      const { error: updateError } = await insforge.database
        .from("users")
        .update({ last_login_at: now })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update last login timestamp:", updateError);
      }

      finalUser = {
        id: userId,
        email: existingUsers[0].email || null,
        phone_number: phoneNumber,
        providers: ["phone"],
        profile: {
          name: existingUsers[0].name || name || "Phone User",
        },
        verification_method: otpRecord.channel,
        createdAt: existingUsers[0].created_at,
        lastLoginAt: now,
      };
    } else {
      // User is new - insert user details (first time sync)
      const insertRecord = {
        id: userId,
        email: null,
        name: name || "Phone User",
        phone_number: phoneNumber,
        auth_provider: "phone",
        verification_method: otpRecord.channel,
        created_at: now,
        last_login_at: now,
      };

      const { error: insertError } = await insforge.database
        .from("users")
        .insert([insertRecord]);

      if (insertError) {
        console.error("Failed to create new phone user profile in database:", insertError);
      }

      finalUser = {
        id: userId,
        email: null,
        phone_number: phoneNumber,
        providers: ["phone"],
        profile: {
          name: insertRecord.name,
        },
        verification_method: otpRecord.channel,
        createdAt: now,
        lastLoginAt: now,
      };
    }

    return NextResponse.json({
      success: true,
      user: finalUser,
    });
  } catch (err: any) {
    console.error("OTP verification exception:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
