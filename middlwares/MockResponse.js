/**
 * Creates a middleware that mocks HTTP responses based on URL and method
 * 
 * @param {boolean} [isMocked=true] - Whether to enable response mocking
 * @param {Object.<string, Object.<string, function(Request):Response>>} [reqResMap={}] - 
 *   A mapping of URLs to HTTP methods to response handlers.
 *   Format: { '/api/users': { 'GET': (req) => {...}, 'POST': (req) => {...} } }
 * @param {function(Request):Response} [defaultResponse] - 
 *   Function that returns a default Response when no matching URL/method is found.
 *   Defaults to returning a 404 "Resource Not Found" response.
 * 
 * @returns {function({
 *   request: Request,
 *   response: Response,
 *   requestTime: number,
 *   responseTime: number,
 *   store: Map<any, any>
 * }, function():Promise<Response>):Promise<Response>} 
 *   A middleware function that intercepts requests and returns mock responses when enabled
 * 
 * @description
 * This middleware allows for easy mocking of HTTP responses during development or testing.
 * When enabled, it intercepts requests and returns mock responses based on the URL and method.
 * 
 * The reqResMap parameter should be structured as:
 * {
 *   '/api/endpoint': {
 *     'GET': (request) => new Response(JSON.stringify({ data: 'mock data' }), { 
 *       headers: { 'Content-Type': 'application/json' } 
 *     }),
 *     'POST': (request) => new Response('Created', { status: 201 })
 *   }
 * }
 * 
 * If a request doesn't match any entry in the reqResMap, the defaultResponse function is used.
 * 
 * @example
 * // Basic usage
 * const mockMiddleware = MockResponse(true, {
 *   '/api/users': {
 *     'GET': () => new Response(JSON.stringify([{ id: 1, name: 'User' }]), {
 *       headers: { 'Content-Type': 'application/json' }
 *     })
 *   }
 * });
 * 
 * // Disable mocking
 * const conditionalMock = MockResponse(process.env.NODE_ENV === 'development', {...});
 */
export default function MockResponse(isMocked=true, reqResMap={}, defaultResponse=()=>new Response("Resource Not Found",{status:404})) {
    return (data, next) => {
        const url = data.request.url;
        const method = data.request.method;
        if(isMocked) {
            if(
                reqResMap[url] && reqResMap[url][method]
            ) {
                data.response = reqResMap[url][method](data.request);
            } else if(reqResMap[url] && reqResMap[url]["ALL"]){
                data.response = reqResMap[url]["ALL"](data.request);
            } else {
                data.response = defaultResponse(data.request);
            }
        }
        return next();
    }
}