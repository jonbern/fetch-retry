'use strict';
require('isomorphic-fetch');
var proxyquire = require('proxyquire').noPreserveCache();
var sinon = require('sinon');
var expect = require('expectations');
var Promise = require('es6-promise');

describe('fetch-retry', function() {

  var fetchRetry;

  var deferred1;
  var deferred2;
  var deferred3;
  var deferred4;

  var thenCallback;
  var catchCallback;

  var clock;
  var delay;

  beforeEach(function() {
    delay = 1000;
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  beforeEach(function() {
    deferred1 = defer();
    deferred2 = defer();
    deferred3 = defer();
    deferred4 = defer();

    fetch = sinon.stub();
    fetch.onCall(0).returns(deferred1.promise);
    fetch.onCall(1).returns(deferred2.promise);
    fetch.onCall(2).returns(deferred3.promise);
    fetch.onCall(3).returns(deferred4.promise);

    var stubs = {
      'isomorphic-fetch': fetch
    };

    fetchRetry = proxyquire('../../', stubs);
  });

  describe('#url', function() {

    var expectedUrl = 'http://some-url.com';

    beforeEach(function() {
      fetchRetry(expectedUrl);
    });

    it('passes #url to fetch', function() {
      expect(fetch.getCall(0).args[0]).toBe(expectedUrl);
    });

  });

  describe('#options', function() {

    describe('when #options is provided', function() {

      var options;

      beforeEach(function() {
        options = {
          retries: 3,
          whatever: 'something'
        };

        fetchRetry('http://someUrl', options);
      });

      it('passes options to fetch', function() {
        expect(fetch.getCall(0).args[1]).toEqual(options);
      });

      describe('when #options.retryOn is not an array', () => {

        it('throws exception', () => {
          expect(function() {
            options.retryOn = 503;
            fetchRetry('http://someUrl', options);
          }).toThrow({
            name: 'ArgumentError',
            message: 'retryOn property expects an array'
          });
        });

      });

    });

    describe('when #options is undefined or null', function() {

      [undefined, null].forEach(function(testCase) {

        beforeEach(function() {
          fetchRetry('http://someUrl', testCase);
        });

        it('does not pass through options to fetch', function() {
          expect(fetch.getCall(0).args[1]).toEqual(undefined);
        });

      });

    });

  });

  describe('when #options.retries=3 (default)', function() {

    beforeEach(function() {
      thenCallback = sinon.spy();
      catchCallback = sinon.spy();

      fetchRetry('http://someurl')
        .then(thenCallback)
        .catch(catchCallback);
    });

    describe('when first call is a success', function() {

      beforeEach(function() {
        deferred1.resolve({ status: 200 });
      });

      describe('when resolved', function() {

        it('invokes the then callback', function() {
          expect(thenCallback.called).toBe(true);
        });

        it('calls fetch once', function() {
          expect(fetch.callCount).toBe(1);
        });

      });

    });

    describe('when first call is a failure', function() {

      beforeEach(function() {
        deferred1.reject();
      });

      describe('when second call is a succcess', function() {

        beforeEach(function() {
          clock.tick(delay);
          deferred2.resolve({ status: 200 });
        });

        describe('when resolved', function() {

          it('invokes the then callback', function() {
            expect(thenCallback.called).toBe(true);
          });

          it('calls fetch twice', function() {
            expect(fetch.callCount).toBe(2);
          });

        });

      });

      describe('when second call is a failure', function() {

        beforeEach(function() {
          deferred2.reject();
          clock.tick(delay);
        });

        describe('when third call is a success', function() {

          beforeEach(function() {
            deferred3.resolve({ status: 200 });
            clock.tick(delay);
          });

          describe('when resolved', function() {

            it('invokes the then callback', function() {
              expect(thenCallback.called).toBe(true);
            });

            it('calls fetch three times', function() {
              expect(fetch.callCount).toBe(3);
            });

          });

        });

        describe('when third call is a failure', function() {

          beforeEach(function() {
            deferred3.reject();
            clock.tick(delay);
          });

          describe('when fourth call is a success', function() {

            beforeEach(function() {
              deferred4.resolve({ status: 200 });
              clock.tick(delay);
            });

            describe('when resolved', function() {

              it('invokes the then callback', function() {
                expect(thenCallback.called).toBe(true);
              });

              it('calls fetch four times', function() {
                expect(fetch.callCount).toBe(4);
              });

            });

          });

          describe('when fourth call is a failure', function() {

            beforeEach(function() {
              deferred4.reject();
              clock.tick(delay);
            });

            describe('when rejected', function() {

              it('invokes the catch callback', function() {
                expect(catchCallback.called).toBe(true);
              });

              it('does not call fetch again', function() {
                expect(fetch.callCount).toBe(4);
              });

            });

          });

        });

      });

    });

  });

  describe('when #options.retries=1', function() {

    beforeEach(function() {
      thenCallback = sinon.spy();
      catchCallback = sinon.spy();

      fetchRetry('http://someurl', { retries: 1 })
        .then(thenCallback)
        .catch(catchCallback);
    });

    describe('when first call is a success', function() {

      beforeEach(function() {
        deferred1.resolve({ status: 200 });
      });

      describe('when resolved', function() {

        it('invokes the then callback', function() {
          expect(thenCallback.called).toBe(true);
        });

        it('calls fetch once', function() {
          expect(fetch.callCount).toBe(1);
        });

      });

    });

    describe('when first call is a failure', function() {

      beforeEach(function() {
        deferred1.reject();
        clock.tick(delay);
      });

      describe('when second call is a succcess', function() {

        beforeEach(function() {
          deferred2.resolve({ status: 200 });
          clock.tick(delay);
        });

        describe('when resolved', function() {

          it('invokes the then callback', function() {
            expect(thenCallback.called).toBe(true);
          });

          it('calls fetch twice', function() {
            expect(fetch.callCount).toBe(2);
          });

        });

      });

      describe('when second call is a failure', function() {

        beforeEach(function() {
          deferred2.reject();
          clock.tick(delay);
        });

        describe('when rejected', function() {

          it('invokes the catch callback', function() {
            expect(catchCallback.called).toBe(true);
          });

          it('does not call fetch again', function() {
            expect(fetch.callCount).toBe(2);
          });

        });

      });

    });

  });

  describe('when #options.retryDelay is provided', function() {

    var options;
    var retryDelay;

    beforeEach(function() {
      retryDelay = 5000;
      options = {
        retryDelay: retryDelay
      };

      thenCallback = sinon.spy();

      fetchRetry('http://someUrl', options)
        .then(thenCallback)
    });

    describe('when first call is unsuccessful', function() {

      beforeEach(function() {
        deferred1.reject();
      });

      describe('after specified time', function() {

        beforeEach(function() {
          clock.tick(retryDelay);
        });

        it('invokes fetch again', function() {
          expect(fetch.callCount).toBe(2);
        });

      });

      describe('after less than specified time', function() {

        beforeEach(function() {
          clock.tick(1000);
        });

        it('does not invoke fetch again', function() {
          expect(fetch.callCount).toBe(1);
        });

      });

    });

  });

});

function defer() {
  var resolve, reject;
  var promise = new Promise(function() {
    resolve = arguments[0];
    reject = arguments[1];
  });
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  };
}
