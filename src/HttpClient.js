import { executeRequestInterceptors, executeResponseInterceptors } from './Core';

export default class HttpClient {
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
