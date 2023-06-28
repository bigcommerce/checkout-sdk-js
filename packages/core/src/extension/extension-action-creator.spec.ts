import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { ExtensionNotFoundError, InvalidExtensionConfigError } from './errors';
import { Extension, ExtensionRegion } from './extension';
import { ExtensionActionCreator } from './extension-action-creator';
import { ExtensionActionType } from './extension-actions';
import { ExtensionRequestSender } from './extension-request-sender';
import { getExtensions, getExtensionState } from './extension.mock';

describe('ExtensionActionCreator', () => {
    let errorResponse: Response<ErrorResponseBody>;
    let extensionActionCreator: ExtensionActionCreator;
    let extensionRequestSender: ExtensionRequestSender;
    let extensionsResponse: Response<Extension[]>;
    let store: CheckoutStore;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        extensionsResponse = getResponse(getExtensions());
        store = createCheckoutStore(getCheckoutStoreState());

        extensionRequestSender = new ExtensionRequestSender(createRequestSender());
        extensionActionCreator = new ExtensionActionCreator(extensionRequestSender);

        jest.spyOn(extensionRequestSender, 'loadExtensions').mockReturnValue(
            Promise.resolve(extensionsResponse),
        );

        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(getCheckout().cart);
    });

    describe('#loadExtensions()', () => {
        it('sends a request to get a list of extensions', async () => {
            await from(extensionActionCreator.loadExtensions()(store)).toPromise();

            expect(extensionRequestSender.loadExtensions).toHaveBeenCalled();
        });

        it('emits actions if able to load extensions', async () => {
            const actions = await from(extensionActionCreator.loadExtensions()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ExtensionActionType.LoadExtensionsRequested },
                {
                    type: ExtensionActionType.LoadExtensionsSucceeded,
                    payload: extensionsResponse.body,
                },
            ]);
        });

        it('emits error actions if unable to load extensions', async () => {
            jest.spyOn(extensionRequestSender, 'loadExtensions').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(extensionActionCreator.loadExtensions()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ExtensionActionType.LoadExtensionsRequested },
                {
                    type: ExtensionActionType.LoadExtensionsFailed,
                    payload: errorResponse,
                    error: true,
                },
            ]);
        });
    });

    describe('#renderExtension()', () => {
        it('throws error if unable to find an extension', async () => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                extensions: {
                    ...getExtensionState(),
                    data: getExtensions().slice(0, 1),
                },
            });

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(
                extensionActionCreator.renderExtension(
                    'foo',
                    ExtensionRegion.ShippingShippingAddressFormAfter,
                )(store),
            )
                .pipe(catchError(errorHandler))
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toBeInstanceOf(ExtensionNotFoundError);
        });

        it('emits actions if able to render an extension', async () => {
            const mockElement = document.createElement('div');

            jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

            const actions = await from(
                extensionActionCreator.renderExtension(
                    'foo',
                    ExtensionRegion.ShippingShippingAddressFormAfter,
                )(store),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ExtensionActionType.RenderExtensionRequested },
                { type: ExtensionActionType.RenderExtensionSucceeded },
            ]);
        });

        it('emits error actions if unable to render an extension', async () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(
                extensionActionCreator.renderExtension(
                    'foo',
                    ExtensionRegion.ShippingShippingAddressFormAfter,
                )(store),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ExtensionActionType.RenderExtensionRequested },
                {
                    type: ExtensionActionType.RenderExtensionFailed,
                    payload: expect.any(InvalidExtensionConfigError),
                    error: true,
                },
            ]);
        });
    });
});
