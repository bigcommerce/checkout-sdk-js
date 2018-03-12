import { Observable } from 'rxjs';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getShippingAddress, getShippingAddressResponseBody } from './internal-shipping-addresses.mock';
import * as actionTypes from './shipping-address-action-types';
import ShippingAddressActionCreator from './shipping-address-action-creator';

describe('ShippingAddressActionCreator', () => {
    let address;
    let checkoutClient;
    let errorResponse;
    let response;
    let shippingAddressActionCreator;

    beforeEach(() => {
        response = getResponse(getShippingAddressResponseBody());
        errorResponse = getErrorResponse();

        checkoutClient = {
            updateShippingAddress: jest.fn(() => Promise.resolve(response)),
        };

        shippingAddressActionCreator = new ShippingAddressActionCreator(checkoutClient);
        address = getShippingAddress();
    });

    describe('#updateShippingAddress()', () => {
        it('emits actions if able to update shipping address', () => {
            shippingAddressActionCreator.updateAddress(address)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED },
                        { type: actionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to update shipping address', () => {
            checkoutClient.updateShippingAddress.mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            shippingAddressActionCreator.updateAddress(address)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED },
                        { type: actionTypes.UPDATE_SHIPPING_ADDRESS_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to update shipping address', async () => {
            await shippingAddressActionCreator.updateAddress(address, {}).toPromise();

            expect(checkoutClient.updateShippingAddress).toHaveBeenCalledWith(address, {});
        });
    });
});
