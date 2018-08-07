import { selector } from '../common/selector';

import { Address } from '../address';

import ConsignmentState from './consignment-state';

@selector
export default class ShippingAddressSelector {
    constructor(
        private _consignments: ConsignmentState
    ) {}

    getShippingAddress(): Address | undefined {
        const consignments = this._consignments.data;

        if (!consignments || !consignments[0]) {
            return;
        }

        return consignments[0].shippingAddress;
    }
}
