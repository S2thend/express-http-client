import HttpClientFactory from './src/HttpClientFactory';
import request from './src/Request';

function createHttpClientFactory() {
    return new HttpClientFactory();
}

export const httpClient = createHttpClientFactory();

export const request = request;