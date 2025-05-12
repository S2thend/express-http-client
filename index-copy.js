class HttpClient {
    constructor() {
        this.baseUrl = '';
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
}

function createHttpClient() {
    return new HttpClient();
}

module.exports = createHttpClient;