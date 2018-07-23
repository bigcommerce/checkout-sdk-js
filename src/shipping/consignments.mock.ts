import { omit } from 'lodash';

import { Address } from '../address';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';
import { getShippingOption } from '../shipping/shipping-options.mock';

import Consignment, { ConsignmentRequestBody } from './consignment';
import ConsignmentState from './consignment-state';

export function getConsignment(): Consignment {
    return {
        id: '55c96cda6f04c',
        selectedShippingOption: getShippingOption(),
        shippingCost: 0,
        handlingCost: 0,
        lineItemIds: [
            '12e11c8f-7dce-4da3-9413-b649533f8bad',
        ],
        shippingAddress: omit(getShippingAddress(), 'id') as Address,
        availableShippingOptions: [
            getShippingOption(),
        ],
    };
}

export function getConsignmentsState(): ConsignmentState {
    return {
        data: [
            getConsignment(),
            getConsignment(),
        ],
        errors: {
            updateError: {},
            updateShippingOptionError: {},
        },
        statuses: {
            isUpdating: {},
            isUpdatingShippingOption: {},
        },
    };
}

export function getConsignmentRequestBody(): ConsignmentRequestBody {
    return {
        id: '55c96cda6f04c',
        lineItems: [{
            itemId: '12e11c8f-7dce-4da3-9413-b649533f8bad',
            quantity: 1,
        }],
        shippingAddress: getShippingAddress(),
    };
}
