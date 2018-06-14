import { selector } from '../common/selector';

import { mapToInternalAddress, InternalAddress } from '../address';
import ConfigState from '../config/config-state';

import ConsignmentState from './consignment-state';

@selector
export default class ShippingAddressSelector {
    constructor(
        private _consignments: ConsignmentState,
        private _config: ConfigState
    ) {}

    getShippingAddress(): InternalAddress | undefined {
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

        return mapToInternalAddress(consignments[0].shippingAddress);
    }
}
