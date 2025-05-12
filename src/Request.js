import { executeRequestInterceptors, executeResponseInterceptors } from './Core';

// url, options, responseInterceptors=[], requestInterceptors=[]
export default async function request(...args) {
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
    const request = await executeRequestInterceptors(data, requestInterceptors);
    if(request instanceof Error) {
        return new Response(request.message, { status: 424 });
    }
    const response = await fetch(request);
    data.response = response;
    return await executeResponseInterceptors(data, responseInterceptors);
}