import { InvalidArgumentError } from '../error/errors';

export default class Registry<T, K extends string = string> {
    private _factories: { [key: string]: Factory<T> };
    private _instances: { [key: string]: T };
    private _options: RegistryOptions;

    constructor(options?: RegistryOptions) {
        this._factories = {};
        this._instances = {};
        this._options = { defaultToken: 'default', ...options };
    }

    get(token?: K, cacheToken?: string): T {
        try {
            return this._getInstance(
                token || this._options.defaultToken,
                cacheToken || token || this._options.defaultToken
            );
        } catch (error) {
            return this._getInstance(
                this._options.defaultToken,
                cacheToken || this._options.defaultToken
            );
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
            const factory = this._factories[token];

            if (!factory) {
                throw new InvalidArgumentError(`'${token}' is not registered.`);
            }

            this._instances[cacheToken] = factory();
        }

        return this._instances[cacheToken];
    }
}

export type Factory<T> = () => T;

export interface RegistryOptions {
    defaultToken: string;
}
