/// <reference lib="dom" />

declare module 'fetch-retry' {
  type RequestDelayFunction<TResponse> = ((
    attempt: number,
    error: Error | null,
    response: TResponse | null
  ) => number);

  type RequestRetryOnFunction<TResponse> = ((
    attempt: number,
    error: Error | null,
    response: TResponse | null
  ) => boolean | Promise<boolean>);

  interface RetryOptions<TResponse> {
    retries?: number;
    retryDelay?: number | RequestDelayFunction<TResponse>;
    retryOn?: number[] | RequestRetryOnFunction<TResponse>;
  }

  export type RequestInitWithRetry<TFetch extends TFetchStub = typeof fetch> = RetryOptions<TFetchResponse<TFetch>> & TFetchInit<TFetch>;

  type TFetchInput<TFetch> = TFetch extends (input: infer TInput, init?: any) => Promise<any> ? TInput : never;
  type TFetchInit<TFetch> = TFetch extends (input: any, init?: infer TInit) => Promise<any> ? TInit : never;
  type TFetchResponse<TFetch> = TFetch extends (input: any, init?: any) => Promise<infer TResponse> ? TResponse : never;
  type TFetchStub = (input: any, init?: any) => Promise<any>;

  function fetchBuilder<TFetch extends TFetchStub = typeof fetch>(fetch: TFetch, defaults?: RetryOptions<TFetchResponse<TFetch>>): ((input: TFetchInput<TFetch>, init?: RequestInitWithRetry<TFetch>) => Promise<TFetchResponse<TFetch>>);
  export default fetchBuilder;
}
