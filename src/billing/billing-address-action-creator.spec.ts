import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { omit } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { AddressRequestBody } from '../address';
import { createCheckoutStore, Checkout, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError, StandardError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { BillingAddressRequestBody } from './billing-address';
import BillingAddressActionCreator from './billing-address-action-creator';
import { BillingAddressAction, BillingAddressActionType, UpdateBillingAddressAction } from './billing-address-actions';
import BillingAddressRequestSender from './billing-address-request-sender';
import { getBillingAddress } from './billing-addresses.mock';

describe('BillingAddressActionCreator', () => {
    let address: AddressRequestBody;
    let billingAddressActionCreator: BillingAddressActionCreator;
    let billingAddressRequestSender: BillingAddressRequestSender;
    let errorResponse: Response<Error>;
    let response: Response<Checkout>;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let actions: BillingAddressAction[] | BillingAddressAction | undefined;

    beforeEach(() => {
        response = getResponse(getCheckout());
        errorResponse = getErrorResponse();
        state = getCheckoutStoreState();
        billingAddressRequestSender = new BillingAddressRequestSender(createRequestSender());

        jest.spyOn(billingAddressRequestSender, 'updateAddress').mockImplementation(() => Promise.resolve(response));
        jest.spyOn(billingAddressRequestSender, 'createAddress').mockImplementation(() => Promise.resolve(response));

        billingAddressActionCreator = new BillingAddressActionCreator(billingAddressRequestSender);
        address = getBillingAddress();
    });

    describe('#continueAsGuest()', () => {
        const guestCredentials = { email: 'x' };

        describe('when store has no checkout data', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await from(billingAddressActionCreator.continueAsGuest(guestCredentials)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(billingAddressRequestSender.updateAddress).not.toHaveBeenCalled();
                }
            });
        });

        describe('when store has a signed-in shopper', () => {
            beforeEach(() => {
                store = createCheckoutStore(state);
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await from(billingAddressActionCreator.continueAsGuest(guestCredentials)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(StandardError);
                    expect(actions).toEqual(undefined);
                    expect(billingAddressRequestSender.updateAddress).not.toHaveBeenCalled();
                }
            });
        });

        describe('when store has checkout data but no billing address data', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    ...omit(state, 'billingAddress'),
                    customer: {
                        ...state.customer,
                        data: {
                            // tslint:disable-next-line:no-non-null-assertion
                            ...state.customer.data!,
                            isGuest: true,
                        },
                    },
                });
            });

            it('emits actions if able to continue as guest', async () => {
                actions = await from(billingAddressActionCreator.continueAsGuest(guestCredentials)(store))
                    .pipe(toArray())
                    .toPromise();

                expect(actions).toEqual([
                    { type: BillingAddressActionType.ContinueAsGuestRequested },
                    { type: BillingAddressActionType.ContinueAsGuestSucceeded, payload: response.body },
                ]);
            });

            it('emits error actions if unable to continue as guest', async () => {
                jest.spyOn(billingAddressRequestSender, 'createAddress')
                    .mockReturnValue(Promise.reject(getErrorResponse()));

                const errorHandler = jest.fn();

                actions = await from(billingAddressActionCreator.continueAsGuest(guestCredentials)(store))
                    .pipe(
                        catchError((action: UpdateBillingAddressAction) => {
                            errorHandler();

                            return of(action);
                        }),
                        toArray()
                    )
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: BillingAddressActionType.ContinueAsGuestRequested },
                    { type: BillingAddressActionType.ContinueAsGuestFailed, payload: errorResponse, error: true },
                ]);
            });

            it('sends request to create billing address', async () => {
                await from(billingAddressActionCreator.continueAsGuest(guestCredentials, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.createAddress).toHaveBeenCalledWith(getCheckout().id, guestCredentials, {});
            });
        });

        describe('when store has checkout and billing address data from quote', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    ...state,
                    customer: {
                        ...state.customer,
                        data: {
                            // tslint:disable-next-line:no-non-null-assertion
                            ...state.customer.data!,
                            isGuest: true,
                        },
                    },
                });
            });

            it('emits actions if able to update billing address', async () => {
                actions = await from(billingAddressActionCreator.continueAsGuest(guestCredentials)(store))
                    .pipe(toArray())
                    .toPromise();

                expect(actions).toEqual([
                    { type: BillingAddressActionType.ContinueAsGuestRequested },
                    { type: BillingAddressActionType.ContinueAsGuestSucceeded, payload: response.body },
                ]);
            });

            it('emits error actions if unable to update billing address', async () => {
                jest.spyOn(billingAddressRequestSender, 'updateAddress')
                    .mockReturnValue(Promise.reject(getErrorResponse()));

                const errorHandler = jest.fn();

                actions = await from(billingAddressActionCreator.continueAsGuest(guestCredentials)(store))
                    .pipe(
                        catchError((action: BillingAddressAction) => {
                            errorHandler();

                            return of(action);
                        }),
                        toArray()
                    )
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: BillingAddressActionType.ContinueAsGuestRequested },
                    { type: BillingAddressActionType.ContinueAsGuestFailed, payload: errorResponse, error: true },
                ]);
            });

            it('sends request to update billing address, using billing address email if not provided', async () => {
                await from(billingAddressActionCreator.continueAsGuest(guestCredentials, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.updateAddress).toHaveBeenCalledWith(
                    getCheckout().id,
                    {
                        ...omit(address, 'country'),
                        ...guestCredentials,
                        id: '55c96cda6f04c',
                    },
                    {}
                );
            });
        });
    });

    describe('#updateAddress()', () => {
        describe('when store has no checkout data', () => {
            beforeEach(() => {
                actions = undefined;
                store = createCheckoutStore(omit(state, 'checkout'));
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await from(
                            billingAddressActionCreator.updateAddress(address)(createCheckoutStore({}))
                        ).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(billingAddressRequestSender.updateAddress).not.toHaveBeenCalled();
                    expect(billingAddressRequestSender.createAddress).not.toHaveBeenCalled();
                }
            });
        });

        describe('when store has checkout data but no billing address data', () => {
            beforeEach(() => {
                store = createCheckoutStore(omit(state, 'billingAddress'));
                address = omit(address, 'id') as BillingAddressRequestBody;
            });

            it('emits actions if able to update billing address', async () => {
                actions = await from(billingAddressActionCreator.updateAddress(address)(store))
                    .pipe(toArray())
                    .toPromise();

                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressSucceeded, payload: response.body },
                ]);
            });

            it('emits error actions if unable to create billing address', async () => {
                jest.spyOn(billingAddressRequestSender, 'createAddress')
                    .mockReturnValue(Promise.reject(getErrorResponse()));

                const errorHandler = jest.fn();

                actions = await from(billingAddressActionCreator.updateAddress(address)(store))
                    .pipe(
                        catchError((action: UpdateBillingAddressAction) => {
                            errorHandler();

                            return of(action);
                        }),
                        toArray()
                    )
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressFailed, payload: errorResponse, error: true },
                ]);
            });

            it('sends request to create billing address', async () => {
                await from(billingAddressActionCreator.updateAddress(address, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.createAddress).toHaveBeenCalledWith(getCheckout().id, address, {});
            });

            it('sends request to update email', async () => {
                const payload = { email: 'foo' };
                await from(billingAddressActionCreator.updateAddress(payload, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.createAddress).toHaveBeenCalledWith(getCheckout().id, payload, {});
            });
        });

        describe('when store has checkout and billing address data from quote', () => {
            beforeEach(() => {
                store = createCheckoutStore(state);
            });

            it('emits actions if able to update billing address', async () => {
                actions = await from(billingAddressActionCreator.updateAddress(address)(store))
                    .pipe(toArray())
                    .toPromise();

                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressSucceeded, payload: response.body },
                ]);
            });

            it('emits error actions if unable to update billing address', async () => {
                jest.spyOn(billingAddressRequestSender, 'updateAddress')
                    .mockReturnValue(Promise.reject(getErrorResponse()));

                const errorHandler = jest.fn();

                actions = await from(billingAddressActionCreator.updateAddress(address)(store))
                    .pipe(
                        catchError((action: UpdateBillingAddressAction) => {
                            errorHandler();

                            return of(action);
                        }),
                        toArray()
                    )
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressFailed, payload: errorResponse, error: true },
                ]);
            });

            it('sends request to update billing address, using billing address email if not provided', async () => {
                await from(billingAddressActionCreator.updateAddress(address, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.updateAddress).toHaveBeenCalledWith(
                    getCheckout().id,
                    {
                        ...address,
                        email: 'test@bigcommerce.com',
                        id: '55c96cda6f04c',
                    },
                    {}
                );
            });

            it('sends request to update billing address, using blank email when provided', async () => {
                const email = '';
                await from(billingAddressActionCreator.updateAddress({ ...address, email }, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.updateAddress).toHaveBeenCalledWith(
                    getCheckout().id,
                    {
                        ...address,
                        email,
                        id: '55c96cda6f04c',
                    },
                    {}
                );
            });

            it('sends request to update billing address, using provided email', async () => {
                const email = 'foo@bar.com';
                await from(billingAddressActionCreator.updateAddress({ ...address, email }, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.updateAddress).toHaveBeenCalledWith(
                    getCheckout().id,
                    {
                        ...address,
                        email,
                        id: '55c96cda6f04c',
                    },
                    {}
                );
            });
        });

        describe('when store has checkout and billing address data from an incomplete order', () => {
            beforeEach(() => {
                // The billing address contained in the Order response does not have an ID.
                store = createCheckoutStore(
                    omit(state, 'billingAddress.data.id')
                );
            });

            it('sends request to create a billing address, using provided email', async () => {
                const email = 'foo@bar.com';

                await from(billingAddressActionCreator.updateAddress({ ...address, email }, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.updateAddress).toHaveBeenCalledWith(
                    getCheckout().id,
                    {
                        ...address,
                        email,
                        id: '55c96cda6f04c',
                    },
                    {}
                );
            });

            it('sends request to create a billing address, using previous email', async () => {
                await from(billingAddressActionCreator.updateAddress(address, {})(store))
                    .toPromise();

                expect(billingAddressRequestSender.updateAddress).toHaveBeenCalledWith(
                    getCheckout().id,
                    {
                        ...address,
                        email: 'test@bigcommerce.com',
                        id: '55c96cda6f04c',
                    },
                    {}
                );
            });
        });
    });
});
