import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { EventEmitter } from 'events';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { StoreConfig } from '../config';
import { getConfig } from '../config/configs.mock';

import { ExtensionNotLoadedError } from './errors';
import { Extension, ExtensionRegion } from './extension';
import { ExtensionActionCreator } from './extension-action-creator';
import { ExtensionActionType } from './extension-actions';
import { ExtensionInternalCommandType } from './extension-internal-commands';
import { ExtensionRequestSender } from './extension-request-sender';
import { getExtensionCommand, getExtensions } from './extension.mock';

describe('ExtensionActionCreator', () => {
    let errorResponse: Response<ErrorResponseBody>;
    let extensionActionCreator: ExtensionActionCreator;
    let extensionRequestSender: ExtensionRequestSender;
    let extensionsResponse: Response<Extension[]>;
    let store: CheckoutStore;
    let storeConfig: StoreConfig;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        extensionsResponse = getResponse(getExtensions());
        store = createCheckoutStore(getCheckoutStoreState());
        storeConfig = getConfig().storeConfig;

        storeConfig.checkoutSettings.features = {
            'PROJECT-5029.checkout_extension': true,
        };

        extensionRequestSender = new ExtensionRequestSender(createRequestSender());
        extensionActionCreator = new ExtensionActionCreator(extensionRequestSender);

        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(storeConfig);
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
            jest.spyOn(store.getState().extensions, 'getExtensionByRegion').mockReturnValue(
                undefined,
            );

            const errorHandler = jest.fn((action) => of(action));

            await from(
                extensionActionCreator.renderExtension(
                    'foo',
                    ExtensionRegion.ShippingShippingAddressFormAfter,
                )(store),
            )
                .pipe(catchError(errorHandler))
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
        });

        it('emits actions if able to render an extension', async () => {
            const event = getExtensionCommand();
            const eventEmitter = new EventEmitter();
            const mockElement = document.createElement('div');

            jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
            jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
                return eventEmitter.addListener(type, listener);
            });

            setTimeout(() => {
                eventEmitter.emit('message', {
                    ...event,
                    data: {
                        type: ExtensionInternalCommandType.ResizeIframe,
                    },
                });
            });

            const actions = await from(
                extensionActionCreator.renderExtension(
                    'foo',
                    ExtensionRegion.ShippingShippingAddressFormBefore,
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
                    payload: expect.any(ExtensionNotLoadedError),
                    error: true,
                },
            ]);
        });

        it('does nothing if the experiment is off', async () => {
            storeConfig.checkoutSettings.features = {};
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
                storeConfig,
            );

            const actions = await from(
                extensionActionCreator.renderExtension(
                    'foo',
                    ExtensionRegion.ShippingShippingAddressFormBefore,
                )(store),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([]);
        });
    });
});
