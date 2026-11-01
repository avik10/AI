// Real Google Gemini AI API Integration Utility
export async function callGeminiAi(prompt: string, systemInstruction?: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GOOGLE_API_KEY || "";
  
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction ? systemInstruction + "\n\n" : ""}${prompt}` }]
            }
          ]
        })
      });

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
    } catch (err) {
      console.warn("Google Gemini API call error:", err);
    }
  }

  return null;
}
