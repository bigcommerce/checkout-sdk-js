import { isRequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { RedirectError } from '../bigcommerce-payments-types';

export default function isRedirectError(error: unknown): error is RedirectError {
    return isRequestError(error) && error.body?.additional_action_required?.data.redirect_url;
}
