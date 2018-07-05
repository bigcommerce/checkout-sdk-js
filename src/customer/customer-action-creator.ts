import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { concat } from 'rxjs/observable/concat';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutActionCreator, InternalCheckoutSelectors, LoadCheckoutAction } from '../checkout';
import { RequestOptions } from '../common/http-request';

import { CustomerActionType, SignInCustomerAction, SignOutCustomerAction } from './customer-actions';
import CustomerCredentials from './customer-credentials';
import CustomerRequestSender from './customer-request-sender';

export default class CustomerActionCreator {
    constructor(
        private _customerRequestSender: CustomerRequestSender,
        private _checkoutActionCreator: CheckoutActionCreator
    ) {}

    signInCustomer(
        credentials: CustomerCredentials,
        options?: RequestOptions
    ): ThunkAction<SignInCustomerAction | LoadCheckoutAction, InternalCheckoutSelectors> {
        return store => {
            const signInAction = new Observable((observer: Observer<SignInCustomerAction>) => {
                observer.next(createAction(CustomerActionType.SignInCustomerRequested));

                this._customerRequestSender.signInCustomer(credentials, options)
                    .then(({ body }) => {
                        observer.next(createAction(CustomerActionType.SignInCustomerSucceeded, body.data));
                        observer.complete();
                    })
                    .catch(response => {
                        observer.error(createErrorAction(CustomerActionType.SignInCustomerFailed, response));
                    });
            });

            const loadCheckoutAction = this._checkoutActionCreator.loadCurrentCheckout(options)(store);

            return concat(signInAction, loadCheckoutAction);
        };
    }

    signOutCustomer(
        options?: RequestOptions
    ): ThunkAction<SignOutCustomerAction | LoadCheckoutAction, InternalCheckoutSelectors> {
        return store => {
            const signOutAction = new Observable((observer: Observer<SignOutCustomerAction>) => {
                observer.next(createAction(CustomerActionType.SignOutCustomerRequested));

                this._customerRequestSender.signOutCustomer(options)
                    .then(({ body }) => {
                        observer.next(createAction(CustomerActionType.SignOutCustomerSucceeded, body.data));
                        observer.complete();
                    })
                    .catch(response => {
                        observer.error(createErrorAction(CustomerActionType.SignOutCustomerFailed, response));
                    });
            });

            const loadCheckoutAction = this._checkoutActionCreator.loadCurrentCheckout(options)(store);

            return concat(signOutAction, loadCheckoutAction);
        };
    }
}
