'use strict';
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();
const expect = require('expectations');
const childProcess = require('child_process');
const fetchRetry = require('../../');

describe('fetch-retry integration tests', () => {

  const baseUrl = 'http://localhost:3000/mock';

  before(() => {
    const process = childProcess.fork('./test/integration/mock-api/index.js');

    process.on('error', err => {
      console.log(err);
    });
  });

  after(done => {
    return fetchRetry(baseUrl + '/stop', {
      method: 'POST'
    })
    .then(() => {
      done();
    });
  });

  const setupResponses = (responses) => {
    return fetchRetry(baseUrl, {
      method: 'POST',
      body: JSON.stringify(responses),
      headers: {
        'content-type': 'application/json'
      }
    });
  };

  const getCallCount = () => {
    return fetchRetry(`${baseUrl}/calls`)
      .then(response => {
        return response.text();
      })
      .then(text => {
        return Number.parseInt(text);
      });
  }

  [200, 503, 404].forEach(statusCode => {

    describe('when endpoint returns ' + statusCode, () => {
  
      before(() => {
        return setupResponses([statusCode]);
      });
  
      it('does not retry request', () => {
        return fetchRetry(baseUrl)
          .then(getCallCount)
          .should.eventually.equal(1);
      });
  
    });

  });
  
  describe('when configured to retry on a specific HTTP code', () => {

    describe('and it never succeeds', () => {

      const retryOn = [503]

      beforeEach(() => {
        return setupResponses([503, 503, 503, 503]);
      });

      it('retries the request #retries times', () => {
        const url = baseUrl;

        const options = {
          retries: 3,
          retryDelay: 100,
          retryOn
        }

        const expectedCallCount = options.retries + 1;

        return fetchRetry(url, options)
          .catch(getCallCount)
          .should.eventually.equal(expectedCallCount);
      });

      it('eventually rejects promise with the received response of the last request', () => {
        const url = baseUrl;

        const options = {
          retries: 3,
          retryDelay: 100,
          retryOn
        }

        const expectedResponse = {
          status: 503,
          ok: false
        }

        return fetchRetry(url, options)
          .catch(response => {
            return {
              status: response.status,
              ok: response.ok
            };
          })
          .should.become(expectedResponse);
      });

    });

    describe('and it eventually succeeds', () => {

      const retryOnStatus = 503
      const responses = [503, 503, 200];
      const requestsToRetry = responses
          .filter(response => response === retryOnStatus)
          .length;

      beforeEach(() => {
        return setupResponses(responses);
      });

      it('retries the request up to #retries times', () => {
        const url = baseUrl;

        const options = {
          retries: 3,
          retryDelay: 100,
          retryOn: [retryOnStatus]
        }

        const expectedCallCount = requestsToRetry + 1;

        return fetchRetry(url, options)
          .then(getCallCount)
          .should.eventually.equal(expectedCallCount);
      });

      it('eventually resolves the promise with the received response of the last request', () => {
        const url = baseUrl;

        const options = {
          retries: 3,
          retryDelay: 100,
          retryOn: [retryOnStatus]
        }

        const expectedResponse = {
          status: 200,
          ok: true
        }

        return fetchRetry(url, options)
          .then(response => {
            return {
              status: response.status,
              ok: response.ok
            };
          })
          .should.become(expectedResponse);
      });

    });

  });

  describe('when configured to retry on a set of HTTP codes', () => {

    describe('and it never succeeds', () => {

      const retryOn = [503, 404]

      beforeEach(() => {
        return setupResponses([503, 404, 404, 503]);
      });

      it('retries the request #retries times', () => {
        const url = baseUrl;

        const options = {
          retries: 3,
          retryDelay: 100,
          retryOn
        }

        const expectedCallCount = options.retries + 1;

        return fetchRetry(url, options)
          .catch(getCallCount)
          .should.eventually.equal(expectedCallCount);
      });

    });

  });

});