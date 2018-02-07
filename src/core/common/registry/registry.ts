import { InvalidArgumentError } from '../error/errors';

export default class Registry<T> {
    private _factories: { [key: string]: Factory<T> };
    private _instances: { [key: string]: T };

    constructor() {
        this._factories = {};
        this._instances = {};
    }

    get(token: string): T {
        if (!this._instances[token]) {
            const factory = this._factories[token];

            if (!factory) {
                throw new InvalidArgumentError();
            }

            this._instances[token] = factory();
        }

        return this._instances[token];
    }

    register(token: string, factory: Factory<T>): void {
        if (this._factories[token]) {
            throw new InvalidArgumentError();
        }

        this._factories[token] = factory;
    }
}

export type Factory<T> = () => T;
