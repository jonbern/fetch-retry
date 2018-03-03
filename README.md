# fetch-retry

Adds retry functionality to the `Fetch` API.

It wraps [isomorphic-fetch](https://github.com/matthew-andrews/isomoretries) and retries requests that fail due to network issues. It can also be configured to retry requests on specific HTTP status codes.

[![Build Status](https://travis-ci.org/jonbern/fetch-retry.svg?branch=master)](https://travis-ci.org/jonbern/fetch-retry)

## npm package

```javascript
npm install fetch-retry --save
```

## Example
`fetch-retry` is used the same way as `fetch`, but also accepts `retries` and `retryDelay` on the `options` object. 

These properties are optional, and when omitted will default to 3 retries and a 1000ms retry delay.

```javascript
var fetch = require('fetch-retry');
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