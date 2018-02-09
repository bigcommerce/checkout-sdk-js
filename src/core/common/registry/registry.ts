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

    get(token: string = this._options.defaultToken): T {
        try {
            return this._getInstance(token);
        } catch (error) {
            return this._getInstance(this._options.defaultToken);
        }
    }

    register(token: string, factory: Factory<T>): void {
        if (this._factories[token]) {
            throw new InvalidArgumentError();
        }

        this._factories[token] = factory;
    }

    private _getInstance(token: string): T {
        if (!this._instances[token]) {
            const factory = this._factories[token];

            if (!factory) {
                throw new InvalidArgumentError();
            }

            this._instances[token] = factory();
        }

        return this._instances[token];
    }
}

export type Factory<T> = () => T;

export interface RegistryOptions {
    defaultToken: string;
}
