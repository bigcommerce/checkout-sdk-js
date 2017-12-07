export default class Logger {
    /**
     * @constructor
     * @param {console} console
     */
    constructor(console) {
        this._console = console;
    }

    /**
     * @param {...any} messages
     * @return {void}
     */
    log(...messages) {
        this._logToConsole('log', ...messages);
    }

    /**
     * @param {...any} messages
     * @return {void}
     */
    info(...messages) {
        this._logToConsole('info', ...messages);
    }

    /**
     * @param {...any} messages
     * @return {void}
     */
    warn(...messages) {
        this._logToConsole('warn', ...messages);
    }

    /**
     * @param {...any} messages
     * @return {void}
     */
    error(...messages) {
        this._logToConsole('error', ...messages);
    }

    /**
     * @param {...any} messages
     * @return {void}
     */
    debug(...messages) {
        this._logToConsole('debug', ...messages);
    }

    /**
     * @param {string} type
     * @param {...any} messages
     * @return {void}
     */
    _logToConsole(type, ...messages) {
        if (!this._console || !this._console[type]) {
            return;
        }

        this._console[type](...messages);
    }
}
