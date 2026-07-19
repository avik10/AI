import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { from, subject, body, userName } = await request.json();

    const senderName = from ? from.replace(/<[^>]+>/, "").trim() : "there";
    const cleanSubject = subject ? subject.replace(/^Re:\s*/i, "") : "your message";

    // Use connected user's First Name and Last Name
    const connectedUserName = userName || "Avik Bhattacharjya";

    // Context-aware AI Agent draft reasoning
    let aiDraftBody = "";

    const lowerBody = (body || "").toLowerCase();
    const lowerSubject = (cleanSubject || "").toLowerCase();

    if (lowerSubject.includes("invoice") || lowerBody.includes("invoice") || lowerBody.includes("payment") || lowerBody.includes("ride")) {
      aiDraftBody = `Hi ${senderName},\n\nThank you for sharing the payment invoice for "${cleanSubject}". I have received the summary and verified the ride details.\n\nPlease let me know if any further confirmation is needed on my end.\n\nBest regards,\n${connectedUserName}`;
    } else if (lowerSubject.includes("search console") || lowerBody.includes("search console") || lowerBody.includes("google")) {
      aiDraftBody = `Hi ${senderName},\n\nThank you for the notice regarding Search Console verification for our site. We have verified domain ownership and configured our application branding details.\n\nPlease let us know if any further verification items are required.\n\nBest regards,\n${connectedUserName}`;
    } else if (lowerSubject.includes("meeting") || lowerBody.includes("sync") || lowerBody.includes("coffee") || lowerBody.includes("schedule")) {
      aiDraftBody = `Hi ${senderName},\n\nThanks for reaching out! I would be glad to connect. The proposed timing works great for me. Looking forward to our discussion.\n\nBest regards,\n${connectedUserName}`;
    } else {
      aiDraftBody = `Hi ${senderName},\n\nThank you for your email regarding "${cleanSubject}". I have reviewed your message and will follow up with any necessary updates shortly.\n\nBest regards,\n${connectedUserName}`;
    }

    return NextResponse.json({
      success: true,
      draft: {
        to: from,
        subject: `Re: ${cleanSubject}`,
        body: aiDraftBody
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to generate AI draft reply." },
      { status: 500 }
    );
  }
}
