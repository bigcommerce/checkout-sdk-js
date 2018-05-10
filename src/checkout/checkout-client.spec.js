import { createTimeout } from '@bigcommerce/request-sender';
import { getConfig } from '../config/configs.mock';
import { getResponse } from '../common/http-request/responses.mock';
import { getBillingAddress } from '../billing/internal-billing-addresses.mock';
import { getCart, getCartResponseBody } from '../cart/internal-carts.mock';
import { getCompleteOrder } from '../order/internal-orders.mock';
import { getCountries } from '../geography/countries.mock';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { getPaymentMethod, getPaymentMethods } from '../payment/payment-methods.mock';
import { getQuote } from '../quote/internal-quotes.mock';
import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';
import CheckoutClient from './checkout-client';

describe('CheckoutClient', () => {
    let client;
    let billingAddressRequestSender;
    let cartRequestSender;
    let configRequestSender;
    let countryRequestSender;
    let couponRequestSender;
    let customerRequestSender;
    let giftCertificateRequestSender;
    let orderRequestSender;
    let paymentMethodRequestSender;
    let quoteRequestSender;
    let shippingAddressRequestSender;
    let shippingCountryRequestSender;
    let shippingOptionRequestSender;

    beforeEach(() => {
        billingAddressRequestSender = {
            updateAddress: jest.fn(() => Promise.resolve(getResponse(getBillingAddress()))),
        };

        cartRequestSender = {
            loadCart: jest.fn(() => Promise.resolve(getResponse(getCart()))),
        };

        configRequestSender = {
            loadConfig: jest.fn(() => Promise.resolve(getResponse(getConfig()))),
        };

        countryRequestSender = {
            loadCountries: jest.fn(() => Promise.resolve(getResponse(getCountries()))),
        };

        couponRequestSender = {
            applyCoupon: jest.fn(() => Promise.resolve(getCartResponseBody())),
            removeCoupon: jest.fn(() => Promise.resolve(getCartResponseBody())),
        };

        customerRequestSender = {
            signInCustomer: jest.fn(() => Promise.resolve(getCustomerResponseBody())),
            signOutCustomer: jest.fn(() => Promise.resolve(getCustomerResponseBody())),
        };

        giftCertificateRequestSender = {
            applyGiftCertificate: jest.fn(() => Promise.resolve(getCartResponseBody())),
            removeGiftCertificate: jest.fn(() => Promise.resolve(getCartResponseBody())),
        };

        orderRequestSender = {
            loadOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            finalizeOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            submitOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
        };

        orderRequestSender = {
            loadOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            finalizeOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            submitOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
        };

        paymentMethodRequestSender = {
            loadPaymentMethods: jest.fn(() => Promise.resolve(getResponse(getPaymentMethods()))),
            loadPaymentMethod: jest.fn(() => Promise.resolve(getResponse(getPaymentMethod()))),
        };

        quoteRequestSender = {
            loadQuote: jest.fn(() => Promise.resolve(getResponse(getQuote()))),
        };

        shippingCountryRequestSender = {
            loadCountries: jest.fn(() => Promise.resolve(getResponse(getCountries()))),
        };

        shippingAddressRequestSender = {
            updateAddress: jest.fn(() => Promise.resolve(getResponse(getShippingAddress()))),
        };

        shippingOptionRequestSender = {
            loadShippingOptions: jest.fn(() => Promise.resolve(getShippingOptions())),
            selectShippingOption: jest.fn(() => Promise.resolve(getShippingOptions())),
        };

        client = new CheckoutClient(
            billingAddressRequestSender,
            cartRequestSender,
            configRequestSender,
            countryRequestSender,
            couponRequestSender,
            customerRequestSender,
            giftCertificateRequestSender,
            orderRequestSender,
            paymentMethodRequestSender,
            quoteRequestSender,
            shippingAddressRequestSender,
            shippingCountryRequestSender,
            shippingOptionRequestSender,
        );
    });

    describe('#loadCheckout()', () => {
        it('loads checkout', async () => {
            const output = await client.loadCheckout();

            expect(output).toEqual(getResponse(getQuote()));
            expect(quoteRequestSender.loadQuote).toHaveBeenCalled();
        });

        it('loads checkout with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadCheckout(options);

            expect(output).toEqual(getResponse(getQuote()));
            expect(quoteRequestSender.loadQuote).toHaveBeenCalledWith(options);
        });
    });

    describe('#loadOrder()', () => {
        it('loads order', async () => {
            const output = await client.loadOrder(295);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadOrder(295, options);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, options);
        });
    });

    describe('#submitOrder()', () => {
        it('submits order', async () => {
            const payload = { useStoreCredit: false };
            const output = await client.submitOrder(payload);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(payload, undefined);
        });

        it('submits order with timeout', async () => {
            const payload = { useStoreCredit: false };
            const options = { timeout: createTimeout() };
            const output = await client.submitOrder(payload, options);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(payload, options);
        });
    });

    describe('#finalizeOrder()', () => {
        it('finalizes order', async () => {
            const output = await client.finalizeOrder(295);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.finalizeOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('finalizes order with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.finalizeOrder(295, options);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.finalizeOrder).toHaveBeenCalledWith(295, options);
        });
    });

    describe('#loadPaymentMethods()', () => {
        it('loads payment methods', async () => {
            const output = await client.loadPaymentMethods();

            expect(output).toEqual(getResponse(getPaymentMethods()));
            expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalledWith(undefined);
        });

        it('loads payment methods with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadPaymentMethods(options);

            expect(output).toEqual(getResponse(getPaymentMethods()));
            expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalledWith(options);
        });
    });

    describe('#loadPaymentMethod()', () => {
        it('loads payment method', async () => {
            const output = await client.loadPaymentMethod('braintree');

            expect(output).toEqual(getResponse(getPaymentMethod()));
            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith('braintree', undefined);
        });

        it('loads payment method with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadPaymentMethod('braintree', options);

            expect(output).toEqual(getResponse(getPaymentMethod()));
            expect(paymentMethodRequestSender.loadPaymentMethod).toHaveBeenCalledWith('braintree', options);
        });
    });

    describe('#loadCart()', () => {
        it('loads cart', async () => {
            const output = await client.loadCart();

            expect(output).toEqual(getResponse(getCart()));
            expect(cartRequestSender.loadCart).toHaveBeenCalled();
        });

        it('loads cart with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadCart(options);

            expect(output).toEqual(getResponse(getCart()));
            expect(cartRequestSender.loadCart).toHaveBeenCalledWith(options);
        });
    });

    describe('#loadCountries()', () => {
        it('loads billing countries', async () => {
            const output = await client.loadCountries();

            expect(output).toEqual(getResponse(getCountries()));
            expect(countryRequestSender.loadCountries).toHaveBeenCalled();
        });

        it('loads billing countries with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadCountries(options);

            expect(output).toEqual(getResponse(getCountries()));
            expect(countryRequestSender.loadCountries).toHaveBeenCalledWith(options);
        });
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

    describe('#updateShippingAddress()', () => {
        let address;
        let options;

        beforeEach(() => {
            address = getShippingAddress();
            options = {
                timeout: createTimeout(),
            };
        });

        it('updates the shipping address', async () => {
            await client.updateShippingAddress(address, options);

            expect(shippingAddressRequestSender.updateAddress)
                .toHaveBeenCalledWith(address, options);
        });

        it('returns the shipping address', async () => {
            const output = await client.updateShippingAddress(address, options);

            expect(output).toEqual(getResponse(address));
        });
    });

    describe('#updateBillingAddress()', () => {
        let address;
        let options;

        beforeEach(() => {
            address = getBillingAddress();
            options = {
                timeout: createTimeout(),
            };
        });

        it('updates the billing address', async () => {
            await client.updateBillingAddress(address, options);

            expect(billingAddressRequestSender.updateAddress)
                .toHaveBeenCalledWith(address, options);
        });

        it('returns the billing address', async () => {
            const output = await client.updateBillingAddress(address, options);

            expect(output).toEqual(getResponse(address));
        });
    });

    describe('#signInCustomer()', () => {
        it('signs in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const output = await client.signInCustomer(credentials);

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signInCustomer).toHaveBeenCalledWith(credentials, undefined);
        });

        it('signs in customer with timeout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const options = { timeout: createTimeout() };
            const output = await client.signInCustomer(credentials, options);

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signInCustomer).toHaveBeenCalledWith(credentials, options);
        });
    });

    describe('#signOutCustomer()', () => {
        it('signs out customer', async () => {
            const output = await client.signOutCustomer();

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signOutCustomer).toHaveBeenCalled();
        });

        it('signs out customer with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.signOutCustomer(options);

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signOutCustomer).toHaveBeenCalledWith(options);
        });
    });

    describe('#loadShippingOptions()', () => {
        it('loads available shipping options', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadShippingOptions(options);

            expect(output).toEqual(getShippingOptions());
            expect(shippingOptionRequestSender.loadShippingOptions).toHaveBeenCalledWith(options);
        });
    });

    describe('#selectShippingOption()', () => {
        it('selects shipping option', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.selectShippingOption('addressId', 'shippingOptionId', options);

            expect(output).toEqual(getShippingOptions());
            expect(shippingOptionRequestSender.selectShippingOption)
                .toHaveBeenCalledWith('addressId', 'shippingOptionId', options);
        });
    });

    describe('#applyCoupon()', () => {
        it('applies a coupon code', async () => {
            const output = await client.applyCoupon('couponCode1234');

            expect(output).toEqual(getCartResponseBody());
            expect(couponRequestSender.applyCoupon)
                .toHaveBeenCalledWith('couponCode1234', undefined);
        });
    });

    describe('#removeCoupon()', () => {
        it('removes a coupon code', async () => {
            const output = await client.removeCoupon('couponCode1234');

            expect(output).toEqual(getCartResponseBody());
            expect(couponRequestSender.removeCoupon)
                .toHaveBeenCalledWith('couponCode1234', undefined);
        });
    });

    describe('#applyGiftCertificate()', () => {
        it('applies a gift certificate', async () => {
            const output = await client.applyGiftCertificate('giftCertificate1234');

            expect(output).toEqual(getCartResponseBody());
            expect(giftCertificateRequestSender.applyGiftCertificate)
                .toHaveBeenCalledWith('giftCertificate1234', undefined);
        });
    });

    describe('#removeGiftCertificate()', () => {
        it('removes a gift certificate', async () => {
            const output = await client.removeGiftCertificate('giftCertificate1234');

            expect(output).toEqual(getCartResponseBody());
            expect(giftCertificateRequestSender.removeGiftCertificate)
                .toHaveBeenCalledWith('giftCertificate1234', undefined);
        });
    });

    describe('#loadConfig()', () => {
        it('loads app config', async () => {
            const output = await client.loadConfig();

            expect(output).toEqual(getResponse(getConfig()));
            expect(configRequestSender.loadConfig).toHaveBeenCalled();
        });
    });
});
