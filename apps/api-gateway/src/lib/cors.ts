import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

/**
 * CORS configuration
 */
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD",
};

/**
 * Middleware wrapper that automatically adds CORS headers to all Lambda responses
 * 
 * Usage:
 * const handlerImpl: APIGatewayProxyHandlerV2 = async (event) => {
 *   return {
 *     statusCode: 200,
 *     body: JSON.stringify({ success: true, data: {...} })
 *   };
 * };
 * export const handler = withCORS(handlerImpl);
 */
export function withCORS(
    handler: APIGatewayProxyHandlerV2
): APIGatewayProxyHandlerV2 {
    return async (event, context, callback) => {
        try {
            // Call the actual handler
            // We cast to any to handle both async/promise and callback styles if needed, 
            // but mostly we rely on it returning a promise as is standard in modern Node lambdas
            const result = await (handler as any)(event, context, callback);

            // Handle string responses
            if (typeof result === 'string') {
                return result;
            }

            // Handle void result (callback style) - not supported by this middleware wrapper currently
            if (!result) {
                return result;
            }

            // Add CORS headers to object responses
            return {
                ...result,
                headers: {
                    "Content-Type": "application/json",
                    ...CORS_HEADERS,
                    ...((typeof result === 'object' && result.headers) || {}), // Preserve any existing headers
                },
            };
        } catch (error) {
            // Handle errors and add CORS headers
            console.error("Handler error:", error);
            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json",
                    ...CORS_HEADERS,
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: "INTERNAL_ERROR",
                        message: error instanceof Error ? error.message : "An unexpected error occurred",
                    },
                }),
            };
        }
    };
}
