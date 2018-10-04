import { selector } from '../common/selector';

import { Address } from '../address';

import ConsignmentSelector from './consignment-selector';

@selector
export default class ShippingAddressSelector {
    constructor(
        private _consignments: ConsignmentSelector
    ) {}

    getShippingAddress(): Address | undefined {
        const consignments = this._consignments.getConsignments();

        if (!consignments || !consignments[0]) {
            return;
        }

        return consignments[0].shippingAddress;
    }
}
