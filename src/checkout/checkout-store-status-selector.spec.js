import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { ConfigSelector } from '../config';
import { CountrySelector } from '../geography';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerStrategySelector } from '../customer';
import { OrderSelector } from '../order';
import { PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { QuoteSelector } from '../quote';
import { ShippingCountrySelector, ShippingOptionSelector, ShippingStrategySelector } from '../shipping';
import { getCheckoutStoreState } from './checkouts.mock';
import CheckoutStoreStatusSelector from './checkout-store-status-selector';
import CheckoutSelector from './checkout-selector';

describe('CheckoutStoreStatusSelector', () => {
    let billingAddress;
    let cart;
    let checkout;
    let config;
    let countries;
    let coupon;
    let customerStrategy;
    let giftCertificate;
    let instruments;
    let order;
    let paymentMethods;
    let paymentStrategy;
    let quote;
    let shippingCountries;
    let shippingOptions;
    let shippingStrategy;
    let statuses;
    let state;

    beforeEach(() => {
        state = getCheckoutStoreState();
        billingAddress = new BillingAddressSelector(state.quote);
        cart = new CartSelector(state.cart);
        checkout = new CheckoutSelector(state.checkout);
        config = new ConfigSelector(state.config);
        countries = new CountrySelector(state.countries);
        coupon = new CouponSelector(state.coupons);
        customerStrategy = new CustomerStrategySelector();
        giftCertificate = new GiftCertificateSelector(state.giftCertificates);
        order = new OrderSelector(state.order, state.payment, state.customer, state.cart);
        paymentMethods = new PaymentMethodSelector(state.paymentMethods, state.order);
        paymentStrategy = new PaymentStrategySelector();
        instruments = new InstrumentSelector(state.instruments);
        quote = new QuoteSelector(state.quote);
        shippingCountries = new ShippingCountrySelector(state.shippingCountries);
        shippingOptions = new ShippingOptionSelector(state.shippingOptions, state.quote);
        shippingStrategy = new ShippingStrategySelector();

        statuses = new CheckoutStoreStatusSelector(
            billingAddress,
            cart,
            checkout,
            config,
            countries,
            coupon,
            customerStrategy,
            giftCertificate,
            instruments,
            order,
            paymentMethods,
            paymentStrategy,
            quote,
            shippingCountries,
            shippingOptions,
            shippingStrategy
        );
    });

    describe('#isLoadingCheckout()', () => {
        it('returns true if loading quote', () => {
            jest.spyOn(quote, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingCheckout()).toEqual(true);
            expect(quote.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading quote', () => {
            jest.spyOn(quote, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingCheckout()).toEqual(false);
            expect(quote.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isSubmittingOrder()', () => {
        it('returns true if submitting order', () => {
            jest.spyOn(paymentStrategy, 'isExecuting').mockReturnValue(true);

            expect(statuses.isSubmittingOrder()).toEqual(true);
            expect(paymentStrategy.isExecuting).toHaveBeenCalled();
        });

        it('returns false if submitting order', () => {
            jest.spyOn(paymentStrategy, 'isExecuting').mockReturnValue(false);

            expect(statuses.isSubmittingOrder()).toEqual(false);
            expect(paymentStrategy.isExecuting).toHaveBeenCalled();
        });
    });

    describe('#isFinalizingOrder()', () => {
        it('returns true if finalizing order', () => {
            jest.spyOn(paymentStrategy, 'isFinalizing').mockReturnValue(true);

            expect(statuses.isFinalizingOrder()).toEqual(true);
            expect(paymentStrategy.isFinalizing).toHaveBeenCalled();
        });

        it('returns false if finalizing order', () => {
            jest.spyOn(paymentStrategy, 'isFinalizing').mockReturnValue(false);

            expect(statuses.isFinalizingOrder()).toEqual(false);
            expect(paymentStrategy.isFinalizing).toHaveBeenCalled();
        });
    });

    describe('#isLoadingOrder()', () => {
        it('returns true if loading order', () => {
            jest.spyOn(order, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingOrder()).toEqual(true);
            expect(order.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading order', () => {
            jest.spyOn(order, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingOrder()).toEqual(false);
            expect(order.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingCart()', () => {
        it('returns true if loading cart', () => {
            jest.spyOn(cart, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingCart()).toEqual(true);
            expect(cart.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading cart', () => {
            jest.spyOn(cart, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingCart()).toEqual(false);
            expect(cart.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isVerifyingCart()', () => {
        it('returns true if verifying cart', () => {
            jest.spyOn(cart, 'isVerifying').mockReturnValue(true);

            expect(statuses.isVerifyingCart()).toEqual(true);
            expect(cart.isVerifying).toHaveBeenCalled();
        });

        it('returns false if verifying cart', () => {
            jest.spyOn(cart, 'isVerifying').mockReturnValue(false);

            expect(statuses.isVerifyingCart()).toEqual(false);
            expect(cart.isVerifying).toHaveBeenCalled();
        });
    });

    describe('#isLoadingBillingCountries()', () => {
        it('returns true if loading countries', () => {
            jest.spyOn(countries, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingBillingCountries()).toEqual(true);
            expect(countries.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading countries', () => {
            jest.spyOn(countries, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingBillingCountries()).toEqual(false);
            expect(countries.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingShippingCountries()', () => {
        it('returns true if loading shipping countries', () => {
            jest.spyOn(shippingCountries, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingShippingCountries()).toEqual(true);
            expect(shippingCountries.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading shipping countries', () => {
            jest.spyOn(shippingCountries, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingShippingCountries()).toEqual(false);
            expect(shippingCountries.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingPaymentMethods()', () => {
        it('returns true if loading payment methods', () => {
            jest.spyOn(paymentMethods, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingPaymentMethods()).toEqual(true);
            expect(paymentMethods.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading payment methods', () => {
            jest.spyOn(paymentMethods, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingPaymentMethods()).toEqual(false);
            expect(paymentMethods.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingPaymentMethod()', () => {
        it('returns true if loading payment method', () => {
            jest.spyOn(paymentMethods, 'isLoadingMethod').mockReturnValue(true);

            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(true);
            expect(paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });

        it('returns false if loading payment methods', () => {
            jest.spyOn(paymentMethods, 'isLoadingMethod').mockReturnValue(false);

            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(false);
            expect(paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });
    });

    describe('#isInitializingPaymentMethod()', () => {
        beforeEach(() => {
            jest.spyOn(paymentStrategy, 'isInitializing').mockReturnValue(false);
        });

        it('returns true if initializing payment', () => {
            jest.spyOn(paymentStrategy, 'isInitializing').mockReturnValue(true);

            expect(statuses.isInitializingPaymentMethod('foobar')).toEqual(true);
            expect(paymentStrategy.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing payment', () => {
            expect(statuses.isInitializingPaymentMethod('foobar')).toEqual(false);
            expect(paymentStrategy.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isSigningIn()', () => {
        it('returns true if signing in', () => {
            jest.spyOn(customerStrategy, 'isSigningIn').mockReturnValue(true);

            expect(statuses.isSigningIn()).toEqual(true);
            expect(customerStrategy.isSigningIn).toHaveBeenCalled();
        });

        it('returns false if signing in', () => {
            jest.spyOn(customerStrategy, 'isSigningIn').mockReturnValue(false);

            expect(statuses.isSigningIn()).toEqual(false);
            expect(customerStrategy.isSigningIn).toHaveBeenCalled();
        });
    });

    describe('#isSigningOut()', () => {
        beforeEach(() => {
            jest.spyOn(customerStrategy, 'isSigningOut').mockReturnValue(false);
        });

        it('returns true if signing out', () => {
            jest.spyOn(customerStrategy, 'isSigningOut').mockReturnValue(true);

            expect(statuses.isSigningOut()).toEqual(true);
            expect(customerStrategy.isSigningOut).toHaveBeenCalled();
        });

        it('returns false if signing out', () => {
            expect(statuses.isSigningOut()).toEqual(false);
            expect(customerStrategy.isSigningOut).toHaveBeenCalled();
        });
    });

    describe('#isInitializingCustomer()', () => {
        it('returns true if initializing', () => {
            jest.spyOn(customerStrategy, 'isInitializing').mockReturnValue(true);

            expect(statuses.isInitializingCustomer('foobar')).toEqual(true);
            expect(customerStrategy.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing', () => {
            jest.spyOn(customerStrategy, 'isInitializing').mockReturnValue(false);

            expect(statuses.isInitializingCustomer('foobar')).toEqual(false);
            expect(customerStrategy.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isLoadingShippingOptions()', () => {
        it('returns true if loading shipping options', () => {
            jest.spyOn(shippingOptions, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingShippingOptions()).toEqual(true);
            expect(shippingOptions.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading shipping options', () => {
            jest.spyOn(shippingOptions, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingShippingOptions()).toEqual(false);
            expect(shippingOptions.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isSelectingShippingOption()', () => {
        it('returns true if selecting shipping options', () => {
            jest.spyOn(shippingStrategy, 'isSelectingOption').mockReturnValue(true);

            expect(statuses.isSelectingShippingOption()).toEqual(true);
            expect(shippingStrategy.isSelectingOption).toHaveBeenCalled();
        });

        it('returns false if not selecting shipping options', () => {
            jest.spyOn(shippingStrategy, 'isSelectingOption').mockReturnValue(false);

            expect(statuses.isSelectingShippingOption()).toEqual(false);
            expect(shippingStrategy.isSelectingOption).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingBillingAddress()', () => {
        it('returns true if updating billing address', () => {
            jest.spyOn(billingAddress, 'isUpdating').mockReturnValue(true);

            expect(statuses.isUpdatingBillingAddress()).toEqual(true);
            expect(billingAddress.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating billing address', () => {
            jest.spyOn(billingAddress, 'isUpdating').mockReturnValue(false);

            expect(statuses.isUpdatingBillingAddress()).toEqual(false);
            expect(billingAddress.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingShippingAddress()', () => {
        it('returns true if updating shipping address', () => {
            jest.spyOn(shippingStrategy, 'isUpdatingAddress').mockReturnValue(true);

            expect(statuses.isUpdatingShippingAddress()).toEqual(true);
            expect(shippingStrategy.isUpdatingAddress).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(shippingStrategy, 'isUpdatingAddress').mockReturnValue(false);

            expect(statuses.isUpdatingShippingAddress()).toEqual(false);
            expect(shippingStrategy.isUpdatingAddress).toHaveBeenCalled();
        });
    });

    describe('#isInitializingShipping()', () => {
        it('returns true if initializing shipping', () => {
            jest.spyOn(shippingStrategy, 'isInitializing').mockReturnValue(true);

            expect(statuses.isInitializingShipping('foobar')).toEqual(true);
            expect(shippingStrategy.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing shipping', () => {
            jest.spyOn(shippingStrategy, 'isInitializing').mockReturnValue(false);

            expect(statuses.isInitializingShipping('foobar')).toEqual(false);
            expect(shippingStrategy.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isApplyingCoupon()', () => {
        it('returns true if applying a coupon', () => {
            jest.spyOn(coupon, 'isApplying').mockReturnValue(true);

            expect(statuses.isApplyingCoupon()).toEqual(true);
            expect(coupon.isApplying).toHaveBeenCalled();
        });

        it('returns false if not applying a coupon', () => {
            jest.spyOn(coupon, 'isApplying').mockReturnValue(false);

            expect(statuses.isApplyingCoupon()).toEqual(false);
            expect(coupon.isApplying).toHaveBeenCalled();
        });
    });

    describe('#isRemovingCoupon()', () => {
        it('returns true if removing a coupon', () => {
            jest.spyOn(coupon, 'isRemoving').mockReturnValue(true);

            expect(statuses.isRemovingCoupon()).toEqual(true);
            expect(coupon.isRemoving).toHaveBeenCalled();
        });

        it('returns false if not removing a coupon', () => {
            jest.spyOn(coupon, 'isRemoving').mockReturnValue(false);

            expect(statuses.isRemovingCoupon()).toEqual(false);
            expect(coupon.isRemoving).toHaveBeenCalled();
        });
    });

    describe('#isApplyingGiftCertificate()', () => {
        it('returns true if applying a gift certificate', () => {
            jest.spyOn(giftCertificate, 'isApplying').mockReturnValue(true);

            expect(statuses.isApplyingGiftCertificate()).toEqual(true);
            expect(giftCertificate.isApplying).toHaveBeenCalled();
        });

        it('returns false if not applying a gift certificate', () => {
            jest.spyOn(giftCertificate, 'isApplying').mockReturnValue(false);

            expect(statuses.isApplyingGiftCertificate()).toEqual(false);
            expect(giftCertificate.isApplying).toHaveBeenCalled();
        });
    });

    describe('#isRemovingGiftCertificate()', () => {
        it('returns true if removing a gift certificate', () => {
            jest.spyOn(giftCertificate, 'isRemoving').mockReturnValue(true);

            expect(statuses.isRemovingGiftCertificate()).toEqual(true);
            expect(giftCertificate.isRemoving).toHaveBeenCalled();
        });

        it('returns false if not removing a gift certificate', () => {
            jest.spyOn(giftCertificate, 'isRemoving').mockReturnValue(false);

            expect(statuses.isRemovingGiftCertificate()).toEqual(false);
            expect(giftCertificate.isRemoving).toHaveBeenCalled();
        });
    });

    describe('#isLoadingInstruments()', () => {
        it('returns true if loading instruments', () => {
            jest.spyOn(instruments, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingInstruments()).toEqual(true);
            expect(instruments.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading instruments', () => {
            jest.spyOn(instruments, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingInstruments()).toEqual(false);
            expect(instruments.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isVaultingInstrument()', () => {
        it('returns true if vaulting instrument', () => {
            jest.spyOn(instruments, 'isVaulting').mockReturnValue(true);

            expect(statuses.isVaultingInstrument()).toEqual(true);
            expect(instruments.isVaulting).toHaveBeenCalled();
        });

        it('returns false if not vaulting instrument', () => {
            jest.spyOn(instruments, 'isVaulting').mockReturnValue(false);

            expect(statuses.isVaultingInstrument()).toEqual(false);
            expect(instruments.isVaulting).toHaveBeenCalled();
        });
    });

    describe('#isDeletingInstrument()', () => {
        it('returns true if deleting instrument', () => {
            jest.spyOn(instruments, 'isDeleting').mockReturnValue(true);

            expect(statuses.isDeletingInstrument('123')).toEqual(true);
            expect(instruments.isDeleting).toHaveBeenCalledWith('123');
        });

        it('returns false if not deleting instrument', () => {
            jest.spyOn(instruments, 'isDeleting').mockReturnValue(false);

            expect(statuses.isDeletingInstrument('123')).toEqual(false);
            expect(instruments.isDeleting).toHaveBeenCalledWith('123');
        });
    });

    describe('#isLoadingConfig()', () => {
        it('returns true if loading config', () => {
            jest.spyOn(config, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingConfig()).toEqual(true);
            expect(config.isLoading).toHaveBeenCalledWith();
        });

        it('returns false if not loading config', () => {
            jest.spyOn(config, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingConfig()).toEqual(false);
            expect(config.isLoading).toHaveBeenCalled();
        });
    });
});
