import { selector } from '../common/selector';

import { Address } from '../address';
import ConfigState from '../config/config-state';

import ConsignmentState from './consignment-state';

@selector
export default class ShippingAddressSelector {
    constructor(
        private _consignments: ConsignmentState,
        private _config: ConfigState
    ) {}

    getShippingAddress(): Address | undefined {
        const consignments = this._consignments.data;
        const context = this._config.data && this._config.data.context;

        if (!consignments || !consignments[0]) {
            if (!context || !context.geoCountryCode) {
                return;
            }

            return {
                firstName: '',
                lastName: '',
                company: '',
                address1: '',
                address2: '',
                city: '',
                stateOrProvince: '',
                stateOrProvinceCode: '',
                postalCode: '',
                country: '',
                phone: '',
                customFields: [],
                countryCode: context.geoCountryCode,
            };
        }

        return consignments[0].shippingAddress;
    }
}
