import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { ConfigSelector } from '../config';
import { CountrySelector } from '../geography';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector } from '../customer';
import { OrderSelector } from '../order';
import { PaymentMethodSelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { QuoteSelector } from '../quote';
import { RemoteCheckoutSelector } from '../remote-checkout';
import { ShippingCountrySelector, ShippingAddressSelector, ShippingOptionSelector } from '../shipping';
import CheckoutStatusSelector from './checkout-status-selector';

describe('CheckoutStatusSelector', () => {
    let billingAddress;
    let cart;
    let config;
    let countries;
    let coupon;
    let customer;
    let giftCertificate;
    let instruments;
    let order;
    let paymentMethods;
    let quote;
    let remoteCheckout;
    let shippingAddress;
    let shippingCountries;
    let shippingOption;
    let statuses;

    beforeEach(() => {
        billingAddress = new BillingAddressSelector();
        cart = new CartSelector();
        config = new ConfigSelector();
        countries = new CountrySelector();
        coupon = new CouponSelector();
        customer = new CustomerSelector();
        giftCertificate = new GiftCertificateSelector();
        order = new OrderSelector();
        paymentMethods = new PaymentMethodSelector();
        instruments = new InstrumentSelector();
        quote = new QuoteSelector();
        remoteCheckout = new RemoteCheckoutSelector();
        shippingAddress = new ShippingAddressSelector();
        shippingCountries = new ShippingCountrySelector();
        shippingOption = new ShippingOptionSelector();

        statuses = new CheckoutStatusSelector(
            billingAddress,
            cart,
            config,
            countries,
            coupon,
            customer,
            giftCertificate,
            instruments,
            order,
            paymentMethods,
            quote,
            remoteCheckout,
            shippingAddress,
            shippingCountries,
            shippingOption
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
            jest.spyOn(order, 'isSubmitting').mockReturnValue(true);

            expect(statuses.isSubmittingOrder()).toEqual(true);
            expect(order.isSubmitting).toHaveBeenCalled();
        });

        it('returns false if submitting order', () => {
            jest.spyOn(order, 'isSubmitting').mockReturnValue(false);

            expect(statuses.isSubmittingOrder()).toEqual(false);
            expect(order.isSubmitting).toHaveBeenCalled();
        });
    });

    describe('#isFinalizingOrder()', () => {
        it('returns true if finalizing order', () => {
            jest.spyOn(order, 'isFinalizing').mockReturnValue(true);

            expect(statuses.isFinalizingOrder()).toEqual(true);
            expect(order.isFinalizing).toHaveBeenCalled();
        });

        it('returns false if finalizing order', () => {
            jest.spyOn(order, 'isFinalizing').mockReturnValue(false);

            expect(statuses.isFinalizingOrder()).toEqual(false);
            expect(order.isFinalizing).toHaveBeenCalled();
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
        it('returns true if initializing payment', () => {
            jest.spyOn(paymentMethods, 'isInitializingMethod').mockReturnValue(true);

            expect(statuses.isInitializingPaymentMethod('foobar')).toEqual(true);
            expect(paymentMethods.isInitializingMethod).toHaveBeenCalledWith('foobar');
        });

        it('returns true if initializing remote payment', () => {
            jest.spyOn(remoteCheckout, 'isInitializingPayment').mockReturnValue(true);

            expect(statuses.isInitializingPaymentMethod()).toEqual(true);
            expect(remoteCheckout.isInitializingPayment).toHaveBeenCalled();
        });

        it('returns false if not initializing remote payment', () => {
            jest.spyOn(remoteCheckout, 'isInitializingPayment').mockReturnValue(false);

            expect(statuses.isInitializingPaymentMethod()).toEqual(false);
            expect(remoteCheckout.isInitializingPayment).toHaveBeenCalled();
        });
    });

    describe('#isSigningIn()', () => {
        it('returns true if signing in', () => {
            jest.spyOn(customer, 'isSigningIn').mockReturnValue(true);

            expect(statuses.isSigningIn()).toEqual(true);
            expect(customer.isSigningIn).toHaveBeenCalled();
        });

        it('returns false if signing in', () => {
            jest.spyOn(customer, 'isSigningIn').mockReturnValue(false);

            expect(statuses.isSigningIn()).toEqual(false);
            expect(customer.isSigningIn).toHaveBeenCalled();
        });
    });

    describe('#isSigningOut()', () => {
        it('returns true if signing out', () => {
            jest.spyOn(customer, 'isSigningOut').mockReturnValue(true);

            expect(statuses.isSigningOut()).toEqual(true);
            expect(customer.isSigningOut).toHaveBeenCalled();
        });

        it('returns false if signing out', () => {
            jest.spyOn(customer, 'isSigningOut').mockReturnValue(false);

            expect(statuses.isSigningOut()).toEqual(false);
            expect(customer.isSigningOut).toHaveBeenCalled();
        });
    });

    describe('#isLoadingShippingOptions()', () => {
        it('returns true if loading shipping options', () => {
            jest.spyOn(shippingOption, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingShippingOptions()).toEqual(true);
            expect(shippingOption.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading shipping options', () => {
            jest.spyOn(shippingOption, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingShippingOptions()).toEqual(false);
            expect(shippingOption.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isSelectingShippingOption()', () => {
        it('returns true if selecting shipping options', () => {
            jest.spyOn(shippingOption, 'isSelecting').mockReturnValue(true);

            expect(statuses.isSelectingShippingOption()).toEqual(true);
            expect(shippingOption.isSelecting).toHaveBeenCalled();
        });

        it('returns false if not selecting shipping options', () => {
            jest.spyOn(shippingOption, 'isSelecting').mockReturnValue(false);

            expect(statuses.isSelectingShippingOption()).toEqual(false);
            expect(shippingOption.isSelecting).toHaveBeenCalled();
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
            jest.spyOn(shippingAddress, 'isUpdating').mockReturnValue(true);

            expect(statuses.isUpdatingShippingAddress()).toEqual(true);
            expect(shippingAddress.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(shippingAddress, 'isUpdating').mockReturnValue(false);

            expect(statuses.isUpdatingShippingAddress()).toEqual(false);
            expect(shippingAddress.isUpdating).toHaveBeenCalled();
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
