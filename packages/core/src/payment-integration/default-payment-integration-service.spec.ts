import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import {
    HostedFieldType,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBuyNowCart,
    getBuyNowCartRequestBody,
    getCheckout,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BillingAddressActionCreator } from '../billing';
import { getBillingAddress } from '../billing/billing-addresses.mock';
import { CartRequestSender } from '../cart';
import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../checkout';
import { DataStoreProjection } from '../common/data-store';
import { getResponse } from '../common/http-request/responses.mock';
import { CustomerActionCreator } from '../customer';
import { HostedForm, HostedFormFactory } from '../hosted-form';
import { OrderActionCreator } from '../order';
import { getOrder } from '../order/orders.mock';
import { PaymentProviderCustomerActionCreator } from '../payment-provider-customer';
import PaymentActionCreator from '../payment/payment-action-creator';
import PaymentMethodActionCreator from '../payment/payment-method-action-creator';
import { getPayment } from '../payment/payments.mock';
import { RemoteCheckoutActionCreator } from '../remote-checkout';
import { ConsignmentActionCreator, ShippingCountryActionCreator } from '../shipping';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';
import { SpamProtectionActionCreator } from '../spam-protection';
import { StoreCreditActionCreator } from '../store-credit';

import DefaultPaymentIntegrationService from './default-payment-integration-service';
import PaymentIntegrationStoreProjectionFactory from './payment-integration-store-projection-factory';

