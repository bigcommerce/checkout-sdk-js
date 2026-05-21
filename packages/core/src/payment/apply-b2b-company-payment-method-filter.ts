// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import B2BCompanyPaymentMethodRequestSender from './b2b-company-payment-method-request-sender';
import filterPaymentMethodsByB2BCompanyAllowList from './b2b-company-payment-method-filter-transformer';
import PaymentMethod from './payment-method';

export default async function applyB2bCompanyPaymentMethodFilter(
    methods: PaymentMethod[],
    state: InternalCheckoutSelectors,
    b2bCompanyPaymentMethodRequestSender: B2BCompanyPaymentMethodRequestSender,
    options?: RequestOptions,
): Promise<PaymentMethod[]> {
    const customer = state.customer.getCustomer();
    const b2bToken = state.b2bToken.getToken();
    const b2bBaseUrl = resolveB2bBaseUrl(
        state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
    );
    const companyId = state.cart.getCart()?.companyId;

    if (!customer || customer.isGuest || !b2bToken || !b2bBaseUrl || !companyId) {
        throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
    }

    const { body } = await b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
        companyId,
        b2bToken,
        b2bBaseUrl,
        options,
    );

    return filterPaymentMethodsByB2BCompanyAllowList(methods, body);
}
