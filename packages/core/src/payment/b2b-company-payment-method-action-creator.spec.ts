import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getCart } from '../cart/carts.mock';
import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig } from '../config/configs.mock';

import B2BCompanyPaymentMethodActionCreator from './b2b-company-payment-method-action-creator';
import { B2BCompanyPaymentMethodActionType } from './b2b-company-payment-method-actions';
import B2BCompanyPaymentMethodRequestSender, {
    B2BCompanyPaymentMethodsResponseBody,
} from './b2b-company-payment-method-request-sender';

describe('B2BCompanyPaymentMethodActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: B2BCompanyPaymentMethodRequestSender;
    let actionCreator: B2BCompanyPaymentMethodActionCreator;

    const companyId = 42;
    const b2bToken = 'b2b-auth-token';
    const b2bBaseUrl = 'https://api-b2b.bigcommerce.com';
    const responseBody: B2BCompanyPaymentMethodsResponseBody = {
        data: [
            { code: 'cheque', name: 'Cheque', isEnabled: '1', paymentId: 1 },
            { code: 'stripev3', name: 'Stripe', isEnabled: '0', paymentId: 2 },
        ],
    };

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = new B2BCompanyPaymentMethodRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'getB2BCompanyPaymentMethods').mockResolvedValue(
            getResponse(responseBody),
        );

        jest.spyOn(store.getState().b2bToken, 'getToken').mockReturnValue(b2bToken);
        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            b2bApiSettings: { baseUrl: b2bBaseUrl, clientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx' },
        });
        jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({
            ...getCart(),
            companyId,
        });

        actionCreator = new B2BCompanyPaymentMethodActionCreator(requestSender);
    });

    describe('#loadB2BCompanyPaymentMethods()', () => {
        it('emits load actions and maps the response on success', async () => {
            const actions = await from(actionCreator.loadB2BCompanyPaymentMethods()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested,
                },
                {
                    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsSucceeded,
                    payload: [
                        { code: 'cheque', name: 'Cheque', isEnabled: true, paymentId: 1 },
                        { code: 'stripev3', name: 'Stripe', isEnabled: false, paymentId: 2 },
                    ],
                },
            ]);
        });

        it('calls getB2BCompanyPaymentMethods with companyId, b2bToken, b2bBaseUrl and options', async () => {
            const options = { timeout: undefined };

            await from(actionCreator.loadB2BCompanyPaymentMethods(options)(store)).toPromise();

            expect(requestSender.getB2BCompanyPaymentMethods).toHaveBeenCalledWith(
                companyId,
                b2bToken,
                b2bBaseUrl,
                options,
            );
        });

        it('emits error actions if getB2BCompanyPaymentMethods fails', async () => {
            jest.spyOn(requestSender, 'getB2BCompanyPaymentMethods').mockRejectedValue(
                getErrorResponse(),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.loadB2BCompanyPaymentMethods()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested,
                },
                expect.objectContaining({
                    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsFailed,
                    error: true,
                }),
            ]);
        });

        it('emits error actions if required data is missing', async () => {
            jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({
                ...getCart(),
                companyId: undefined,
            });

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.loadB2BCompanyPaymentMethods()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(requestSender.getB2BCompanyPaymentMethods).not.toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested,
                },
                expect.objectContaining({
                    type: B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsFailed,
                    error: true,
                }),
            ]);
        });
    });
});
