import { createTimeout } from '@bigcommerce/request-sender';
import { getResponse } from '../common/http-request/responses.mock';
import { getBillingAddress } from '../billing/internal-billing-addresses.mock';
import { getCompleteOrder } from '../order/internal-orders.mock';
import { getCheckout } from './checkouts.mock';
import { getCountries } from '../geography/countries.mock';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import CheckoutClient from './checkout-client';

describe('CheckoutClient', () => {
    let client;
    let shippingCountryRequestSender;

    beforeEach(() => {
        shippingCountryRequestSender = {
            loadCountries: jest.fn(() => Promise.resolve(getResponse(getCountries()))),
        };

        client = new CheckoutClient(
            shippingCountryRequestSender
        );
    });

    describe('#loadShippingCountries()', () => {
        it('loads shipping countries', async () => {
            const output = await client.loadShippingCountries();

            expect(output).toEqual(getResponse(getCountries()));
            expect(shippingCountryRequestSender.loadCountries).toHaveBeenCalled();
        });

        it('loads shipping countries with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadShippingCountries(options);

            expect(output).toEqual(getResponse(getCountries()));
            expect(shippingCountryRequestSender.loadCountries).toHaveBeenCalledWith(options);
        });
    });
});
