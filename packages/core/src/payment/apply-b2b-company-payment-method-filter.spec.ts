import { createRequestSender } from '@bigcommerce/request-sender';

import { InternalCheckoutSelectors } from '../checkout';
import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { getResponse } from '../common/http-request/responses.mock';

import applyB2bCompanyPaymentMethodFilter from './apply-b2b-company-payment-method-filter';
import B2BCompanyPaymentMethodRequestSender, {
    B2BCompanyPaymentMethodsResponseBody,
} from './b2b-company-payment-method-request-sender';
import { getPaymentMethod } from './payment-methods.mock';

describe('applyB2bCompanyPaymentMethodFilter', () => {
    const companyId = 42;
    const b2bToken = 'b2b-token-value';
    const b2bBaseUrl = 'https://api-b2b.bigcommerce.com';

    const allowListResponseBody: B2BCompanyPaymentMethodsResponseBody = {
        data: [
            {
                code: getPaymentMethod().id,
                name: getPaymentMethod().id,
                isEnabled: '1',
                paymentId: 1,
            },
        ],
    };

    let store: CheckoutStore;
    let state: InternalCheckoutSelectors;
    let requestSender: B2BCompanyPaymentMethodRequestSender;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        state = store.getState();

        jest.spyOn(state.cart, 'getCart').mockReturnValue({
            ...getCheckout().cart,
            companyId,
        });
        jest.spyOn(state.customer, 'getCustomer').mockReturnValue({
            ...getCheckout().customer,
            isGuest: false,
        });
        jest.spyOn(state.b2bToken, 'getToken').mockReturnValue(b2bToken);
        jest.spyOn(state.config, 'getStoreConfig').mockReturnValue({
            ...state.config.getStoreConfig()!,
            b2bApiSettings: { baseUrl: b2bBaseUrl, clientId: 'cid' },
        });

        requestSender = new B2BCompanyPaymentMethodRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'getB2BCompanyPaymentMethods').mockResolvedValue(
            getResponse(allowListResponseBody),
        );
    });

    it('fetches the allow-list and returns the filtered subset', async () => {
        const methods = [getPaymentMethod()];

        const result = await applyB2bCompanyPaymentMethodFilter(methods, state, requestSender);

        expect(requestSender.getB2BCompanyPaymentMethods).toHaveBeenCalledWith(
            companyId,
            b2bToken,
            b2bBaseUrl,
            undefined,
        );
        expect(result).toEqual([getPaymentMethod()]);
    });

    it('forwards request options to the B2B request sender', async () => {
        const methods = [getPaymentMethod()];
        const options = { timeout: undefined };

        await applyB2bCompanyPaymentMethodFilter(methods, state, requestSender, options);

        expect(requestSender.getB2BCompanyPaymentMethods).toHaveBeenCalledWith(
            companyId,
            b2bToken,
            b2bBaseUrl,
            options,
        );
    });

    it('throws MissingDataError when the customer is missing', async () => {
        jest.spyOn(state.customer, 'getCustomer').mockReturnValue(undefined);

        await expect(
            applyB2bCompanyPaymentMethodFilter([getPaymentMethod()], state, requestSender),
        ).rejects.toBeInstanceOf(MissingDataError);
        expect(requestSender.getB2BCompanyPaymentMethods).not.toHaveBeenCalled();
    });

    it('throws MissingDataError when the customer is a guest', async () => {
        jest.spyOn(state.customer, 'getCustomer').mockReturnValue({
            ...getCheckout().customer,
            isGuest: true,
        });

        await expect(
            applyB2bCompanyPaymentMethodFilter([getPaymentMethod()], state, requestSender),
        ).rejects.toBeInstanceOf(MissingDataError);
        expect(requestSender.getB2BCompanyPaymentMethods).not.toHaveBeenCalled();
    });

    it('throws MissingDataError when the B2B token is missing from state', async () => {
        jest.spyOn(state.b2bToken, 'getToken').mockReturnValue(undefined);

        await expect(
            applyB2bCompanyPaymentMethodFilter([getPaymentMethod()], state, requestSender),
        ).rejects.toBeInstanceOf(MissingDataError);
        expect(requestSender.getB2BCompanyPaymentMethods).not.toHaveBeenCalled();
    });

    it('throws MissingDataError when companyId is missing', async () => {
        jest.spyOn(state.cart, 'getCart').mockReturnValue({
            ...getCheckout().cart,
            companyId: null,
        });

        await expect(
            applyB2bCompanyPaymentMethodFilter([getPaymentMethod()], state, requestSender),
        ).rejects.toBeInstanceOf(MissingDataError);
        expect(requestSender.getB2BCompanyPaymentMethods).not.toHaveBeenCalled();
    });

    it('throws MissingDataError when the B2B base URL is unavailable', async () => {
        jest.spyOn(state.config, 'getStoreConfig').mockReturnValue({
            ...state.config.getStoreConfig()!,
            b2bApiSettings: { baseUrl: '', clientId: '' },
        });

        await expect(
            applyB2bCompanyPaymentMethodFilter([getPaymentMethod()], state, requestSender),
        ).rejects.toBeInstanceOf(MissingDataError);
        expect(requestSender.getB2BCompanyPaymentMethods).not.toHaveBeenCalled();
    });

    it('propagates errors from the B2B request sender', async () => {
        const b2bError = new Error('B2B endpoint unavailable');

        jest.spyOn(requestSender, 'getB2BCompanyPaymentMethods').mockRejectedValue(b2bError);

        await expect(
            applyB2bCompanyPaymentMethodFilter([getPaymentMethod()], state, requestSender),
        ).rejects.toBe(b2bError);
    });
});
