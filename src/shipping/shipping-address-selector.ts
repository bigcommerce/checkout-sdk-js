import { selector } from '../common/selector';

import { InternalAddress } from '../address';
import { QuoteState } from '../quote';

import ConfigState from '../config/config-state';

@selector
export default class ShippingAddressSelector {
    constructor(
        private _quote: QuoteState,
        private _config: ConfigState
    ) {}

    getShippingAddress(): InternalAddress | undefined {
        const quote = this._quote.data;
        const context = this._config.data && this._config.data.context;

        if (quote
            && !quote.shippingAddress
            && context
            && context.geoCountryCode
        ) {
            return {
                firstName: '',
                lastName: '',
                company: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                province: '',
                provinceCode: '',
                postCode: '',
                country: '',
                phone: '',
                customFields: [],
                countryCode: context.geoCountryCode,
            };
        }

        return quote && quote.shippingAddress;
    }
}
