import HttpClientFactory from './src/HttpClientFactory';
import requestFunction from './src/Request';
import Logger from './middlwares/Logger';
import MockResponse from './middlwares/MockResponse';

function createHttpClientFactory() {
    return new HttpClientFactory();
}

export const httpClient = createHttpClientFactory();

export const request = requestFunction;

export const logger = Logger;

export const mockResponse = MockResponse;