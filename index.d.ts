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

  function fetchRetry(url: String, options?: IRequestInitWithRetry): Promise<Response>;

  function fetchBuilder(fetch: (url: String, options?: RequestInit) => Promise<Response>): fetchRetry;
  export = fetchBuilder;
}