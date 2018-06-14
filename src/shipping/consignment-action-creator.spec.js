import { createTimeout } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutActionType } from '../checkout';
import { getCheckout, getCheckoutState, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import ConsignmentActionCreator from './consignment-action-creator';
import { ConsignmentActionType } from './consignment-actions';
import { getShippingAddress } from './internal-shipping-addresses.mock';

describe('consignmentActionCreator', () => {
    let address;
    let checkoutClient;
    let checkoutRequestSender;
    let errorResponse;
    let response;
    let store;
    let consignmentActionCreator;
    let actions;
    const options = { timeout: createTimeout() };

    beforeEach(() => {
        response = getResponse(getCheckout());
        errorResponse = getErrorResponse();
        store = createCheckoutStore(getCheckoutStoreState());

        checkoutClient = {
            createConsignments: jest.fn(() => Promise.resolve(response)),
            updateConsignment: jest.fn(() => Promise.resolve(response)),
        };

        checkoutRequestSender = {
            loadCheckout: jest.fn(() => Promise.resolve(response)),
        };

        consignmentActionCreator = new ConsignmentActionCreator(checkoutClient, checkoutRequestSender);
        address = getShippingAddress();
        actions = undefined;
    });

    describe('#loadShippingOptions', () => {
        describe('when store has no checkout data', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await Observable.from(consignmentActionCreator.loadShippingOptions()(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(checkoutClient.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions and passes right arguments to checkoutClient', async () => {
            const { id } = getCheckout();
            actions = await Observable.from(consignmentActionCreator.loadShippingOptions()(store))
                .toArray()
                .toPromise();

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalledWith(id, {
                params: {
                    include: ['consignments.availableShippingOptions'],
                },
            });

            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
            ]);
        });

        it('emits errors and passes right arguments to checkoutClient', async () => {
            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn(action => Observable.of(action));

            actions = await Observable.from(consignmentActionCreator.loadShippingOptions()(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutFailed, error: true, payload: getErrorResponse() },
            ]);
        });
    });

    describe('#updateAddress()', () => {
        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await Observable.from(consignmentActionCreator.updateAddress(address)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(checkoutClient.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        describe('when store has no cart / line items', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    checkout: getCheckoutState(),
                });
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await Observable.from(consignmentActionCreator.updateAddress(address)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(checkoutClient.createConsignments).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to update shipping address', async () => {
            actions = await Observable.from(consignmentActionCreator.updateAddress(address)(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: ConsignmentActionType.CreateConsignmentsRequested },
                { type: ConsignmentActionType.CreateConsignmentsSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to update shipping address', async () => {
            checkoutClient.createConsignments.mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            await Observable.from(consignmentActionCreator.updateAddress(address)(store))
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: ConsignmentActionType.CreateConsignmentsRequested },
                        { type: ConsignmentActionType.CreateConsignmentsFailed, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to update shipping address', async () => {
            await Observable.from(consignmentActionCreator.updateAddress(address, options)(store))
                .toPromise();

            expect(checkoutClient.createConsignments).toHaveBeenCalledWith(
                'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                [{
                    shippingAddress: address,
                    lineItems: [
                        {
                            itemId: '666',
                            quantity: 1,
                        },
                    ],
                }],
                options
            );
        });
    });

    describe('#selectShippingOption()', () => {
        const shippingOptionId = 'foo';

        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await Observable.from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(checkoutClient.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        describe('when store has no shipping address', () => {
            beforeEach(() => {
                store = createCheckoutStore({
                    checkout: getCheckoutState(),
                });
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    actions = await Observable.from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(actions).toEqual(undefined);
                    expect(checkoutClient.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to select shipping option', async () => {
            actions = await Observable.from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: ConsignmentActionType.UpdateConsignmentRequested },
                { type: ConsignmentActionType.UpdateConsignmentSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to update shipping option', async () => {
            checkoutClient.createConsignments.mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            await Observable.from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: ConsignmentActionType.UpdateConsignmentRequested },
                        { type: ConsignmentActionType.UpdateConsignmentFailed, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to update consignment', async () => {
            await Observable.from(consignmentActionCreator.selectShippingOption(shippingOptionId, options)(store))
                .toPromise();

            expect(checkoutClient.updateConsignment).toHaveBeenCalledWith(
                'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                {
                    id: '55c96cda6f04c',
                    shippingOptionId,
                },
                options
            );
        });
    });
});
