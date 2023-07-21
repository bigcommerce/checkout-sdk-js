import { AddressRequestBody } from '../address';

import { ShippingRequestOptions } from './shipping-request-options';

export default interface ShippingStrategy {
    updateAddress(
        address: Partial<AddressRequestBody>,
        options?: ShippingRequestOptions,
    ): Promise<void>;

    selectOption(optionId: string, options?: ShippingRequestOptions): Promise<void>;

    initialize(options?: ShippingRequestOptions): Promise<void>;

    deinitialize(options?: ShippingRequestOptions): Promise<void>;
}
