import { InvalidArgumentError } from '../error/errors';

import Factory from './factory';

export default class Registry<T, K extends string = string> {
    private _factories: { [key: string]: Factory<T> };
    private _instances: { [key: string]: T };
    private _defaultToken: string;
    private _useFallback: string | boolean;
    private _tokenResolver: (token: string, registeredTokens: string[]) => string | undefined;

    constructor(options?: RegistryOptions) {
        this._factories = {};
        this._instances = {};
        this._defaultToken = options?.defaultToken ?? 'default';
        this._useFallback = options?.useFallback ?? true;
        this._tokenResolver = options?.tokenResolver ?? ((token) => token);
    }

    get(token?: K, cacheToken?: string): T {
        try {
            return this._getInstance(
                token || this._defaultToken,
                cacheToken || token || this._defaultToken,
            );
        } catch (error) {
            if (!this._useFallback) {
                throw error;
            }

            return this._getInstance(this._defaultToken, cacheToken || this._defaultToken);
        }
    }

    register(token: K, factory: Factory<T>): void {
        if (this._hasFactory(token)) {
            throw new InvalidArgumentError(`'${token}' is already registered.`);
        }

        this._factories[token] = factory;
    }

    protected _hasFactory(token: string): boolean {
        return !!this._factories[token];
    }

    private _hasInstance(token: string): boolean {
        return !!this._instances[token];
    }

    private _getInstance(token: string, cacheToken: string): T {
        if (!this._hasInstance(cacheToken)) {
            const resolvedToken = this._tokenResolver(token, Object.keys(this._factories));
            const factory = resolvedToken && this._factories[resolvedToken];

            if (!factory) {
                throw new InvalidArgumentError(`'${token}' is not registered.`);
            }

            this._instances[cacheToken] = factory();
        }

        return this._instances[cacheToken];
    }
}

export interface RegistryOptions {
    defaultToken?: string;
    useFallback?: boolean;
    tokenResolver?(token: string, registeredTokens: string[]): string | undefined;
}
