// API client for making requests to the backend
// Handles both development (localhost) and production (AWS API Gateway) environments

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Build API URL for the given endpoint
 * In dev: uses localhost:3001 or NEXT_PUBLIC_API_URL
 * In production: uses AWS API Gateway URL from NEXT_PUBLIC_API_URL
 */
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: "Request failed" }))) as { message?: string };
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const data = (await response.json().catch(() => ({}))) as T;
  return data;
}

