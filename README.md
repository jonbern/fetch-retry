# fetch-retry

Adds retry functionality to the `Fetch` API.

It wraps [isomorphic-fetch](https://github.com/matthew-andrews/isomoretries) and retries requests that fail due to network issues.

[![Build Status](https://travis-ci.org/jonbern/fetch-retry.svg?branch=master)](https://travis-ci.org/jonbern/fetch-retry)

## npm package

```javascript
npm install fetch-retry --save
```

## Example
`fetch-retry` is used the same way as `fetch`, but in addition accepts `retries` and `retryDelay` on the `options` argument. When omitted it will default to 3 retries with a 1000ms retry delay.

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

### Caveats

The `fetch` specification differs from jQuery.ajax() in mainly two ways that bear keeping in mind:

* The Promise returned from fetch() won't reject on HTTP error status even if the response is a HTTP 404 or 500. Instead, it will resolve normally, and it will only reject on network failure, or if anything prevented the request from completing.

Source: [Github fetch](https://github.com/github/fetch#caveats)
