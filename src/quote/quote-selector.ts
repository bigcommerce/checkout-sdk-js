import InternalQuote from './internal-quote';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class QuoteSelector {
    /**
     * @constructor
     * @param {QuoteState} quote
     */
    constructor(
        private _quote: any = {}
    ) {}

    getQuote(): InternalQuote | undefined {
        return this._quote.data;
    }

    getLoadError(): Error | undefined {
        return this._quote.errors && this._quote.errors.loadError;
    }

    isLoading(): boolean {
        return !!(this._quote.statuses && this._quote.statuses.isLoading);
    }
}
