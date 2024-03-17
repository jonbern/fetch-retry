declare module 'fetch-retry' {
  export type Fetch = (input: any, init?: any) => Promise<any>;

  export type RequestDelayFunction<F extends Fetch> = (
    attempt: number,
    error: Error | null,
    response: Awaited<ReturnType<F>> | null,
  ) => number;

  export type RequestRetryOnFunction<F extends Fetch> = (
    attempt: number,
    error: Error | null,
    response: Awaited<ReturnType<F>> | null,
  ) => boolean | Promise<boolean>;

  export type RequestInitRetryParams<F extends Fetch> = {
    retries?: number;
    retryDelay?: number | RequestDelayFunction<F>;
    retryOn?: number[] | RequestRetryOnFunction<F>;
  };

  export type RequestInitWithRetry<F extends Fetch> = Parameters<F>[1] &
    RequestInitRetryParams<F>;

  export default function fetchBuilder<F extends Fetch>(
    fetch: F,
    defaults?: RequestInitRetryParams<F>,
  ): (input: Parameters<F>[0], init?: RequestInitWithRetry<F>) => ReturnType<F>;
}
