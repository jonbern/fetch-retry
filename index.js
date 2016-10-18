'use strict';
var fetch = require('isomorphic-fetch');
var Promise = require('bluebird');

module.exports = function(url, options) {

  var retries = 3;
  var timeout = 1000;

  if (options && options.retries) {
    retries = options.retries;
  }

  if (options && options.timeout) {
    timeout = options.timeout;
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
            }, timeout);
          } else {
            reject(error);
          }
        });
    };
    wrappedFetch(retries);
  });
};
