'use strict';
require('isomorphic-fetch');
require('es6-promise').polyfill();

module.exports = function(url, options) {
  var retries = 3;
  var retryDelay = 1000;
  var retryOn = [];

  if (options && options.retries !== undefined) {
    if (isPositiveInteger(options.retries)) {
      retries = options.retries;
    } else {
      throw new ArgumentError('retries must be a positive integer');
    }
  }

  if (options && options.retryDelay !== undefined) {
    if (isPositiveInteger(options.retryDelay) || (typeof options.retryDelay === 'function')) {
      retryDelay = options.retryDelay;
    } else {
      throw new ArgumentError('retryDelay must be a positive integer or a function returning a positive integer');
    }
  }

  if (options && options.retryOn) {
    if (Array.isArray(options.retryOn) || (typeof options.retryOn === 'function')) {
      retryOn = options.retryOn;
    } else {
      throw new ArgumentError('retryOn property expects an array or function');
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

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function ArgumentError(message) {
  this.name = 'ArgumentError';
  this.message = message;
}
