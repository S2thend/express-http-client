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

    async #executeRequestInterceptors(request) {
        let index = 0;
        const interceptors = this.#requestInterceptors;
        
        const next = async (error) => {
            if (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                    return error;
                }else {
                    console.error(error);
                    return new Error(error);
                }
            }
            const interceptor = interceptors[index++];
            
            if (!interceptor) {
                // End of interceptor chain, return request
                return request;
            }
            
            // Call the current interceptor with request and next
            await interceptor(request, next);
        };
        
        // Start the interceptor chain
        await next();
        return request;
    }
    
    async #executeResponseInterceptors(request, response) {
        let index = 0;
        const interceptors = this.#responseInterceptors;

        const next = async (error) => {
            if (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                    return new Response(error.message, { status: 424 });
                }else {
                    console.error(error);
                    return new Response(error, { status: 424 });
                }
            }

        
            const interceptor = interceptors[index++];

            
            if (!interceptor) {
                // End of interceptor chain, return response
                return response;
            }
            
            // Call the current interceptor with response and next
            await interceptor(request, response, next);
        };
        
        // Start the interceptor chain
        await next();
        return response;
    }
    
    async send(url, options) {
        let request = new Request(this.#baseUrl + url, options);
        request = await this.#executeRequestInterceptors(request);
        if(request instanceof Error) {
            return new Response(request.message, { status: 424 });
        }
        let response = await fetch(request);
        response = await this.#executeResponseInterceptors(request, response);
        return response;
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
    }

    addResponseInterceptor(...interceptors) {
        interceptors.forEach(interceptor => {
            if (typeof interceptor !== 'function') {
                throw new Error('Response interceptor must be a function');
            }
            this.responseInterceptors.push(interceptor);
        });
    }

    create(baseUrl='') {
        return new HttpClient(
            baseUrl,
            this.requestInterceptors,
            this.responseInterceptors
        );
    }

    async #executeRequestInterceptors(request, interceptors) {
        let index = 0;
        
        const next = async () => {
            const interceptor = interceptors[index++];
            
            if (!interceptor) {
                // End of interceptor chain, return request
                return request;
            }
            
            // Call the current interceptor with request and next
            await interceptor(request, next);
        };
        
        // Start the interceptor chain
        await next();
    }
    
    async #executeResponseInterceptors(request, response, interceptors) {
        let index = 0;
        
        const next = async () => {
            const interceptor = interceptors[index++];
            
            if (!interceptor) {
                // End of interceptor chain, return response
                return response;
            }
            
            // Call the current interceptor with response and next
            await interceptor(request, response, next);
        };
        
        // Start the interceptor chain
        await next();
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
            throw new Error(`4 arguments required, ${args.length} are supplied.`);
        }

        let request = new Request(url, options);
        request = await this.#executeRequestInterceptors(request);
        let response = await fetch(request);
        response = await this.#executeResponseInterceptors(request, response);
        return response;
    }

}

function createHttpClientFactory() {
    return new HttpClientFactory();
}

export default createHttpClientFactory;