# fetch-retry

Adds retry functionality to the [Fetch](https://fetch.spec.whatwg.org/) API.

It wraps any `fetch` API package (eg: [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch), [cross-fetch](https://github.com/lquixada/cross-fetch), [isomorphic-unfetch](https://github.com/developit/unfetch), or [Node.js native's fetch implementation](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch)) and retries requests that fail due to network issues. It can also be configured to retry requests on specific HTTP status codes.

[![Node.js CI](https://github.com/jonbern/fetch-retry/actions/workflows/node.js.yml/badge.svg)](https://github.com/jonbern/fetch-retry/actions/workflows/node.js.yml)

## npm package

```javascript
npm install fetch-retry --save
```

## Example
`fetch-retry` is used the same way as `fetch`, but also accepts `retries`, `retryDelay`, and `retryOn` on the `options` object.

These properties are optional, and unless different defaults have been specified when requiring `fetch-retry`, these will default to 3 retries, with a 1000ms retry delay, and to only retry on network errors.

```javascript
const originalFetch = require('isomorphic-fetch');
const fetch = require('fetch-retry')(originalFetch);

// fetch-retry can also wrap Node.js's native fetch API implementation:
const fetch = require('fetch-retry')(global.fetch);
```

```javascript
fetch(url, {
    retries: 3,
    retryDelay: 1000
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    // do something with the result
    console.log(json);
  });
```

or passing your own defaults:

```javascript
const originalFetch = require('isomorphic-fetch');
const fetch = require('fetch-retry')(originalFetch, {
    retries: 5,
    retryDelay: 800
  });
```

> `fetch-retry` uses promises and requires you to polyfill the Promise API in order to support Internet Explorer.


## Example: Exponential backoff
The default behavior of `fetch-retry` is to wait a fixed amount of time between attempts, but it is also possible to customize this by passing a function as the `retryDelay` option. The function is supplied three arguments: `attempt` (starting at 0), `error` (in case of a network error), and `response`. It must return a number indicating the delay.

```javascript
fetch(url, {
    retryDelay: function(attempt, error, response) {
      return Math.pow(2, attempt) * 1000; // 1000, 2000, 4000
    }
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    // do something with the result
    console.log(json);
  });
```

## Example: Retry on 503 (Service Unavailable)
The default behavior of `fetch-retry` is to only retry requests on network related issues, but it is also possible to configure it to retry on specific HTTP status codes. This is done by using the `retryOn` property, which expects an array of HTTP status codes.

```javascript
fetch(url, {
    retryOn: [503]
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    // do something with the result
    console.log(json);
  });
```

## Example: Retry custom behavior
The `retryOn` option may also be specified as a function, in which case it will be supplied three arguments: `attempt` (starting at 0), `error` (in case of a network error), and `response`. Return a truthy value from this function in order to trigger a retry, any falsy value will result in the call to fetch either resolving (in case the last attempt resulted in a response), or rejecting (in case the last attempt resulted in an error).

```javascript
fetch(url, {
    retryOn: function(attempt, error, response) {
      // retry on any network error, or 4xx or 5xx status codes
      if (error !== null || response.status >= 400) {
        console.log(`retrying, attempt number ${attempt + 1}`);
        return true;
      }
    })
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      // do something with the result
      console.log(json);
    });
```

## Example: Retry custom behavior with async
The `retryOn` option may also be used with async and await for calling asyncronous functions:

```javascript
fetch(url, {
    retryOn: async function(attempt, error, response) {
      if (attempt > 3) return false;

      if (error !== null) {
        var json = await response.json();
        if (json.property !== undefined) {
          return true;
        }
      }
    })
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      // do something with the result
      console.log(json);
    });
```

## Example: Initial delay
By default the request is made as soon as the function is called, this might not always be a good thing when you are handing an API which has some kind of [burst throttling mecanism](https://stackoverflow.com/questions/70423503/api-gateway-throttling-burst-limit-vs-rate-limit).
In those cases, you can introduce a number indicating of milliseconds that you would like to delay between the function call and the endpoint call.
You can also customize this by passing a function as the `initialDelay` function, indicating how to calculate this delay.

```javascript
fetch(url, {
    initialDelay: function() {
        return Math.random() * 1000; // Random delay beween 0 and 1000ms
    },
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    // do something with the result
    console.log(json);
  });
```