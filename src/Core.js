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