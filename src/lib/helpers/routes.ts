import type { Pathname } from '$app/types';

type Delimiters = '_' | '-' | '/';

type StripTrailingSlash<T extends string> = T extends `${infer Rest}/` ? Rest : T;

type CamelCasePathname<T extends string> = T extends `/${infer Rest}`
    ? Rest extends ''
        ? 'Home'
        : StripTrailingSlash<Rest> extends infer S
          ? S extends string
              ? CamelCasePathname<S> extends `${infer C}${infer RestC}`
                  ? `${Uppercase<C>}${RestC}`
                  : CamelCasePathname<S>
              : never
          : never
    : T extends `${infer P1}${Delimiters}${infer P2}${infer P3}`
      ? `${P1}${Uppercase<P2>}${CamelCasePathname<P3>}`
      : T;

export type RoutePathname = {
    [K in Pathname as CamelCasePathname<K>]: K;
};

// @ts-ignore
export const routes: RoutePathname = {
    Home: '/',
    Builder: '/builder',
    Containers: '/containers',
    Dns: '/dns',
    Images: '/images',
    Network: '/network',
    Registry: '/registry',
    Settings: '/settings',
    Volumes: '/volumes',
    ContainerizationStatus: '/containerization-status',
    Setup: '/setup',
    Unsupported: '/unsupported'
} as const;
