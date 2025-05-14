import { executeRequestInterceptors, executeResponseInterceptors } from './Core';

/**
 * Makes an HTTP request with support for request and response interceptors
 * 
 * @async
 * @function request
 * @param {string} url - The URL to send the request to
 * @param {RequestInit|Function|Array} [options] - Fetch API options, a request interceptor function, or an array of request interceptors
 * @param {Function|Array} [responseInterceptors] - A response interceptor function or an array of response interceptors
 * @param {Array} [requestInterceptors] - An array of request interceptors (only used when all 4 args are provided)
 * @returns {Promise<Response>} The response after being processed by any response interceptors
 * 
 * @description
 * This function is flexible and can be called with different parameter combinations:
 * - request(url): Simple GET request
 * - request(url, options): Request with fetch options
 * - request(url, requestInterceptor): Request with a single request interceptor
 * - request(url, requestInterceptors[]): Request with multiple request interceptors
 * - request(url, options, responseInterceptor): Request with options and a response interceptor
 * - request(url, options, responseInterceptors[]): Request with options and multiple response interceptors
 * - request(url, requestInterceptor, responseInterceptor): Request with both interceptor types
 * - request(url, options, responseInterceptors, requestInterceptors): Full specification
 * 
 * @throws {Error} When URL is missing or too many arguments are provided
 */
export default async function request(...args) {
    let url = '';
    let options = {};
    let responseInterceptors = [];
    let requestInterceptors = [];

    if (args.length === 0) {
        throw new Error('URL is required');
    }else if (args.length === 1) {
        url = args[0];
    }else if (args.length === 2) {
        url = args[0];
        //optinal options
        if (typeof args[1] === 'object') {
            options = args[1];
        }else if (typeof args[1] === 'function') {
            requestInterceptors.push(args[1]);
        }else if (typeof args[1] === 'array') {
            requestInterceptors.push(...args[1]);
        }
    }else if (args.length === 3) {
        url = args[0];
        //optinal options
        if (typeof args[1] === 'object') {
            options = args[1];
        }else if (typeof args[1] === 'function') {
            requestInterceptors.push(args[1]);
        }else if (typeof args[1] === 'array') {
            requestInterceptors.push(...args[1]);
        }

        if (typeof args[2] === 'function') {
            responseInterceptors.push(args[2]);
        }else if (typeof args[2] === 'array') {
            responseInterceptors.push(...args[2]);
        }
        
    }else if (args.length === 4) {
        url = args[0];
        options = args[1];
        responseInterceptors = args[2];
        requestInterceptors = args[3];
    }else {
        throw new Error(`4 arguments required, but ${args.length} are supplied.`);
    }

    let data = {
        request: new Request(url, options),
    }
    const request = await executeRequestInterceptors(data, requestInterceptors);
    if(request instanceof Error) {
        return new Response(request.message, { status: 424 });
    }
    let response;
    try {
        response = await fetch(request);
    } catch (error) {
        response = new Response(error, { status: 424 });
    }
    data.response = response;
    return await executeResponseInterceptors(data, responseInterceptors);
}