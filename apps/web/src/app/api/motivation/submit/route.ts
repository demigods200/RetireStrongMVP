import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    // Log which API URL is being used (helpful for debugging)
    console.log(`[Next.js API] Using API URL: ${apiUrl}`);
    console.log(`[Next.js API] Request body:`, JSON.stringify(body, null, 2));
    
    let response: Response;
    try {
      response = await fetch(`${apiUrl}/motivation/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (fetchError) {
      console.error("=".repeat(60));
      console.error("❌ [Next.js API] Network error calling API Gateway");
      console.error("=".repeat(60));
      console.error("API URL:", apiUrl);
      console.error("Error Type:", fetchError instanceof Error ? fetchError.constructor.name : typeof fetchError);
      console.error("Error Message:", fetchError instanceof Error ? fetchError.message : String(fetchError));
      if (fetchError instanceof Error && fetchError.stack) {
        console.error("Stack Trace:", fetchError.stack);
      }
      console.error("=".repeat(60));
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: `Failed to connect to API at ${apiUrl}. Please check if the API server is running.`,
            details: fetchError instanceof Error ? fetchError.message : String(fetchError),
            apiUrl: apiUrl,
          },
        },
        { status: 503 }
      );
    }

    let data: any;
    let text: string = "";
    try {
      text = await response.text();
      if (!text) {
        throw new Error("Empty response from API");
      }
      
      // Log raw response text BEFORE parsing
      console.log("=".repeat(60));
      console.log(`[Next.js API] Raw response from API Gateway (${response.status}):`);
      console.log(text);
      console.log("=".repeat(60));
      
      data = JSON.parse(text);
      
      // Log parsed response for debugging
      console.log(`[Next.js API] Parsed response:`, {
        status: response.status,
        success: data.success,
        error: data.error ? {
          code: data.error.code,
          message: data.error.message,
          details: data.error.details,
          requestId: data.error.requestId,
          stack: data.error.stack ? "Present" : "Missing",
        } : null,
      });
    } catch (parseError) {
      console.error("=".repeat(60));
      console.error("❌ [Next.js API] Failed to parse API response");
      console.error("=".repeat(60));
      console.error("Response Status:", response.status);
      console.error("Response Text (first 1000 chars):", text.substring(0, 1000));
      console.error("Response Text (full):", text);
      console.error("Parse Error:", parseError);
      console.error("=".repeat(60));
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PARSE_ERROR",
            message: "Invalid response from API server",
            details: parseError instanceof Error ? parseError.message : String(parseError),
            rawResponse: text.substring(0, 500), // First 500 chars for debugging
          },
        },
        { status: 502 }
      );
    }

    // Pass through the full response, including all error details
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("=".repeat(60));
    console.error("❌ [Next.js API] Unexpected error in motivation submit route");
    console.error("=".repeat(60));
    console.error("Error Type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error Message:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("Stack Trace:", error.stack);
    }
    console.error("Full Error:", error);
    console.error("=".repeat(60));
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while processing the request",
          details: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}

