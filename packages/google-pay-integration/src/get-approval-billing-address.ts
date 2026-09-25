import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayFullBillingAddress } from './types';

/**
 * Rebuilds the Google Pay billing address to send with the PayPal approve request.
 *
 * Google Pay returns a full billing address on the payment data response, but the PayPal
 * strategies rebuild `paymentMethodData.info` from the stored card information and drop it,
 * so PayPal's merchant reports show "--" in the Name column. The base strategy has already
 * written that same address into checkout state via `updateBillingAddress`, so this is the
 * inverse of `GooglePayGateway#_mapToAddressRequestBody`.
 */
export default function getApprovalBillingAddress(
    paymentIntegrationService: PaymentIntegrationService,
): GooglePayFullBillingAddress | undefined {
    const billingAddress = paymentIntegrationService.getState().getBillingAddress();

    if (!billingAddress) {
        return;
    }

    const {
        firstName,
        lastName,
        address1,
        address2,
        city,
        stateOrProvinceCode,
        countryCode,
        postalCode,
        phone,
    } = billingAddress;

    const name = `${firstName} ${lastName}`.trim();

    // PayPal maps this onto `payment_source.google_pay.card.billing_address` and rejects the
    // whole request with MISSING_REQUIRED_PARAMETER if the object is present without a country
    // code, so omit it entirely rather than send a partial address and break the checkout.
    if (!name || !countryCode) {
        return;
    }

    return {
        name,
        address1,
        address2,
        address3: '',
        locality: city,
        administrativeArea: stateOrProvinceCode,
        countryCode,
        postalCode,
        sortingCode: '',
        ...(phone && { phoneNumber: phone }),
    };
}
