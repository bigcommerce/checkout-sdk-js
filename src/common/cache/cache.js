import * as memoize from 'memoizee';

export default class Cache {
    /**
     * @constructor
     * @param {Function} [getter]
     */
    constructor(getter = () => {}) {
        this._getter = getter;
        this._memoizedGetter = memoize(
            (...args) => this._getter(...args),
            { length: false }
        );
    }

    /**
     * @param {Function} getter
     * @return {self}
     */
    retain(getter) {
        this._getter = getter;

        return this;
    }

    /**
     * @param {...any} args
     * @return {any}
     */
    retrieve(...args) {
        return this._memoizedGetter(...args);
    }
}
