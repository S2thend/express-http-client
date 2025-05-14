import HttpClient from './HttpClient';

/**
 * Factory class for creating HttpClient instances with configured interceptors
 * 
 * @class
 * @description
 * HttpClientFactory provides a fluent interface for configuring and creating
 * HttpClient instances with custom request and response interceptors.
 * Interceptors can be used to modify requests before they are sent or
 * responses before they are returned to the caller.
 */
export default class HttpClientFactory {
    /**
     * Creates a new HttpClientFactory instance
     * 
     * @constructor
     */
    constructor() {
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    /**
     * Adds one or more request interceptors to the factory
     * 
     * @param {...Function} interceptors - Functions that will intercept requests
     * @returns {HttpClientFactory} The current factory instance for chaining
     * @throws {Error} If any interceptor is not a function
     * 
     * @description
     * Request interceptors are executed in the order they are added before a request is sent.
     * Each interceptor should be a function that accepts and can modify the request.
     */
    addRequestInterceptor(...interceptors) {
        interceptors.forEach(interceptor => {
            if (typeof interceptor !== 'function') {
                throw new Error('Request interceptor must be a function');
            }
            this.requestInterceptors.push(interceptor);
        });
        return this;
    }

    /**
     * Adds one or more response interceptors to the factory
     * 
     * @param {...Function} interceptors - Functions that will intercept responses
     * @returns {HttpClientFactory} The current factory instance for chaining
     * @throws {Error} If any interceptor is not a function
     * 
     * @description
     * Response interceptors are executed in the order they are added after a response
     * is received but before it is returned to the caller. Each interceptor should be
     * a function that accepts and can modify the response.
     */
    addResponseInterceptor(...interceptors) {
        interceptors.forEach(interceptor => {
            if (typeof interceptor !== 'function') {
                throw new Error('Response interceptor must be a function');
            }
            this.responseInterceptors.push(interceptor);
        });
        return this;
    }

    /**
     * Creates a new HttpClient instance with the configured interceptors
     * 
     * @param {string} [baseUrl=''] - The base URL to use for all requests made by this client
     * @returns {HttpClient} A new HttpClient instance configured with the specified interceptors
     * 
     * @description
     * Creates and returns a new HttpClient instance with the base URL and all
     * request and response interceptors that have been added to this factory.
     */
    create(baseUrl='') {
        return new HttpClient(
            baseUrl,
            this.requestInterceptors,
            this.responseInterceptors
        );
    }

}