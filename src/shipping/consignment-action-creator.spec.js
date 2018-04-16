import { Observable } from 'rxjs';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getShippingAddress } from './internal-shipping-addresses.mock';
import { ConsignmentActionTypes } from './consignment-actions';
import ConsignmentActionCreator from './consignment-action-creator';
import { getCartState } from '../cart/internal-carts.mock';
import { createCheckoutStore } from '../checkout';
import { getCheckoutState, getCheckout } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';

describe('consignmentActionCreator', () => {
    let address;
    let checkoutClient;
    let errorResponse;
    let response;
    let store;
    let consignmentActionCreator;

    beforeEach(() => {
        response = getResponse(getCheckout());
        errorResponse = getErrorResponse();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            cart: getCartState(),
        });

        checkoutClient = {
            createConsignments: jest.fn(() => Promise.resolve(response)),
        };

        consignmentActionCreator = new ConsignmentActionCreator(checkoutClient);
        address = getShippingAddress();
    });

    describe('#updateAddress()', () => {
        describe('when store has no checkout data / id', () => {
            let actions;
            const store = createCheckoutStore({
                cart: getCartState(),
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

        describe('when store has no cart / line items', () => {
            let actions;
            const store = createCheckoutStore({
                checkout: getCheckoutState(),
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
            const actions = await Observable.from(consignmentActionCreator.updateAddress(address)(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: ConsignmentActionTypes.CreateConsignmentsRequested },
                { type: ConsignmentActionTypes.CreateConsignmentsSucceeded, payload: response.body },
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
                        { type: ConsignmentActionTypes.CreateConsignmentsRequested },
                        { type: ConsignmentActionTypes.CreateConsignmentsFailed, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to update shipping address', async () => {
            await Observable.from(consignmentActionCreator.updateAddress(address, {})(store))
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
                {}
            );
        });
    });
});
