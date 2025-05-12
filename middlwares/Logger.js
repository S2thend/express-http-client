/**
 * Creates a middleware that logs HTTP requests and responses with color formatting
 * 
 * @returns {function({
 *   request: Request, 
 *   response: Response, 
 *   requestTime: number, 
 *   responseTime: number, 
 *   store: Map<any, any>
 * }, function():void, function():void):Promise<void>} 
 *   A middleware function that logs request details with the following parameters:
 *   - {Object} data - The request/response data object containing:
 *     - {Request} request - The HTTP request object with method and url properties
 *     - {Response} response - The HTTP response object with status property
 *     - {number} requestTime - The timestamp when the request was received
 *     - {number} responseTime - The timestamp when the response was sent
 *     - {Map<any, any>} store - A Map object for storing data between interceptors
 *   - {function():void} next - Function to call to proceed to the next middleware
 *   - {function():void} end - Function to call to end the middleware chain
 * 
 * @description
 * This middleware logs HTTP requests with the following information:
 * - Timestamp in ISO format
 * - Status code (color-coded by response type)
 * - HTTP method (color-coded by method type)
 * - Request URL
 * - Response time (color-coded by performance)
 * 
 * Color coding:
 * - Status: Green for 2xx, Yellow for 3xx, Red for 4xx/5xx
 * - Method: Cyan for most methods, Magenta for POST, Red for DELETE
 * - Response time: Green for <100ms, Yellow for <1000ms, Red for ≥1000ms
 */
export default function Logger (){
    return async function (data, next, end) {
        const { status } = data.response;
        const { method, url } = data.request;
        const responseTime = data.responseTime - data.requestTime;
        
        // Status color based on code
        let statusColor = '\x1b[32m'; // Green for success (2xx)
        if (status >= 400) statusColor = '\x1b[31m'; // Red for errors (4xx, 5xx)
        else if (status >= 300) statusColor = '\x1b[33m'; // Yellow for redirects (3xx)
        
        // Method color
        let methodColor = '\x1b[36m'; // Cyan for most methods
        if (method === 'POST') methodColor = '\x1b[35m'; // Magenta for POST
        if (method === 'DELETE') methodColor = '\x1b[31m'; // Red for DELETE
        
        // Reset color code
        const reset = '\x1b[0m';
        
        // Format response time
        const formattedTime = responseTime < 100 
            ? `\x1b[32m${responseTime}ms\x1b[0m` // Green if fast
            : responseTime < 1000 
                ? `\x1b[33m${responseTime}ms\x1b[0m` // Yellow if medium
                : `\x1b[31m${responseTime}ms\x1b[0m`; // Red if slow
        
        console.log(
            `[${new Date(data.responseTime).toISOString()}] ` +
            `${statusColor}${status}${reset} ` +
            `${methodColor}${method.padEnd(7)}${reset} ` +
            `${url.padEnd(30)} ` +
            `${formattedTime}`
        );
        
        next();
    }
}

