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
    if (Array.isArray(options.retryOn)) {
      retryOn = options.retryOn;
    } else if (typeof options.retryOn === 'function') {
      retryOn = options.retryOn;
    } else {
      throw {
        name: 'ArgumentError',
        message: 'retryOn property expects an array or function'
      };
    }
  }

  return new Promise(function(resolve, reject) {
    var wrappedFetch = function(attempt) {
      fetch(url, options)
        .then(function(response) {
          if (Array.isArray(retryOn) && retryOn.indexOf(response.status) === -1) {
            resolve(response);
          } else if (typeof retryOn === 'function') {
            if (retryOn(attempt, null, response)) {
              retry(attempt, null, response);
            } else {
              resolve(response);
            }
          } else {
            if (attempt < retries) {
              retry(attempt, null, response);
            } else {
              resolve(response);
            }
          }
        })
        .catch(function(error) {
          if (typeof retryOn === 'function') {
            if (retryOn(attempt, error, null)) {
              retry(attempt, error, null);
            } else {
              reject(error);
            }
          } else if (attempt < retries) {
            retry(attempt, error, null);
          } else {
            reject(error);
          }
        });
    };

    function retry(attempt, error, response) {
      var delay = (typeof retryDelay === 'function') ?
        retryDelay(attempt, error, response) : retryDelay;
      setTimeout(function() {
        wrappedFetch(++attempt);
      }, delay);
    }

    wrappedFetch(0);
  });
};
