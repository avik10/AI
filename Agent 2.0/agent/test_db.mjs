import { createClient } from "@insforge/sdk";

const insforge = createClient({
  baseUrl: "https://t76pw8yf.us-east.insforge.app",
  anonKey: "anon_5f68decdb9bdc02fde90d43411803218bcc0e9ec369c968bb4f1fef5233a8013",
});

async function main() {
  console.log("Checking connection...");
  const { data, error } = await insforge.database
    .from("users")
    .select("*")
    .limit(5);

  if (error) {
    console.error("Database query failed:", error);
  } else {
    console.log("Database query succeeded! Data length:", data?.length);
    console.log("Sample users:", JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
