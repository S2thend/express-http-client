import HttpClientFactory from './src/HttpClientFactory';
import requestFunction from './src/Request';

function createHttpClientFactory() {
    return new HttpClientFactory();
}

export const httpClient = createHttpClientFactory();

export const request = requestFunction;