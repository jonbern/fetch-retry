'use strict';
var fetch = require('isomorphic-fetch');
var Promise = require("bluebird");

module.exports = function(url, options) {

  var retries = 3;

  if (options && options.retries) {
    retries = options.retries
  };

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
            }, 1000);
          } else {
            reject(error);
          }
        });
    }
    wrappedFetch(retries);
  });
};
