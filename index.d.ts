declare module 'fetch-retry' {
  const _fetch: typeof fetch;

  type RequestDelayFunction = ((
    attempt: number,
    error: Error | null,
    response: Response | null
  ) => number);

  type RequestRetryOnFunction = ((
    attempt: number,
    error: Error | null,
    response: Response | null
  ) => boolean);

  interface IRequestInitWithRetry extends RequestInit {
    retries?: number;
    retryDelay?: number | RequestDelayFunction;
    retryOn?: number[] | RequestRetryOnFunction;
  }

  function fetchBuilder(fetch: typeof _fetch): ((input: RequestInfo, init?: IRequestInitWithRetry) => Promise<Response>);
  export = fetchBuilder;
}