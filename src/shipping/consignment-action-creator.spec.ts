import { ThunkAction } from '@bigcommerce/data-store';
import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';
import { omit } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { Address } from '../address';
import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { getCheckout, getCheckoutState, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { Consignment, ConsignmentRequestSender } from '.';
import { ConsignmentsRequestBody, ConsignmentAssignmentRequestBody, ConsignmentShippingOptionRequestBody, ConsignmentUpdateRequestBody } from './consignment';
import ConsignmentActionCreator from './consignment-action-creator';
import { ConsignmentActionType, CreateConsignmentsAction, DeleteConsignmentAction, UpdateConsignmentAction, UpdateShippingOptionAction } from './consignment-actions';
import { getConsignment } from './consignments.mock';
import { getShippingAddress } from './shipping-addresses.mock';

describe('consignmentActionCreator', () => {
    let address: Address;
    let consignment: Consignment;
    let consignmentRequestSender: ConsignmentRequestSender;
    let checkoutRequestSender: CheckoutRequestSender;
    let errorResponse: Response<Error>;
    let response: Response<Checkout>;
    let store: CheckoutStore;
    let consignmentActionCreator: ConsignmentActionCreator;
    const options = { timeout: createTimeout() };

    beforeEach(() => {
        response = getResponse(getCheckout());
        errorResponse = getErrorResponse();
        store = createCheckoutStore(getCheckoutStoreState());

        consignmentRequestSender = new ConsignmentRequestSender(createRequestSender());

        jest.spyOn(consignmentRequestSender, 'createConsignments').mockReturnValue(Promise.resolve(response));
        jest.spyOn(consignmentRequestSender, 'updateConsignment').mockReturnValue(Promise.resolve(response));
        jest.spyOn(consignmentRequestSender, 'deleteConsignment').mockReturnValue(Promise.resolve(response));

        checkoutRequestSender = new CheckoutRequestSender(createRequestSender());

        jest.spyOn(checkoutRequestSender, 'loadCheckout').mockReturnValue(Promise.resolve(response));

        consignmentActionCreator = new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender);
        address = getShippingAddress();
        consignment = getConsignment();
    });

    describe('#loadShippingOptions', () => {
        describe('when store has no checkout data', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(consignmentActionCreator.loadShippingOptions()(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions and passes right arguments to consignmentRequestSender', async () => {
            const { id } = getCheckout();
            const actions = await from(consignmentActionCreator.loadShippingOptions()(store))
                .pipe(toArray())
                .toPromise();

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalledWith(id, {
                params: {
                    include: ['consignments.availableShippingOptions'],
                },
            });

            expect(actions).toEqual([
                { type: ConsignmentActionType.LoadShippingOptionsRequested },
                { type: ConsignmentActionType.LoadShippingOptionsSucceeded, payload: getCheckout() },
            ]);
        });

        it('emits errors and passes right arguments to consignmentRequestSender', async () => {
            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn(action => of(action));

            const actions = await from(consignmentActionCreator.loadShippingOptions()(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ConsignmentActionType.LoadShippingOptionsRequested },
                { type: ConsignmentActionType.LoadShippingOptionsFailed, error: true, payload: getErrorResponse() },
            ]);
        });
    });

    describe('#createConsignments()', () => {
        let thunkAction: ThunkAction<CreateConsignmentsAction>;
        let payload: ConsignmentsRequestBody;

        beforeEach(() => {
            payload = [{
                shippingAddress: consignment.shippingAddress,
                lineItems: [],
            }];

            thunkAction = consignmentActionCreator.createConsignments(payload, options);
        });

        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
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
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.createConsignments).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to create consignment', async () => {
            const actions = await from(thunkAction(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ConsignmentActionType.CreateConsignmentsRequested },
                { type: ConsignmentActionType.CreateConsignmentsSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to create consignments', async () => {
            jest.spyOn(consignmentRequestSender, 'createConsignments')
                .mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            await from(thunkAction(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: ConsignmentActionType.CreateConsignmentsRequested },
                        { type: ConsignmentActionType.CreateConsignmentsFailed, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to create consignments', async () => {
            store = createCheckoutStore(omit(getCheckoutStoreState(), 'consignments'));

            await from(thunkAction(store)).toPromise();

            expect(consignmentRequestSender.createConsignments).toHaveBeenCalledWith(
                'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                payload,
                options
            );
        });
    });

    describe('#unassignItemsByAddress()', () => {
        let thunkAction: ThunkAction<DeleteConsignmentAction | UpdateConsignmentAction>;
        let payload: ConsignmentAssignmentRequestBody;

        beforeEach(() => {
            payload = {
                shippingAddress: consignment.shippingAddress,
                lineItems: [{
                    itemId: 'unassigned',
                    quantity: 1,
                }, {
                    itemId: 'existing',
                    quantity: 1,
                }],
            };

            thunkAction = consignmentActionCreator.unassignItemsByAddress(payload, options);
        });

        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
                    expect(consignmentRequestSender.deleteConsignment).not.toHaveBeenCalled();
                }
            });
        });

        describe('when address matches an existing consignment', () => {
            beforeEach(() => {
                jest.spyOn(store.getState().consignments, 'getConsignmentByAddress')
                    .mockReturnValue(consignment);

                const checkoutStoreState = getCheckoutStoreState();
                // tslint:disable-next-line:no-non-null-assertion
                const physicalItems = checkoutStoreState.cart.data!.lineItems.physicalItems;

                // tslint:disable-next-line:no-non-null-assertion
                checkoutStoreState.cart.data!.lineItems.physicalItems = [
                    physicalItems[0],
                    {
                        ...physicalItems[0],
                        id: 'existing',
                        quantity: 2,
                    },
                ];

                // tslint:disable-next-line:no-non-null-assertion
                checkoutStoreState.consignments.data![0].lineItemIds = [
                    'existing',
                ];
                store = createCheckoutStore(checkoutStoreState);
            });

            it('emits actions if able to update consignment', async () => {
                const actions = await from(thunkAction(store))
                    .pipe(toArray())
                    .toPromise();

                expect(actions).toEqual([
                    {
                        type: ConsignmentActionType.UpdateConsignmentRequested,
                        payload: undefined,
                        meta: { id: consignment.id },
                    },
                    {
                        type: ConsignmentActionType.UpdateConsignmentSucceeded,
                        payload: response.body,
                        meta: { id: consignment.id },
                    },
                ]);
            });

            it('emits error actions if unable to update consignment', async () => {
                jest.spyOn(consignmentRequestSender, 'updateConsignment')
                    .mockImplementation(() => Promise.reject(errorResponse));

                const errorHandler = jest.fn(action => of(action));

                await from(consignmentActionCreator.updateConsignment(consignment)(store))
                    .pipe(
                        catchError(errorHandler),
                        toArray()
                    )
                    .subscribe(actions => {
                        expect(actions).toEqual([
                            {
                                type: ConsignmentActionType.UpdateConsignmentRequested,
                                payload: undefined,
                                meta: { id: consignment.id },
                            },
                            {
                                type: ConsignmentActionType.UpdateConsignmentFailed,
                                payload: errorResponse,
                                error: true,
                                meta: { id: consignment.id },
                            },
                        ]);
                    });
            });

            it('sends request to update consignment combining existing items', async () => {
                await from(thunkAction(store)).toPromise();

                expect(consignmentRequestSender.updateConsignment).toHaveBeenCalledWith(
                    'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    {
                        id: consignment.id,
                        shippingAddress: consignment.shippingAddress,
                        lineItems: [
                            {
                                itemId: 'existing',
                                quantity: 1,
                            },
                        ],
                    },
                    options
                );
            });
        });

        describe('when payload has empty line items', () => {
            let actions: any;

            beforeEach(async () => {
                thunkAction = consignmentActionCreator.unassignItemsByAddress({
                    ...payload,
                    lineItems: [],
                }, options);

                actions = await from(thunkAction(store))
                    .pipe(toArray())
                    .toPromise();
            });

            it('deletes a consignment when has no line items', () => {
                expect(consignmentRequestSender.deleteConsignment).toHaveBeenCalledWith(
                    'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    consignment.id,
                    options
                );
            });

            it('emits actions if able to update consignment', () => {
                expect(actions).toEqual([
                    {
                        type: ConsignmentActionType.DeleteConsignmentRequested,
                        payload: undefined,
                        meta: { id: consignment.id },
                    },
                    {
                        type: ConsignmentActionType.DeleteConsignmentSucceeded,
                        payload: response.body,
                        meta: { id: consignment.id },
                    },
                ]);
            });
        });

        describe('when address does not match any existing consignment', () => {
            beforeEach(() => {
                jest.spyOn(store.getState().consignments, 'getConsignmentByAddress')
                    .mockReturnValue(undefined);
            });

            it('throws invalid argument exception', async () => {
                try {
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(InvalidArgumentError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
                    expect(consignmentRequestSender.deleteConsignment).not.toHaveBeenCalled();
                }
            });
        });
    });

    describe('#assignItemsByAddress()', () => {
        let thunkAction: ThunkAction<CreateConsignmentsAction | UpdateConsignmentAction>;
        let payload: ConsignmentAssignmentRequestBody;

        beforeEach(() => {
            payload = {
                shippingAddress: consignment.shippingAddress,
                lineItems: [{
                    itemId: 'unassigned',
                    quantity: 2,
                }, {
                    itemId: 'existing',
                    quantity: 1,
                }],
            };

            thunkAction = consignmentActionCreator.assignItemsByAddress(payload, options);
        });

        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        describe('when address matches an existing consignment', () => {
            beforeEach(() => {
                jest.spyOn(store.getState().consignments, 'getConsignmentByAddress')
                    .mockReturnValue(consignment);
            });

            it('emits actions if able to update consignment', async () => {
                const actions = await from(thunkAction(store))
                    .pipe(toArray())
                    .toPromise();

                expect(actions).toEqual([
                    {
                        type: ConsignmentActionType.UpdateConsignmentRequested,
                        payload: undefined,
                        meta: { id: consignment.id },
                    },
                    {
                        type: ConsignmentActionType.UpdateConsignmentSucceeded,
                        payload: response.body,
                        meta: { id: consignment.id },
                    },
                ]);
            });

            it('emits error actions if unable to update consignment', async () => {
                jest.spyOn(consignmentRequestSender, 'updateConsignment')
                    .mockImplementation(() => Promise.reject(errorResponse));

                const errorHandler = jest.fn(action => of(action));

                await from(consignmentActionCreator.updateConsignment(consignment)(store))
                    .pipe(
                        catchError(errorHandler),
                        toArray()
                    )
                    .subscribe(actions => {
                        expect(actions).toEqual([
                            {
                                type: ConsignmentActionType.UpdateConsignmentRequested,
                                payload: undefined,
                                meta: { id: consignment.id },
                            },
                            {
                                type: ConsignmentActionType.UpdateConsignmentFailed,
                                payload: errorResponse,
                                error: true,
                                meta: { id: consignment.id },
                            },
                        ]);
                    });
            });

            it('filters out items with 0 quantities', async () => {
                const thunkAction = consignmentActionCreator.assignItemsByAddress({
                    ...payload,
                    lineItems: [
                        ...payload.lineItems,
                        {
                            itemId: 'invalid qty',
                            quantity: 0,
                        },
                    ],
                }, options);
                await from(thunkAction(store)).toPromise();

                expect(consignmentRequestSender.updateConsignment).toHaveBeenCalledWith(
                    'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    {
                        id: consignment.id,
                        shippingAddress: consignment.shippingAddress,
                        lineItems: payload.lineItems,
                    },
                    options
                );
            });

            it('sends request to update consignment combining existing items', async () => {
                const checkoutStoreState = getCheckoutStoreState();
                // tslint:disable-next-line:no-non-null-assertion
                checkoutStoreState.cart.data!.lineItems.physicalItems = [
                    // tslint:disable-next-line:no-non-null-assertion
                    checkoutStoreState.cart.data!.lineItems.physicalItems[0],
                    {
                        // tslint:disable-next-line:no-non-null-assertion
                        ...checkoutStoreState.cart.data!.lineItems.physicalItems[0],
                        id: 'existing',
                        quantity: 3,
                    },
                ];

                // tslint:disable-next-line:no-non-null-assertion
                checkoutStoreState.consignments.data![0].lineItemIds = [
                    '12e11c8f-7dce-4da3-9413-b649533f8bad',
                    'existing',
                ];
                store = createCheckoutStore(checkoutStoreState);

                await from(thunkAction(store)).toPromise();

                expect(consignmentRequestSender.updateConsignment).toHaveBeenCalledWith(
                    'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    {
                        id: consignment.id,
                        shippingAddress: consignment.shippingAddress,
                        lineItems: [
                            {
                                itemId: 'unassigned',
                                quantity: 2,
                            },
                            {
                                itemId: 'existing',
                                quantity: 1,
                            },
                            {
                                itemId: 'existing',
                                quantity: 3,
                            },
                        ],
                    },
                    options
                );
            });
        });

        describe('when address does not match any existing consignment', () => {
            beforeEach(() => {
                jest.spyOn(store.getState().consignments, 'getConsignmentByAddress')
                    .mockReturnValue(undefined);
            });

            it('emits error actions if unable to update consignment', async () => {
                jest.spyOn(consignmentRequestSender, 'createConsignments')
                    .mockImplementation(() => Promise.reject(errorResponse));

                const errorHandler = jest.fn(action => of(action));

                await from(consignmentActionCreator.updateConsignment(consignment)(store))
                    .pipe(
                        catchError(errorHandler),
                        toArray()
                    )
                    .subscribe(actions => {
                        expect(actions).toEqual([
                            {
                                type: ConsignmentActionType.CreateConsignmentsRequested,
                                payload: undefined,
                                meta: { id: consignment.id },
                            },
                            {
                                type: ConsignmentActionType.CreateConsignmentsFailed,
                                payload: errorResponse,
                                error: true,
                                meta: { id: consignment.id },
                            },
                        ]);
                    });
            });

            it('sends request to create consignment with provided data', async () => {
                await from(thunkAction(store)).toPromise();

                expect(consignmentRequestSender.createConsignments).toHaveBeenCalledWith(
                    'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    [payload],
                    options
                );
            });
        });
    });

    describe('#updateConsignment()', () => {
        let thunkAction: ThunkAction<UpdateConsignmentAction>;
        let payload: ConsignmentUpdateRequestBody;

        beforeEach(() => {
            payload = consignment as ConsignmentUpdateRequestBody;
            thunkAction = consignmentActionCreator.updateConsignment(payload, options);
        });

        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to update consignment', async () => {
            const actions = await from(thunkAction(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: ConsignmentActionType.UpdateConsignmentRequested,
                    payload: undefined,
                    meta: { id: consignment.id },
                },
                {
                    type: ConsignmentActionType.UpdateConsignmentSucceeded,
                    payload: response.body,
                    meta: { id: consignment.id },
                },
            ]);
        });

        it('emits error actions if unable to update consignment', async () => {
            jest.spyOn(consignmentRequestSender, 'updateConsignment')
                .mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            await from(thunkAction(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(actions).toEqual([
                        {
                            type: ConsignmentActionType.UpdateConsignmentRequested,
                            payload: undefined,
                            meta: { id: consignment.id },
                        },
                        {
                            type: ConsignmentActionType.UpdateConsignmentFailed,
                            payload: errorResponse,
                            error: true,
                            meta: { id: consignment.id },
                        },
                    ]);
                });
        });

        it('sends request to update consignment', async () => {
            await from(thunkAction(store)).toPromise();

            expect(consignmentRequestSender.updateConsignment).toHaveBeenCalledWith(
                'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                payload,
                options
            );
        });
    });

    describe('#deleteConsignment()', () => {
        let thunkAction: ThunkAction<DeleteConsignmentAction>;

        beforeEach(() => {
            thunkAction = consignmentActionCreator.deleteConsignment(consignment.id, options);
        });

        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.deleteConsignment).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to delete consignment', async () => {
            const actions = await from(thunkAction(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: ConsignmentActionType.DeleteConsignmentRequested,
                    payload: undefined,
                    meta: { id: consignment.id },
                },
                {
                    type: ConsignmentActionType.DeleteConsignmentSucceeded,
                    payload: response.body,
                    meta: { id: consignment.id },
                },
            ]);
        });

        it('emits error actions if unable to delete consignment', async () => {
            jest.spyOn(consignmentRequestSender, 'deleteConsignment')
                .mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            await from(thunkAction(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(actions).toEqual([
                        {
                            type: ConsignmentActionType.DeleteConsignmentRequested,
                            payload: undefined,
                            meta: { id: consignment.id },
                        },
                        {
                            type: ConsignmentActionType.DeleteConsignmentFailed,
                            payload: errorResponse,
                            error: true,
                            meta: { id: consignment.id },
                        },
                    ]);
                });
        });

        it('sends request to delete consignment', async () => {
            await from(thunkAction(store)).toPromise();

            expect(consignmentRequestSender.deleteConsignment).toHaveBeenCalledWith(
                'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                consignment.id,
                options
            );
        });
    });

    describe('#updateShippingOption()', () => {
        let thunkAction: ThunkAction<UpdateShippingOptionAction>;
        let payload: ConsignmentShippingOptionRequestBody;

        beforeEach(() => {
            payload = {
                id: consignment.id,
                shippingOptionId: 'bar',
            };

            thunkAction = consignmentActionCreator.updateShippingOption(payload, options);
        });

        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(thunkAction(store)).toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to update shipping option', async () => {
            const actions = await from(thunkAction(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ConsignmentActionType.UpdateShippingOptionRequested, payload: undefined, meta: { id: consignment.id } },
                {
                    type: ConsignmentActionType.UpdateShippingOptionSucceeded,
                    payload: response.body,
                    meta: { id: consignment.id },
                },
            ]);
        });

        it('emits error actions if unable to update shipping option', async () => {
            jest.spyOn(consignmentRequestSender, 'updateConsignment')
                .mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            await from(thunkAction(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: ConsignmentActionType.UpdateShippingOptionRequested, payload: undefined, meta: { id: consignment.id } },
                        {
                            type: ConsignmentActionType.UpdateShippingOptionFailed,
                            payload: errorResponse,
                            error: true,
                            meta: { id: consignment.id },
                        },
                    ]);
                });
        });

        it('sends request to update shipping option', async () => {
            await from(thunkAction(store)).toPromise();

            expect(consignmentRequestSender.updateConsignment).toHaveBeenCalledWith(
                'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                payload,
                options
            );
        });
    });

    describe('#updateAddress()', () => {
        describe('when store has no checkout data / id', () => {
            beforeEach(() => {
                store = createCheckoutStore({});
            });

            it('throws an exception, emit no actions and does not send a request', async () => {
                try {
                    await from(consignmentActionCreator.updateAddress(address)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
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
                    await from(consignmentActionCreator.updateAddress(address)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.createConsignments).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to update shipping address', async () => {
            const actions = await from(consignmentActionCreator.updateAddress(address)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ConsignmentActionType.UpdateConsignmentRequested, meta: { id: consignment.id } },
                { type: ConsignmentActionType.UpdateConsignmentSucceeded, payload: response.body, meta: { id: consignment.id } },
            ]);
        });

        it('emits error actions if unable to update shipping address', async () => {
            jest.spyOn(consignmentRequestSender, 'createConsignments')
                .mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            await from(consignmentActionCreator.updateAddress(address)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: ConsignmentActionType.CreateConsignmentsRequested },
                        { type: ConsignmentActionType.CreateConsignmentsFailed, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to update shipping address in first consignment', async () => {
            await from(consignmentActionCreator.updateAddress(address, options)(store))
                .toPromise();

            expect(consignmentRequestSender.updateConsignment).toHaveBeenCalledWith(
                'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                {
                    id: '55c96cda6f04c',
                    shippingAddress: address,
                    lineItems: [
                        {
                            itemId: '666',
                            quantity: 1,
                        },
                    ],
                },
                options
            );
        });

        it('sends request to create consignments', async () => {
            store = createCheckoutStore(omit(getCheckoutStoreState(), 'consignments'));

            await from(consignmentActionCreator.updateAddress(address, options)(store))
                .toPromise();

            expect(consignmentRequestSender.createConsignments).toHaveBeenCalledWith(
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
                    await from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
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
                    await from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                        .toPromise();
                } catch (exception) {
                    expect(exception).toBeInstanceOf(MissingDataError);
                    expect(consignmentRequestSender.updateConsignment).not.toHaveBeenCalled();
                }
            });
        });

        it('emits actions if able to select shipping option', async () => {
            const actions = await from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ConsignmentActionType.UpdateShippingOptionRequested, payload: undefined, meta: { id: consignment.id } },
                { type: ConsignmentActionType.UpdateShippingOptionSucceeded, payload: response.body, meta: { id: consignment.id } },
            ]);
        });

        it('emits error actions if unable to update shipping option', async () => {
            jest.spyOn(consignmentRequestSender, 'createConsignments')
                .mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            await from(consignmentActionCreator.selectShippingOption(shippingOptionId)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: ConsignmentActionType.UpdateShippingOptionRequested },
                        { type: ConsignmentActionType.UpdateShippingOptionFailed, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to update consignment', async () => {
            await from(consignmentActionCreator.selectShippingOption(shippingOptionId, options)(store))
                .toPromise();

            expect(consignmentRequestSender.updateConsignment).toHaveBeenCalledWith(
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
