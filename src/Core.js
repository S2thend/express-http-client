/**
 * Executes a chain of request interceptors sequentially
 * 
 * @async
 * @param {Object} data - The data object containing the request
 * @param {Request} data.request - The Request object to be processed
 * @param {Function[]} interceptors - Array of request interceptor functions
 * @returns {Promise<Request|Error>} The processed request or an Error if interceptor chain fails
 * 
 * @description
 * Each interceptor in the chain receives:
 * - data: The data object containing the request
 * - next: Function to proceed to the next interceptor
 * - end: Function to end the interceptor chain early
 * 
 * Interceptors can modify the request, pass control to the next interceptor,
 * end the chain early, or reject with an error.
 */
export async function executeRequestInterceptors(data, interceptors) {
    let index = 0;
    
    return await new Promise((resolve, reject) => {
        const end = () => {
            resolve(data.request);
        };
        
        const next = async (error) => {
            if (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                    reject(error);
                    return;
                } else {
                    console.error(error);
                    reject(new Error(error));
                    return;
                }
            }
            
            const interceptor = interceptors[index++];
            
            if (!interceptor) {
                // End of interceptor chain, resolve with request
                resolve(data.request);
                return;
            }
            
            try {
                // Call the current interceptor with request, end and next
                await interceptor(data, next, end);
            } catch (err) {
                reject(err);
            }
        };
        
        // Start the interceptor chain
        next();
    });
}

/**
 * Executes a chain of response interceptors sequentially
 * 
 * @async
 * @param {Object} data - The data object containing the response
 * @param {Response} data.response - The Response object to be processed
 * @param {Function[]} interceptors - Array of response interceptor functions
 * @returns {Promise<Response>} The processed response
 * 
 * @description
 * Each interceptor in the chain receives:
 * - data: The data object containing the response
 * - next: Function to proceed to the next interceptor
 * - end: Function to end the interceptor chain early
 * 
 * Interceptors can modify the response, pass control to the next interceptor,
 * end the chain early, or handle errors. Errors in response interceptors
 * result in a 424 Failed Dependency response rather than rejecting the promise.
 */
export async function executeResponseInterceptors(data, interceptors) {
    let index = 0;

    return await new Promise((resolve, reject) => {
        const end = () => {
            resolve(data.response);
        };

        const next = async (error) => {
            if (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                    resolve(new Response(error.message, { status: 424 }));
                }else {
                    console.error(error);
                    resolve(new Response(error, { status: 424 }));
                }
            }
        
            const interceptor = interceptors[index++];

            
            if (!interceptor) {
                // End of interceptor chain, return response
                resolve(data.response);
                return;
            }
            
            try {
                // Call the current interceptor with response and next
                await interceptor(data, next, end);
            } catch (err) {
                resolve(new Response(err, { status: 424 }));
            }
        };
        
        // Start the interceptor chain
        next();
    });
    
}