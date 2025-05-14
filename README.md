# Express Http Client
[![npm badge](https://img.shields.io/badge/npm-0.3.6-blue.svg)](https://www.npmjs.com/package/express-http-client)
[![compatibility badge](https://img.shields.io/badge/compatibility->=ES6-blue.svg)](https://shields.io/)
[![gzipped_size badge](https://img.shields.io/badge/gzip-1.3_kB-red.svg)](https://shields.io/)
[![production_size badge](https://img.shields.io/badge/prod-3.7_kB-red.svg)](https://shields.io/)
[![License badge](https://img.shields.io/badge/License-MIT-<COLOR>.svg)](https://shields.io/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

A light-weight javascript http request library built in conscious of middleware design pattern.
(requires fetch api)

This project aims to reduce user mental effort and give user more control over the request process by provide only minimal features.

The middleware usage is as intuitive as using expressjs server middleware by using next() to pass control to the next middleware.

It will minimize effort to migrate from fetch to this library and work out of the box by just simply rename fetch to request in your project.

## Quick Start
### one time request

```js
import { request } from 'express-http-client';

await request(
    "https://example.com/api/v1/posts",
    {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + refresh
        }
    },
    // response interceptors
    [
        //example response interceptor middleware
        (data, next) => {
            data.response.json().then(json => {
                console.log(json);
                next();
            }).catch(error => {
                next(error);
            });
        }
    ],
    // request interceptors
    []
);
```

### httpClient

```js
import {httpClient as expressHttpClient, logger, mockResponse} from 'express-http-client';

//create a new http client instance, you can create multiple http client instance for different purpose
let httpClient = expressHttpClient();

//add request interceptor middleware: example to add authorization header
httpClient.addRequestInterceptor(async (data, next) => {
    data.request = new Request(data.request, {
        // You can override any request properties here
        headers: new Headers({
            ...Object.fromEntries(data.request.headers.entries()),
            'Authorization': `Bearer token`
        }),
    });
    next();
});

//add response interceptor middleware: example
httpClient.addResponseInterceptor(
    //use built in logger interceptor middleware to log the request and response
    logger(),
);

httpClient = httpClient.create("replace with your base url");

let response = await httpClient.send(`/api/v1/posts`);
```

## Api

### interceptor function

#### parameters

- `data`: the data object
    - `request`: the request object
    - `response`: the response object
    - `store`: a map store for data persistence between interceptors
- `next`: the next function


## built in interceptor functions

### logger

### mockResponse

```js
import {httpClient as expressHttpClient, logger, mockResponse} from 'express-http-client';

let httpClient = expressHttpClient();

httpClient.addResponseInterceptor(
    mockResponse(
        true,
        // supply the mock response mapping object here(url.method -> response)
        {
            "http://example.com/api/v1/posts": {
                //mock response for GET request
                "GET": ()=> new Response(JSON.stringify(
                    //mock response data
                ))
            },
            "http://example.com/api/v1/posts": {
                //mock response for all request
                "ALL": ()=> new Response(JSON.stringify(
                    //mock response data
                ))
            },
        }
    )
)
```