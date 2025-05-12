class HttpClient {
    #requestInterceptors = [];
    #responseInterceptors = [];
    #baseUrl = '';

    constructor(
        baseUrl='',
        requestInterceptors=[],
        responseInterceptors=[]
    ) {
        this.#baseUrl = baseUrl;
        this.#requestInterceptors = requestInterceptors;
        this.#responseInterceptors = responseInterceptors;
    }

    async #executeRequestInterceptors(data) {
        let index = 0;
        const interceptors = this.#requestInterceptors;
        
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
    
    async #executeResponseInterceptors(data) {
        let index = 0;
        const interceptors = this.#responseInterceptors;

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
    
    async send(url, options) {
        let data = {
            request: new Request(this.#baseUrl + url, options),
        }
        const request = await this.#executeRequestInterceptors(data);
        if(request instanceof Error) {
            return new Response(request.message, { status: 424 });
        }
        const response = await fetch(request);
        data.response = response;
        return await this.#executeResponseInterceptors(data);
    }
    
}

class HttpClientFactory {
    constructor() {
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    addRequestInterceptor(...interceptors) {
        interceptors.forEach(interceptor => {
            if (typeof interceptor !== 'function') {
                throw new Error('Request interceptor must be a function');
            }
            this.requestInterceptors.push(interceptor);
        });
        return this;
    }

    addResponseInterceptor(...interceptors) {
        interceptors.forEach(interceptor => {
            if (typeof interceptor !== 'function') {
                throw new Error('Response interceptor must be a function');
            }
            this.responseInterceptors.push(interceptor);
        });
        return this;
    }

    create(baseUrl='') {
        return new HttpClient(
            baseUrl,
            this.requestInterceptors,
            this.responseInterceptors
        );
    }

    async #executeRequestInterceptors(data, interceptors) {
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
    
    async #executeResponseInterceptors(data, interceptors) {
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

    // url, options, responseInterceptors=[], requestInterceptors=[]
    async request(...args) {
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
        const request = await this.#executeRequestInterceptors(data, requestInterceptors);
        if(request instanceof Error) {
            return new Response(request.message, { status: 424 });
        }
        const response = await fetch(request);
        data.response = response;
        return await this.#executeResponseInterceptors(data, responseInterceptors);
    }

}

function createHttpClientFactory() {
    return new HttpClientFactory();
}

