declare const _fetch: typeof fetch;

declare module 'fetch-retry' {
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

  function fetchBuilder(fetch: typeof _fetch): ((input: RequestInfo, options?: IRequestInitWithRetry | undefined) => Promise<Response>);
  export = fetchBuilder;
}