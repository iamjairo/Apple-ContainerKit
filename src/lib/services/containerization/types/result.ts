/**
 * Result type - represents success or failure
 * Replaces exception-based error handling
 */
export type Result<T, E = string> =
    | { tag: 'success'; value: T; warning?: string }
    | { tag: 'failure'; error: E; stderr: string };

// Type guards
export const isSuccess = <T, E>(result: Result<T, E>): result is { tag: 'success'; value: T; warning?: string } =>
    result.tag === 'success';

export const isFailure = <T, E>(result: Result<T, E>): result is { tag: 'failure'; error: E; stderr: string } =>
    result.tag === 'failure';

// Transformers
export const map = <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
): Result<U, E> =>
    isSuccess(result)
        ? { tag: 'success', value: fn(result.value), warning: result.warning }
        : result;

export const flatMap = <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
): Result<U, E> =>
    isSuccess(result) ? fn(result.value) : result;

export const mapError = <T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
): Result<T, F> =>
    isFailure(result)
        ? { tag: 'failure', error: fn(result.error), stderr: result.stderr }
        : result;

// Extract value
export const fold = <T, E, U>(
    result: Result<T, E>,
    onSuccess: (value: T) => U,
    onFailure: (error: E) => U
): U =>
    isSuccess(result) ? onSuccess(result.value) : onFailure(result.error);

export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T =>
    isSuccess(result) ? result.value : defaultValue;

// Composition
export const pipe = <T>(value: T, ...fns: Array<(x: any) => any>): any =>
    fns.reduce((acc, fn) => fn(acc), value);

export const compose = <A, B, C>(
    f: (a: A) => B,
    g: (b: B) => C
): (a: A) => C =>
    (a) => g(f(a));

// Batch operations
export const validateBatch = <T, E>(
    results: Result<T, E>[]
): Result<T[], E> => {
    const failures = results.filter(isFailure);

    if (failures.length > 0) {
        const firstFailure = failures[0];
        return {
            tag: 'failure',
            error: firstFailure.error,
            stderr: failures.map((f) => f.stderr).join('\n')
        };
    }

    return {
        tag: 'success',
        value: results.filter(isSuccess).map((r) => r.value)
    };
};

// Retry logic (higher-order function)
export const withRetry = <T, E>(
    fn: () => Promise<Result<T, E>>,
    maxAttempts: number = 3
): (() => Promise<Result<T, E>>) =>
    async () => {
        for (let i = 0; i < maxAttempts; i++) {
            const result = await fn();
            if (isSuccess(result)) return result;
            if (i === maxAttempts - 1) return result;
        }
        return {
            tag: 'failure',
            error: 'Max retries exceeded' as any,
            stderr: ''
        };
    };