import { executeRequestInterceptors, executeResponseInterceptors } from './Core';

/**
 * HTTP client with request/response interceptor support
 * 
 * @class
 * @description
 * A fetch-based HTTP client that supports middleware-style interceptors
 * for both requests and responses. Allows setting a base URL that will
 * be prepended to all request URLs.
 */
export default class HttpClient {
    /** @type {Function[]} Private array of request interceptor functions */
    #requestInterceptors = [];
    
    /** @type {Function[]} Private array of response interceptor functions */
    #responseInterceptors = [];
    
    /** @type {string} Private base URL to prepend to all requests */
    #baseUrl = '';

    /**
     * Creates a new HTTP client
     * 
     * @constructor
     * @param {string} [baseUrl=''] - Base URL to prepend to all requests
     * @param {Function[]} [requestInterceptors=[]] - Array of request interceptor functions
     * @param {Function[]} [responseInterceptors=[]] - Array of response interceptor functions
     */
    constructor(
        baseUrl='',
        requestInterceptors=[],
        responseInterceptors=[]
    ) {
        this.#baseUrl = baseUrl;
        this.#requestInterceptors = requestInterceptors;
        this.#responseInterceptors = responseInterceptors;
    }
    
    /**
     * Sends an HTTP request with the given URL and options.
     * 
     * @async
     * @param {string} url - The URL path to send the request to (will be appended to baseUrl)
     * @param {RequestInit} [options] - Fetch API options for the request
     * @returns {Promise<Response>} The response after being processed by any response interceptors
     * 
     * @description
     * This method:
     * 1. Creates a Request object combining baseUrl and the provided url
     * 2. Processes the request through any request interceptors
     * 3. If request processing fails, returns a 424 (Failed Dependency) response
     * 4. Executes the fetch operation with the processed request
     * 5. Processes the response through any response interceptors
     * 6. Returns the final response
     */
    async send(url, options) {
        let data = {
            request: new Request(this.#baseUrl + url, options),
        }
        const request = await executeRequestInterceptors(data, this.#requestInterceptors);
        if(request instanceof Error) {
            return new Response(request.message, { status: 424 });
        }
        const response = await fetch(request);
        data.response = response;
        return await executeResponseInterceptors(data, this.#responseInterceptors);
    }
    
}
