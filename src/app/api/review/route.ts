import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    console.log("Received URL:", url);

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return new Response(
        JSON.stringify({ error: "Invalid URL" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&key=${''}&strategy=desktop&category=performance&category=accessibility&category=seo`;

    console.log("Fetching PageSpeed API with URL:", psiUrl);

    const response = await fetch(psiUrl);

    if (!response.ok) {
      console.error("PageSpeed API fetch failed:", response.status, response.statusText);
      throw new Error(`Failed to fetch PageSpeed data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("PageSpeed API response data:", data);

    // rest of your code...

    return new Response(
      JSON.stringify({
        performance: data.lighthouseResult?.categories.performance?.score * 100 || null,
        accessibility: data.lighthouseResult?.categories.accessibility?.score * 100 || null,
        seo: data.lighthouseResult?.categories.seo?.score * 100 || null,
        httpsUsed: url.startsWith("https://"),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in POST /api/review:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
