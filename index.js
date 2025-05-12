import HttpClientFactory from './src/HttpClientFactory';
import requestFunction from './src/Request';
import Logger from './middlwares/Logger';

function createHttpClientFactory() {
    return new HttpClientFactory();
}

export const httpClient = createHttpClientFactory();

export const request = requestFunction;

export const logger = Logger;