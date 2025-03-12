import { Checkout } from '@bigcommerce/checkout-sdk/payment-integration-api';

import HeadlessCustomerResponse from './headless-customer';

export default function mapToCustomer(
    headlessCustomerResponse: HeadlessCustomerResponse,
): Checkout | undefined {
    const { customer } = headlessCustomerResponse;

    if (!customer) {
        return;
    }

    // TODO:: here will be mapped all customer data related fields
    // eslint-disable-next-line
    // @ts-ignore
    return {
        id: customer.entityId,
    };
}
