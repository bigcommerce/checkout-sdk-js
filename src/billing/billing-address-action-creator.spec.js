import { Observable } from 'rxjs';

import { createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import BillingAddressActionCreator from './billing-address-action-creator';
import { BillingAddressActionType } from './billing-address-actions';
import { getBillingAddress } from './internal-billing-addresses.mock';

describe('BillingAddressActionCreator', () => {
    let address;
    let billingAddressActionCreator;
    let checkoutClient;
    let errorResponse;
    let response;
    let state;
    let store;
    let actions;

    beforeEach(() => {
        response = getResponse(getCheckout());
        errorResponse = getErrorResponse();
        state = getCheckoutStoreState();

        checkoutClient = {
            updateBillingAddress: jest.fn(() => Promise.resolve(response)),
            createBillingAddress: jest.fn(() => Promise.resolve(response)),
        };

        billingAddressActionCreator = new BillingAddressActionCreator(checkoutClient);
        address = getBillingAddress();
    });

    describe('#updateAddress()', () => {
        describe('when store has no checkout data', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await Observable.from(billingAddressActionCreator.updateAddress(address)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(checkoutClient.updateBillingAddress).not.toHaveBeenCalled();
                }
            });
        });

        describe('when store has checkout data but no billing address data', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    ...state,
                    billingAddress: undefined,
                });
            });

            it('emits actions if able to update billing address', async () => {
                actions = await Observable.from(billingAddressActionCreator.updateAddress(address)(store))
                    .toArray()
                    .toPromise();

                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressSucceeded, payload: response.body },
                ]);
            });

            it('emits error actions if unable to create billing address', async () => {
                jest.spyOn(checkoutClient, 'createBillingAddress')
                    .mockReturnValue(Promise.reject(getErrorResponse()));

                const errorHandler = jest.fn((action) => Observable.of(action));

                actions = await Observable.from(billingAddressActionCreator.updateAddress(address)(store))
                    .catch(errorHandler)
                    .toArray()
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressFailed, payload: errorResponse, error: true },
                ]);
            });

            it('sends request to create billing address', async () => {
                await Observable.from(billingAddressActionCreator.updateAddress(address, {})(store))
                    .toPromise();

                expect(checkoutClient.createBillingAddress).toHaveBeenCalledWith(getCheckout().id, address, {});
            });

            it('sends request to update email', async () => {
                const payload = { email: 'foo' };
                await Observable.from(billingAddressActionCreator.updateAddress(payload, {})(store))
                    .toPromise();

                expect(checkoutClient.createBillingAddress).toHaveBeenCalledWith(getCheckout().id, payload, {});
            });
        });

        describe('when store has checkout and billing address data from quote', () => {
            beforeEach(() => {
                store = createCheckoutStore(state);
            });

            it('emits actions if able to update billing address', async () => {
                actions = await Observable.from(billingAddressActionCreator.updateAddress(address)(store))
                    .toArray()
                    .toPromise();

                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressSucceeded, payload: response.body },
                ]);
            });

            it('emits error actions if unable to update billing address', async () => {
                jest.spyOn(checkoutClient, 'updateBillingAddress')
                    .mockReturnValue(Promise.reject(getErrorResponse()));

                const errorHandler = jest.fn((action) => Observable.of(action));

                actions = await Observable.from(billingAddressActionCreator.updateAddress(address)(store))
                    .catch(errorHandler)
                    .toArray()
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: BillingAddressActionType.UpdateBillingAddressRequested },
                    { type: BillingAddressActionType.UpdateBillingAddressFailed, payload: errorResponse, error: true },
                ]);
            });

            it('sends request to update billing address, using billing address email if not provided', async () => {
                await Observable.from(billingAddressActionCreator.updateAddress(address, {})(store))
                    .toPromise();

                expect(checkoutClient.updateBillingAddress).toHaveBeenCalledWith(
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
                await Observable.from(billingAddressActionCreator.updateAddress({ ...address, email }, {})(store))
                    .toPromise();


                expect(checkoutClient.updateBillingAddress).toHaveBeenCalledWith(
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
                await Observable.from(billingAddressActionCreator.updateAddress({ ...address, email }, {})(store))
                    .toPromise();

                expect(checkoutClient.updateBillingAddress).toHaveBeenCalledWith(
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
    });
});
