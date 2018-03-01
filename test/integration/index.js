'use strict';
const sinon = require('sinon');
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

  const clearCallCount = () => {
    return fetchRetry(baseUrl, {
      method: 'DELETE'
    });
  };

  const getCallCount = () => {
    return fetchRetry(baseUrl)
      .then(response => {
        return response.text();
      })
      .then(text => {
        return Number.parseInt(text);
      });
  }

  describe('when endpoint returns 200', () => {

    beforeEach(done => {
      clearCallCount().then(() => {
        done();
      });
    });

    it('does not retry request', done => {
      const url = `${baseUrl}/200`;
      fetchRetry(url)
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.ok).toBe(true);
          return getCallCount();
        })
        .then(callCount => {
          expect(callCount).toBe(1);
          done();
        })
        .catch(err => {
          console.log(err);
        });
    });

  });

  describe('when endpoint returns 503', () => {

    beforeEach(done => {
      clearCallCount().then(() => {
        done();
      });
    });

    it('does not retry request', done => {
      const url = `${baseUrl}/503`;
      fetchRetry(url)
        .then(response => {
          expect(response.status).toBe(503);
          expect(response.ok).toBe(false);
          return getCallCount();
        })
        .then(callCount => {
          expect(callCount).toBe(1);
          done();
        })
        .catch(err => {
          console.log(err);
        });
    });

  });

  describe('when endpoint returns 404', () => {

    beforeEach(done => {
      clearCallCount().then(() => {
        done();
      });
    });

    it('does not retry request', done => {
      const url = `${baseUrl}/404`;
      fetchRetry(url)
        .then(response => {
          expect(response.status).toBe(404);
          expect(response.ok).toBe(false);
          return getCallCount();
        })
        .then(callCount => {
          expect(callCount).toBe(1);
          done();
        })
        .catch(err => {
          console.log(err);
        });
    });

  });

});