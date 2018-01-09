import { Observable } from 'rxjs';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getBillingAddress, getBillingAddressResponseBody } from './billing-address.mock';
import * as actionTypes from './billing-address-action-types';
import BillingAddressActionCreator from './billing-address-action-creator';

describe('BillingAddressActionCreator', () => {
    let address;
    let billingAddressActionCreator;
    let checkoutClient;
    let errorResponse;
    let response;

    beforeEach(() => {
        response = getResponse(getBillingAddressResponseBody());
        errorResponse = getErrorResponse();

        checkoutClient = {
            updateBillingAddress: jest.fn(() => Promise.resolve(response)),
        };

        billingAddressActionCreator = new BillingAddressActionCreator(checkoutClient);
        address = getBillingAddress();
    });

    describe('#updateBillingAddress()', () => {
        it('emits actions if able to update billing address', () => {
            billingAddressActionCreator.updateAddress(address)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.UPDATE_BILLING_ADDRESS_REQUESTED },
                        { type: actionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to update billing address', () => {
            checkoutClient.updateBillingAddress.mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            billingAddressActionCreator.updateAddress(address)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.UPDATE_BILLING_ADDRESS_REQUESTED },
                        { type: actionTypes.UPDATE_BILLING_ADDRESS_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to update billing address', async () => {
            await billingAddressActionCreator.updateAddress(address, {}).toPromise();

            expect(checkoutClient.updateBillingAddress).toHaveBeenCalledWith(address, {});
        });
    });
});
