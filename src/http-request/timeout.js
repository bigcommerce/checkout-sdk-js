export default class Timeout {
    /**
     * @param {number} [delay]
     * @constructor
     */
    constructor(delay) {
        this._delay = delay;
        this._timeoutToken = null;

        this._promise = new Promise((resolve) => {
            this._resolve = resolve;
        });
    }

    /**
     * @param {Function} callback
     * @return {void}
     */
    onComplete(callback) {
        this._promise.then(callback);
    }

    /**
     * @return {void}
     */
    complete() {
        this._resolve();

        if (this._timeoutToken) {
            clearTimeout(this._timeoutToken);
        }
    }

    /**
     * @return {void}
     */
    start() {
        if (this._delay) {
            this._timeoutToken = setTimeout(() => this.complete(), this._delay);
        }
    }
}
