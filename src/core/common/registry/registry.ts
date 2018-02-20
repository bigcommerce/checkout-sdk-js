import { InvalidArgumentError } from '../error/errors';

export default class Registry<T> {
    private _factories: { [key: string]: Factory<T> };
    private _instances: { [key: string]: T };
    private _options: RegistryOptions;

    constructor(options?: RegistryOptions) {
        this._factories = {};
        this._instances = {};
        this._options = { defaultToken: 'default', ...options };
    }

    get(token: string = this._options.defaultToken, cacheToken: string = token): T {
        try {
            return this._getInstance(token, cacheToken);
        } catch (error) {
            return this._getInstance(this._options.defaultToken, cacheToken);
        }
    }

    register(token: string, factory: Factory<T>): void {
        if (this.hasFactory(token)) {
            throw new InvalidArgumentError(`'${token}' is already registered.`);
        }

        this._factories[token] = factory;
    }

    hasFactory(token: string): boolean {
        return !!this._factories[token];
    }

    hasInstance(token: string): boolean {
        return !!this._instances[token];
    }

    private _getInstance(token: string, cacheToken: string): T {
        if (!this.hasInstance(cacheToken)) {
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
