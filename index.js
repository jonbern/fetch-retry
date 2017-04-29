'use strict';
var fetch = require('isomorphic-fetch');
var Promise = require('es6-promise');

module.exports = function(url, options) {

  var retries = 3;
  var retryDelay = 1000;

  if (options && options.retries) {
    retries = options.retries;
  }

  if (options && options.retryDelay) {
    retryDelay = options.retryDelay;
  }

  return new Promise(function(resolve, reject) {
    var wrappedFetch = function(n) {
      fetch(url, options)
        .then(function(response) {
          resolve(response);
        })
        .catch(function(error) {
          if (n > 0) {
            setTimeout(function() {
              wrappedFetch(--n);
            }, retryDelay);
          } else {
            reject(error);
          }
        });
    };
    wrappedFetch(retries);
  });
};