describe('DefaultPaymentIntegrationService', () => {
    let subject: PaymentIntegrationService;
    let hostedFormFactory: HostedFormFactory;
    let paymentIntegrationSelectors: PaymentIntegrationSelectors;
    let requestSender: RequestSender;
    let internalCheckoutSelectors: InternalCheckoutSelectors;
    let store: Pick<CheckoutStore, 'dispatch' | 'getState'>;
    let storeProjection: Pick<
        DataStoreProjection<PaymentIntegrationSelectors>,
        'getState' | 'subscribe' | 'getState'
    >;
    let storeProjectionFactory: Pick<PaymentIntegrationStoreProjectionFactory, 'create'>;
    let checkoutActionCreator: Pick<
        CheckoutActionCreator,
        'loadCheckout' | 'loadCurrentCheckout' | 'loadDefaultCheckout'
    >;
    let orderActionCreator: Pick<
        OrderActionCreator,
        'submitOrder' | 'finalizeOrder' | 'loadCurrentOrder'
    >;
    let billingAddressActionCreator: Pick<BillingAddressActionCreator, 'updateAddress'>;
    let consignmentActionCreator: Pick<
        ConsignmentActionCreator,
        'updateAddress' | 'selectShippingOption' | 'deleteConsignment'
    >;
    let paymentMethodActionCreator: Pick<PaymentMethodActionCreator, 'loadPaymentMethod' | 'loadPaymentMethods'>;
    let paymentActionCreator: Pick<
        PaymentActionCreator,
        'submitPayment' | 'initializeOffsitePayment'
    >;
    let spamProtectionActionCreator: Pick<
        SpamProtectionActionCreator,
        'verifyCheckoutSpamProtection'
    >;
    let customerActionCreator: Pick<CustomerActionCreator, 'signInCustomer' | 'signOutCustomer'>;
    let cartRequestSender: CartRequestSender;
    let storeCreditActionCreator: Pick<StoreCreditActionCreator, 'applyStoreCredit'>;
    let paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator;
    let shippingCountryActionCreator: Pick<ShippingCountryActionCreator, 'loadCountries'>;
    let remoteCheckoutActionCreator: Pick<RemoteCheckoutActionCreator, 'initializePayment'>;

    beforeEach(() => {
        requestSender = createRequestSender();
        cartRequestSender = new CartRequestSender(requestSender);
        hostedFormFactory = new HostedFormFactory(store as CheckoutStore);
        paymentIntegrationSelectors = {} as PaymentIntegrationSelectors;

        internalCheckoutSelectors = {
            order: {
                getOrderOrThrow: () => getOrder(),
            },
            checkout: {
                getCheckoutOrThrow: () => {
                    return { ...getCheckout(), shouldExecuteSpamCheck: true };
                },
            },
        } as InternalCheckoutSelectors;

        store = {
            dispatch: jest.fn(async () => internalCheckoutSelectors),
            getState: jest.fn(() => internalCheckoutSelectors),
        };

        storeProjection = {
            subscribe: jest.fn(() => noop),
            getState: jest.fn(() => paymentIntegrationSelectors),
        };

        storeProjectionFactory = {
            create: jest.fn(() => storeProjection),
        };

        checkoutActionCreator = {
            loadCheckout: jest.fn(async () => () => createAction('LOAD_CHECKOUT')),
            loadCurrentCheckout: jest.fn(async () => () => createAction('LOAD_CHECKOUT')),
            loadDefaultCheckout: jest.fn(async () => () => createAction('LOAD_CHECKOUT')),
        };

        orderActionCreator = {
            submitOrder: jest.fn(async () => () => createAction('SUBMIT_ORDER')),
            finalizeOrder: jest.fn(async () => () => createAction('FINALIZE_ORDER')),
            loadCurrentOrder: jest.fn(async () => () => createAction('LOAD_CURRENT_ORDER')),
        };

        billingAddressActionCreator = {
            updateAddress: jest.fn(async () => () => createAction('UPDATE_BILLING_ADDRESS')),
        };

        consignmentActionCreator = {
            updateAddress: jest.fn(async () => () => createAction('UPDATE_CONSIGNMENT_ADDRESS')),
            selectShippingOption: jest.fn(async () => () => createAction('UPDATE_SHIPPING_OPTION')),
            deleteConsignment: jest.fn(async () => () => createAction('DELETE_CONSIGNMENT')),
        };

        paymentMethodActionCreator = {
            loadPaymentMethod: jest.fn(async () => () => createAction('LOAD_PAYMENT_METHOD')),
            loadPaymentMethods: jest.fn(async () => () => createAction('LOAD_PAYMENT_METHODS')),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(async () => () => createAction('LOAD_PAYMENT_METHOD')),
            initializeOffsitePayment: jest.fn(
                async () => () => createAction('INITIALIZE_OFFSITE_PAYMENT_REQUESTED'),
            ),
        };

        customerActionCreator = {
            signInCustomer: jest.fn(async () => () => createAction('SIGN_IN_CUSTOMER')),
            signOutCustomer: jest.fn(async () => () => createAction('SIGN_OUT_CUSTOMER')),
        };

        storeCreditActionCreator = {
            applyStoreCredit: jest.fn(
                async () => () => createAction('APPLY_STORE_CREDIT_REQUESTED'),
            ),
        };

        spamProtectionActionCreator = {
            verifyCheckoutSpamProtection: jest.fn(
                async () => () => createAction('SPAM_PROTECTION_CHECKOUT_VERIFY_REQUESTED'),
            ),
        };

        paymentProviderCustomerActionCreator = {
            updatePaymentProviderCustomer: jest.fn(
                async () => () => createAction('UPDATE_PAYMENT_PROVIDER_CUSTOMER'),
            ),
        };

        shippingCountryActionCreator = {
            loadCountries: jest.fn(
                async () => () => createAction('LOAD_SHIPPING_COUNTRIES_REQUESTED'),
            ),
        };

        remoteCheckoutActionCreator = {
            initializePayment: jest.fn(
                async () => () => createAction('INITIALIZE_REMOTE_PAYMENT_REQUESTED'),
            ),
        };

        subject = new DefaultPaymentIntegrationService(
            store as CheckoutStore,
            storeProjectionFactory as PaymentIntegrationStoreProjectionFactory,
            checkoutActionCreator as CheckoutActionCreator,
            hostedFormFactory,
            orderActionCreator as OrderActionCreator,
            billingAddressActionCreator as BillingAddressActionCreator,
            consignmentActionCreator as ConsignmentActionCreator,
            paymentMethodActionCreator as PaymentMethodActionCreator,
            paymentActionCreator as PaymentActionCreator,
            customerActionCreator as CustomerActionCreator,
            cartRequestSender,
            storeCreditActionCreator as StoreCreditActionCreator,
            spamProtectionActionCreator as SpamProtectionActionCreator,
            paymentProviderCustomerActionCreator,
            shippingCountryActionCreator as ShippingCountryActionCreator,
            remoteCheckoutActionCreator as RemoteCheckoutActionCreator,
        );
    });

    describe('#loadCheckout', () => {
        it('loads current checkout', async () => {
            const output = await subject.loadCheckout();

            expect(checkoutActionCreator.loadCurrentCheckout).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                checkoutActionCreator.loadCurrentCheckout(),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });

        it('loads checkout by provided id', async () => {
            const checkoutId = '1';
            const output = await subject.loadCheckout(checkoutId);

            expect(checkoutActionCreator.loadCheckout).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                checkoutActionCreator.loadCheckout(checkoutId),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#hostedForm', () => {
        it('creates hosted form', async () => {
            const output = await subject.createHostedForm('http://www.example.com', {
                fields: {
                    [HostedFieldType.CardCode]: { containerId: 'card-code' },
                    [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                    [HostedFieldType.CardName]: { containerId: 'card-name' },
                    [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                },
            });

            expect(output).toBeInstanceOf(HostedForm);
        });
    });

    describe('#loadDefaultCheckout', () => {
        it('loads current checkout', async () => {
            const output = await subject.loadDefaultCheckout();

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                checkoutActionCreator.loadDefaultCheckout(),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#loadPaymentMethod', () => {
        it('loads payment method', async () => {
            const output = await subject.loadPaymentMethod('braintree');

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(
                'braintree',
                undefined,
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentMethodActionCreator.loadPaymentMethod('braintree', undefined),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });

        it('loads payment method with params', async () => {
            const output = await subject.loadPaymentMethod('bluesnapdirect', {
                params: { method: 'cc' },
            });

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(
                'bluesnapdirect',
                { params: { method: 'cc' } },
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentMethodActionCreator.loadPaymentMethod('bluesnapdirect', {
                    params: { method: 'cc' },
                }),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#loadPaymentMethods', () => {
        it('loads payment methods', async () => {
            const output = await subject.loadPaymentMethods();

            expect(paymentMethodActionCreator.loadPaymentMethods).toHaveBeenCalledWith(
                undefined,
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentMethodActionCreator.loadPaymentMethods(undefined),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });

        it('loads payment method with params', async () => {
            const output = await subject.loadPaymentMethods({ params: { method: 'cc' } });

            expect(paymentMethodActionCreator.loadPaymentMethods).toHaveBeenCalledWith(
                { params: { method: 'cc' } },
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentMethodActionCreator.loadPaymentMethods({
                    params: { method: 'cc' },
                }),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#submitOrder', () => {
        it('submits order', async () => {
            const output = await subject.submitOrder();

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(orderActionCreator.submitOrder());
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#submitPayment', () => {
        it('submit payment', async () => {
            const output = await subject.submitPayment(getPayment());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentActionCreator.submitPayment(getPayment()),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#initializeOffsitePayment', () => {
        it('initializes offsite payment', async () => {
            const config = {
                methodId: 'test',
            };
            const output = await subject.initializeOffsitePayment(config);

            expect(paymentActionCreator.initializeOffsitePayment).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentActionCreator.initializeOffsitePayment(config),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#finalizeOrder', () => {
        it('finalizes order', async () => {
            const output = await subject.finalizeOrder();

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                orderActionCreator.finalizeOrder(getOrder().orderId),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#updateBillingAddress', () => {
        it('update billing address', async () => {
            const output = await subject.updateBillingAddress(getBillingAddress());

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(
                getBillingAddress(),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                billingAddressActionCreator.updateAddress(getBillingAddress()),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#updateShippingAddress', () => {
        it('update shipping address', async () => {
            const output = await subject.updateShippingAddress(getShippingAddress());

            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(
                getShippingAddress(),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                consignmentActionCreator.updateAddress(getShippingAddress()),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#selectShippingOption', () => {
        it('select shipping option', async () => {
            const output = await subject.selectShippingOption('1', {});

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith('1', {});
            expect(store.dispatch).toHaveBeenCalledWith(
                consignmentActionCreator.selectShippingOption('1', {}),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#signInCustomer', () => {
        it('sign in customer', async () => {
            const credentials = { email: 'test@test.com', password: '123' };
            const output = await subject.signInCustomer(credentials, {});

            expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, {});
            expect(store.dispatch).toHaveBeenCalledWith(
                customerActionCreator.signInCustomer(credentials, {}),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#signOutCustomer', () => {
        it('sign out customer', async () => {
            const output = await subject.signOutCustomer({});

            expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith({});
            expect(store.dispatch).toHaveBeenCalledWith(customerActionCreator.signOutCustomer({}));
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#verifyCheckoutSpamProtection', () => {
        it('verify spam protection', async () => {
            const output = await subject.verifyCheckoutSpamProtection();

            expect(spamProtectionActionCreator.verifyCheckoutSpamProtection).toHaveBeenCalledWith();
            expect(store.dispatch).toHaveBeenCalledWith(
                spamProtectionActionCreator.verifyCheckoutSpamProtection(),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#createBuyNowCart', () => {
        it('creates buy now cart', async () => {
            const buyNowCart = getBuyNowCart();
            const buyNowCartRequestBody = getBuyNowCartRequestBody();

            jest.spyOn(requestSender, 'post').mockReturnValue(getResponse(buyNowCart));
            jest.spyOn(cartRequestSender, 'createBuyNowCart');

            const output = await subject.createBuyNowCart(buyNowCartRequestBody);

            expect(cartRequestSender.createBuyNowCart).toHaveBeenCalledWith(
                buyNowCartRequestBody,
                undefined,
            );
            expect(output).toEqual(buyNowCart);
        });
    });

    describe('#applyStoreCredit', () => {
        it('applies store credits', async () => {
            const output = await subject.applyStoreCredit(true, {
                params: {},
            });

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true, {
                params: {},
            });
            expect(store.dispatch).toHaveBeenCalledWith(
                storeCreditActionCreator.applyStoreCredit(true, {
                    params: {},
                }),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#loadCurrentOrder', () => {
        it('loads current order', async () => {
            const output = await subject.loadCurrentOrder();

            expect(orderActionCreator.loadCurrentOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(orderActionCreator.loadCurrentOrder());
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#loadShippingCountries', () => {
        it('loads shipping countries', async () => {
            const output = await subject.loadShippingCountries();

            expect(shippingCountryActionCreator.loadCountries).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                shippingCountryActionCreator.loadCountries(),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#deleteConsignment', () => {
        it('delete consignment', async () => {
            const output = await subject.deleteConsignment('ID');

            expect(consignmentActionCreator.deleteConsignment).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                consignmentActionCreator.deleteConsignment('ID'),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#initializePayment', () => {
        it('initialize payment', async () => {
            const output = await subject.initializePayment('methodId');

            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                remoteCheckoutActionCreator.initializePayment('methodId'),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });
});
