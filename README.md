# fetch-retry
Adds retry functionality to the `Fetch` API by wrapping [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch/) and retrying failing requests.

## npm package

```javascript
npm install fetch-retry --save
```

## Example

`fetch-retry` works the same way as `fetch`, but also accepts a `retries` property on the options argument. If `retries` is not specified, it will default to using 3 retries.

```javascript
var fetch = require('fetch-retry');
```

```javascript
fetch(url, { retries: 5 })
  .then(response => {
    return response.json()
  })
  .then(json => {
    // do something with the result
    console.log(json);
  });
```



### Caveats

The `fetch` specification differs from jQuery.ajax() in mainly two ways that bear keeping in mind:

* The Promise returned from fetch() won't reject on HTTP error status even if the response is a HTTP 404 or 500. Instead, it will resolve normally, and it will only reject on network failure, or if anything prevented the request from completing.

Source: [Github fetch](https://github.com/github/fetch#caveats)
