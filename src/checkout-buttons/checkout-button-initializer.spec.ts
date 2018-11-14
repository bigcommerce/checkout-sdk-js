import { createAction } from '@bigcommerce/data-store';
import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutStore } from '../checkout';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';

import { CheckoutButtonActionType } from './checkout-button-actions';
import CheckoutButtonErrorSelector from './checkout-button-error-selector';
import CheckoutButtonInitializer from './checkout-button-initializer';
import CheckoutButtonStatusSelector from './checkout-button-status-selector';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import createCheckoutButtonRegistry from './create-checkout-button-registry';
import { CheckoutButtonMethodType } from './strategies';

describe('CheckoutButtonInitializer', () => {
    let initializer: CheckoutButtonInitializer;
    let buttonActionCreator: CheckoutButtonStrategyActionCreator;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore();
        buttonActionCreator = new CheckoutButtonStrategyActionCreator(
            createCheckoutButtonRegistry(store, createRequestSender(), createFormPoster()),
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()))
        );

        jest.spyOn(store, 'dispatch');
        jest.spyOn(store, 'subscribe');

        jest.spyOn(buttonActionCreator, 'initialize')
            .mockReturnValue(Observable.of(createAction(CheckoutButtonActionType.InitializeButtonRequested)));

        jest.spyOn(buttonActionCreator, 'deinitialize')
            .mockReturnValue(Observable.of(createAction(CheckoutButtonActionType.DeinitializeButtonRequested)));

        initializer = new CheckoutButtonInitializer(store, buttonActionCreator);
    });

    it('dispatches action to initialize button strategy', async () => {
        const options = {
            methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
            containerId: 'checkout-button',
        };

        await initializer.initializeButton(options);

        expect(buttonActionCreator.initialize).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(
            Observable.of(createAction(CheckoutButtonActionType.InitializeButtonRequested)),
            { queueId: `${CheckoutButtonMethodType.BRAINTREE_PAYPAL}ButtonStrategy` }
        );
    });

    it('dispatches action to deinitialize button strategy', async () => {
        const options = {
            methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
            containerId: 'checkout-button',
        };

        await initializer.deinitializeButton(options);

        expect(buttonActionCreator.deinitialize).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(
            Observable.of(createAction(CheckoutButtonActionType.DeinitializeButtonRequested)),
            { queueId: `${CheckoutButtonMethodType.BRAINTREE_PAYPAL}ButtonStrategy` }
        );
    });

    it('registers subscribers with data store', () => {
        const subscriber = jest.fn();

        initializer.subscribe(subscriber);
        store.notifyState();

        expect(subscriber).toHaveBeenCalledWith(initializer.getState());
    });

    it('returns selector object for querying current state', async () => {
        expect(initializer.getState()).toEqual({
            errors: expect.any(CheckoutButtonErrorSelector),
            statuses: expect.any(CheckoutButtonStatusSelector),
        });
    });
});
