import { createAction } from '@bigcommerce/data-store';
import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { of } from 'rxjs';

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
            .mockReturnValue(of(createAction(CheckoutButtonActionType.InitializeButtonRequested)));

        jest.spyOn(buttonActionCreator, 'deinitialize')
            .mockReturnValue(of(createAction(CheckoutButtonActionType.DeinitializeButtonRequested)));

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
            buttonActionCreator.initialize(options),
            { queueId: `checkoutButtonStrategy:${CheckoutButtonMethodType.BRAINTREE_PAYPAL}:${options.containerId}` }
        );
    });

    it('dispatches multiple actions to initialize button strategy if multiple containers can be found', async () => {
        const container = document.createElement('div');
        container.className = 'checkout-button';

        const containers: HTMLElement[] = [];
        containers.push(container);
        containers.push(container.cloneNode() as HTMLElement);
        containers.push(container.cloneNode() as HTMLElement);
        containers.forEach(container => document.body.appendChild(container));

        const options = {
            methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
            containerId: '.checkout-button',
        };

        await initializer.initializeButton(options);

        expect(buttonActionCreator.initialize).toHaveBeenCalledTimes(3);
        expect(buttonActionCreator.initialize).toHaveBeenCalledWith({
            ...options,
            containerId: expect.stringMatching(new RegExp(`${options.methodId}-container.+`)),
        });

        expect(store.dispatch).toHaveBeenCalledTimes(3);
        expect(store.dispatch).toHaveBeenCalledWith(
            buttonActionCreator.initialize(options),
            { queueId: expect.stringMatching(new RegExp(`checkoutButtonStrategy:${options.methodId}:${options.methodId}-container.+`)) }
        );

        containers.forEach(container => container.remove());
    });

    it('dispatches action to deinitialize button strategy', async () => {
        const options = {
            methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
            containerId: 'checkout-button',
        };

        await initializer.deinitializeButton(options);

        expect(buttonActionCreator.deinitialize).toHaveBeenCalledWith(options);
        expect(store.dispatch).toHaveBeenCalledWith(
            buttonActionCreator.deinitialize(options),
            { queueId: `checkoutButtonStrategy:${CheckoutButtonMethodType.BRAINTREE_PAYPAL}` }
        );
    });

    it('registers subscribers with data store', () => {
        const subscriber = jest.fn();

        initializer.subscribe(subscriber);
        store.notifyState();

        expect(subscriber).toHaveBeenCalledWith(initializer.getState());
    });

    it('returns selector object for querying current state', () => {
        expect(initializer.getState()).toEqual({
            errors: expect.any(CheckoutButtonErrorSelector),
            statuses: expect.any(CheckoutButtonStatusSelector),
        });
    });

    it('has methods that can be destructed', () => {
        const { initializeButton } = initializer;

        expect(() => initializeButton({
            methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
            containerId: 'checkout-button',
        }))
            .not.toThrow(TypeError);
    });
});
