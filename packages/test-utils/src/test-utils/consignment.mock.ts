import { Consignment } from '@bigcommerce/checkout-sdk/payment-integration';

import { omit } from "lodash";
import { Address } from "../../../payment-integration/src/address";
import { getAddress } from "./address.mock";
import getShippingOption from "./shipping-option.mock";

export default function getConsignment(): Consignment {
    return {
        id: '55c96cda6f04c',
        address: omit(getAddress(), 'id') as Address,
        selectedShippingOption: getShippingOption(),
        shippingCost: 0,
        handlingCost: 0,
        lineItemIds: [
            '12e11c8f-7dce-4da3-9413-b649533f8bad',
        ],
        shippingAddress: omit(getAddress(), 'id') as Address,
        availableShippingOptions: [
            getShippingOption(),
        ],
    };
}