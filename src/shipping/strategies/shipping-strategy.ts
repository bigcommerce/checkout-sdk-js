import { AddressRequestBody } from '../../address';
import { InternalCheckoutSelectors } from '../../checkout';

import { ShippingRequestOptions } from '../shipping-request-options';

export default interface ShippingStrategy {
    updateAddress(address: AddressRequestBody, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors>;

    selectOption(optionId: string, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors>;

    initialize(options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors>;

    deinitialize(options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors>;
}
