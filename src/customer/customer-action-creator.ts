import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, from, of, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CheckoutActionCreator, InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';
import { isSpamProtectionExecuteSucceededAction, SpamProtectionActionCreator } from '../spam-protection';

import CustomerAccountRequestBody, { CustomerAddressRequestBody } from './customer-account';
import { CreateCustomerAction, CreateCustomerAddressAction, CustomerActionType, SignInCustomerAction, SignOutCustomerAction } from './customer-actions';
import CustomerCredentials from './customer-credentials';
import CustomerRequestSender from './customer-request-sender';

export default class CustomerActionCreator {
    constructor(
        private _customerRequestSender: CustomerRequestSender,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _spamProtectionActionCreator: SpamProtectionActionCreator
    ) {}

    createCustomer(
        customerAccount: CustomerAccountRequestBody,
        options?: RequestOptions
    ): ThunkAction<CreateCustomerAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const config = state.config.getStoreConfigOrThrow();
            const { isStorefrontSpamProtectionEnabled } = config.checkoutSettings;

            const createCustomer = (token?: string) =>
                from(this._customerRequestSender.createAccount({ ...customerAccount, token }, options))
                    .pipe(switchMap(() => concat(
                        this._checkoutActionCreator.loadCurrentCheckout(options)(store),
                        of(createAction(CustomerActionType.CreateCustomerSucceeded))
                    )));

            return concat(
                of(createAction(CustomerActionType.CreateCustomerRequested)),
                (isStorefrontSpamProtectionEnabled ?
                    from(this._spamProtectionActionCreator.execute()(store))
                        .pipe(switchMap(action => isSpamProtectionExecuteSucceededAction(action) ?
                                concat(
                                    of(action),
                                    createCustomer(action.payload?.token)
                                ) :
                                of(action)
                        )) :
                    createCustomer()
                )
            ).pipe(
                catchError(error => throwErrorAction(CustomerActionType.CreateCustomerFailed, error))
            );
        };
    }

    createAddress(
        customerAddress: CustomerAddressRequestBody,
        options?: RequestOptions
    ): Observable<CreateCustomerAddressAction> {
        return concat(
            of(createAction(CustomerActionType.CreateCustomerAddressRequested)),
            defer(async () => {
                const { body } = await this._customerRequestSender.createAddress(customerAddress, options);

                return createAction(CustomerActionType.CreateCustomerAddressSucceeded, body);
            })
        ).pipe(
            catchError(error => throwErrorAction(CustomerActionType.CreateCustomerAddressFailed, error))
        );
    }

    signInCustomer(
        credentials: CustomerCredentials,
        options?: RequestOptions
    ): ThunkAction<SignInCustomerAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(CustomerActionType.SignInCustomerRequested)),
            from(this._customerRequestSender.signInCustomer(credentials, options))
                .pipe(
                    switchMap(({ body }) => concat(
                        this._checkoutActionCreator.loadCurrentCheckout(options)(store),
                        of(createAction(CustomerActionType.SignInCustomerSucceeded, body.data))
                    ))
                )
        ).pipe(
            catchError(error => throwErrorAction(CustomerActionType.SignInCustomerFailed, error))
        );
    }

    signOutCustomer(
        options?: RequestOptions
    ): ThunkAction<SignOutCustomerAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(CustomerActionType.SignOutCustomerRequested)),
            from(this._customerRequestSender.signOutCustomer(options))
                .pipe(
                    switchMap(({ body }) => concat(
                        this._checkoutActionCreator.loadCurrentCheckout(options)(store),
                        of(createAction(CustomerActionType.SignOutCustomerSucceeded, body.data))
                    ))
                )
        ).pipe(
            catchError(error => throwErrorAction(CustomerActionType.SignOutCustomerFailed, error))
        );
    }
}
