'use strict';
require('isomorphic-fetch');
require('es6-promise').polyfill();

module.exports = function(url, options) {
  var retries = 3;
  var retryDelay = 1000;
  var retryOn = [];

  if (options && options.retries) {
    retries = options.retries;
  }

  if (options && options.retryDelay) {
    retryDelay = options.retryDelay;
  }

  if (options && options.retryOn) {
    if (options.retryOn instanceof Array) {
      retryOn = options.retryOn;
    } else {
      throw {
        name: 'ArgumentError',
        message: 'retryOn property expects an array'
      }
    }
  }

  return new Promise(function(resolve, reject) {
    var wrappedFetch = function(n) {
      fetch(url, options)
        .then(function(response) {
          if (retryOn.indexOf(response.status) === -1) {
            resolve(response);
          } else {
            if (n > 0) {
              retry(n);
            } else {
              reject(response);
            }
          }
        })
        .catch(function(error) {
          if (n > 0) {
            retry(n);
          } else {
            reject(error);
          }
        });
    };

    function retry(n) {
      setTimeout(function() {
          wrappedFetch(--n);
        }, retryDelay);
    }

    wrappedFetch(retries);
  });
};
