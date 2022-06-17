import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';

import { CheckoutButtonActionType, DeinitializeButtonAction, InitializeButtonAction } from './checkout-button-actions';
import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';

const methodMap: { [key: string]: CheckoutButtonMethodType | undefined } = {
    [CheckoutButtonMethodType.BRAINTREE_PAYPALV2]: CheckoutButtonMethodType.BRAINTREE_PAYPAL, // TODO: this code should be removed after PAYPAL-1518 hits Tier3
    [CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDITV2]: CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT, // TODO: this code should be removed after PAYPAL-1518 hits Tier3
};

const mapCheckoutButtonMethodId = (methodId: CheckoutButtonMethodType) => {
    return methodMap[methodId] || methodId;
};

export default class CheckoutButtonStrategyActionCreator {
    constructor(
        private _registry: Registry<CheckoutButtonStrategy>,
        private _paymentMethodActionCreator: PaymentMethodActionCreator
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): ThunkAction<InitializeButtonAction, InternalCheckoutSelectors> {
        return store => {
            const meta = { methodId: options.methodId, containerId: options.containerId };

            if (store.getState().checkoutButton.isInitialized(options.methodId, options.containerId)) {
                return empty();
            }

            return concat(
                of(createAction(CheckoutButtonActionType.InitializeButtonRequested, undefined, meta)),
                this._paymentMethodActionCreator.loadPaymentMethod(mapCheckoutButtonMethodId(options.methodId), { timeout: options.timeout, useCache: true }),
                defer(() => this._registry.get(options.methodId).initialize(options)
                    .then(() => createAction(CheckoutButtonActionType.InitializeButtonSucceeded, undefined, meta)))
            ).pipe(
                catchError(error => throwErrorAction(CheckoutButtonActionType.InitializeButtonFailed, error, meta))
            );
        };
    }

    deinitialize(options: CheckoutButtonOptions): ThunkAction<DeinitializeButtonAction, InternalCheckoutSelectors> {
        return store => {
            const meta = { methodId: options.methodId };

            if (!store.getState().checkoutButton.isInitialized(options.methodId)) {
                return empty();
            }

            return concat(
                of(createAction(CheckoutButtonActionType.DeinitializeButtonRequested, undefined, meta)),
                defer(() => this._registry.get(options.methodId).deinitialize()
                    .then(() => createAction(CheckoutButtonActionType.DeinitializeButtonSucceeded, undefined, meta)))
            ).pipe(
                catchError(error => throwErrorAction(CheckoutButtonActionType.DeinitializeButtonFailed, error, meta))
            );
        };
    }
}
