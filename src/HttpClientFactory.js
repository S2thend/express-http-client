import HttpClient from './HttpClient';

export default class HttpClientFactory {
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

}