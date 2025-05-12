```js
const factory = createHttpClientFactory();

factory.addRequestInterceptor(async (data, next) => {
    data.request = new Request(data.request, {
        // You can override any request properties here
        headers: new Headers({
            ...Object.fromEntries(data.request.headers.entries()),
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`
        }),
    });
    console.log('Request interceptor 1', data.request);
    next();
});

factory.addResponseInterceptor(
    async (data, next) => {
        console.log('Response interceptor 1', data.request, data.response);
        next();
    },
    async (data, next) => {
        console.log('Response interceptor for auth', data.request, data.response);
        
        // Check if response is unauthorized (401)
        if (data.response.status === 401) {
            // Get the refresh token
            let refresh = JSON.parse(localStorage.getItem("user"))?.refresh;
            
            if (refresh !== undefined && refresh !== null) {
                try {
                    // Call refresh token endpoint
                    const refreshResponse = await fetch(
                        import.meta.env.VITE_BACKEND_URL + "/user/refresh",
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + refresh
                            }
                        }
                    );
                    
                    if (refreshResponse.status === 200) {
                        const responseData = await refreshResponse.json();
                        
                        // Update user data in localStorage
                        const userStr = localStorage.getItem("user");
                        let user = userStr ? JSON.parse(userStr) : {};
                        localStorage.setItem("user", JSON.stringify({...user, ...responseData}));
                        
                        // Create new Headers with the filtered entries plus the new Authorization header
                        // const newHeaders = new Headers(data.request.headers.entries());
                        const newHeaders = new Headers(data.request.headers); // this creates a copy of the headers
                        newHeaders.set('Authorization', 'Bearer ' + responseData.token);
                        
                        // Then use these headers in your new Request
                        const newRequest = new Request(data.request, {
                            headers: newHeaders
                        });

                        console.log('New request', newRequest);
                        console.log('Original request', data.request);

                        // Retry the original request with the new token
                        data.response = await fetch(newRequest);
                        
                        // End the interceptor chain with the new response
                        return next();
                    } else {
                        // If refresh token is invalid, redirect to login
                        localStorage.removeItem('user');
                        // You'll need to import navigate or use another navigation method
                        // that works in your context
                        const { navigate } = await import('wouter/use-browser-location');
                        navigate("/login", {replace: true});
                        return next();
                    }
                } catch (error) {
                    console.error("Error in refresh token flow:", error);
                    localStorage.removeItem('user');
                    const { navigate } = await import('wouter/use-browser-location');
                    navigate("/login", {replace: true});
                    return next(error);
                }
            } else {
                // No refresh token available
                localStorage.removeItem('user');
                const { navigate } = await import('wouter/use-browser-location');
                navigate("/login", {replace: true});
                return next();
            }
        }
        
        // For non-401 responses, continue with the interceptor chain
        return next();
    }
);

const httpClient = factory.create(import.meta.env.VITE_BACKEND_URL);

let response = await httpClient.send(`/action-logs/search?page=${page}&page_size=${pageSize}`);

if (!response.ok) {
    throw new Error('Failed to fetch action logs');
}

const data = await response.json();
```