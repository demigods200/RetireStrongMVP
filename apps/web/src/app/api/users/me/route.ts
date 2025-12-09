import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      // Try to get from localStorage via cookie or use accessToken from request
      // For now, we'll get it from the request headers or use a cookie
      // In a real app, you'd use httpOnly cookies, but for MVP we'll use the token from localStorage
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authorization header is required",
          },
        },
        { status: 401 }
      );
    }

    // Forward to API Gateway
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    let response: Response;
    try {
      response = await fetch(`${apiUrl}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });
    } catch (fetchError) {
      // Network error (backend not running, connection refused, etc.)
      console.error("Failed to connect to API Gateway:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONNECTION_ERROR",
            message: "Unable to connect to the server. Please ensure the API server is running.",
          },
        },
        { status: 503 }
      );
    }

    // Try to parse JSON response
    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      // Response is not valid JSON
      console.error("Failed to parse API response:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_RESPONSE",
            message: "Server returned an invalid response",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Unexpected error in /api/users/me:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "An error occurred",
        },
      },
      { status: 500 }
    );
  }
}

