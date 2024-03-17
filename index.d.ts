declare module 'fetch-retry' {
  export type FetchLibrary = (input: any, init?: any) => Promise<any>;

  export type RequestDelayFunction<F extends FetchLibrary> = (
    attempt: number,
    error: Error | null,
    response: Awaited<ReturnType<F>> | null,
  ) => number;

  export type RequestRetryOnFunction<F extends FetchLibrary> = (
    attempt: number,
    error: Error | null,
    response: Awaited<ReturnType<F>> | null,
  ) => boolean | Promise<boolean>;

  export type RequestInitRetryParams<F extends FetchLibrary> = {
    retries?: number;
    retryDelay?: number | RequestDelayFunction<F>;
    retryOn?: number[] | RequestRetryOnFunction<F>;
  };

  export type RequestInitWithRetry<F extends FetchLibrary> = Parameters<F>[1] &
    RequestInitRetryParams<F>;

  export default function fetchBuilder<F extends FetchLibrary>(
    fetch: F,
    defaults?: RequestInitRetryParams<F>,
  ): (input: Parameters<F>[0], init?: RequestInitWithRetry<F>) => ReturnType<F>;
}
