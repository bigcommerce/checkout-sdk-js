import { selector } from '../common/selector';

import InternalQuote from './internal-quote';
import QuoteState from './quote-state';

@selector
export default class QuoteSelector {
    constructor(
        private _quote: QuoteState
    ) {}

    getQuote(): InternalQuote | undefined {
        return this._quote.data;
    }

    getQuoteMeta(): any {
        return this._quote.meta;
    }

    getLoadError(): Error | undefined {
        return this._quote.errors.loadError;
    }

    isLoading(): boolean {
        return !! this._quote.statuses.isLoading;
    }
}
