import { Action, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';

import { AddressRequestBody } from '../address';
import { BillingAddressActionCreator, BillingAddressRequestBody } from '../billing';
import { createDataStoreProjection, DataStoreProjection } from '../common/data-store';
import { ErrorActionCreator, ErrorMessageTransformer } from '../common/error';
import { RequestOptions } from '../common/http-request';
import { bindDecorator as bind } from '../common/utility';
import { ConfigActionCreator } from '../config';
import { CouponActionCreator, GiftCertificateActionCreator } from '../coupon';
import { CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, CustomerStrategyActionCreator, GuestCredentials } from '../customer';
import { CountryActionCreator } from '../geography';
import { OrderActionCreator, OrderRequestBody } from '../order';
import { PaymentInitializeOptions, PaymentMethodActionCreator, PaymentRequestOptions, PaymentStrategyActionCreator } from '../payment';
import { InstrumentActionCreator } from '../payment/instrument';
import { ConsignmentsRequestBody, ConsignmentActionCreator, ConsignmentAssignmentRequestBody, ConsignmentUpdateRequestBody, ShippingCountryActionCreator, ShippingInitializeOptions, ShippingRequestOptions, ShippingStrategyActionCreator } from '../shipping';
import { SignInEmailActionCreator } from '../signin-email';
import { SpamProtectionActionCreator, SpamProtectionOptions } from '../spam-protection';
import { StoreCreditActionCreator } from '../store-credit';
import { Subscriptions, SubscriptionsActionCreator } from '../subscription';

import { CheckoutRequestBody } from './checkout';
import CheckoutActionCreator from './checkout-action-creator';
import CheckoutParams from './checkout-params';
import CheckoutSelectors from './checkout-selectors';
import CheckoutStore from './checkout-store';
import { createCheckoutSelectorsFactory, CheckoutSelectorsFactory } from './create-checkout-selectors';
import createCheckoutServiceErrorTransformer from './create-checkout-service-error-transformer';

/**
 * Responsible for completing the checkout process for the current customer.
 *
 * This object can be used to collect all information that is required for
 * checkout, such as shipping and billing information. It can also be used to
 * retrieve the current checkout state and subscribe to its changes.
 */
@bind
export default class CheckoutService {
    private _storeProjection: DataStoreProjection<CheckoutSelectors>;
    private _errorTransformer: ErrorMessageTransformer;
    private _selectorsFactory: CheckoutSelectorsFactory;

    /**
     * @internal
     */
    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _configActionCreator: ConfigActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _countryActionCreator: CountryActionCreator,
        private _couponActionCreator: CouponActionCreator,
        private _customerStrategyActionCreator: CustomerStrategyActionCreator,
        private _errorActionCreator: ErrorActionCreator,
        private _giftCertificateActionCreator: GiftCertificateActionCreator,
        private _instrumentActionCreator: InstrumentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _shippingCountryActionCreator: ShippingCountryActionCreator,
        private _shippingStrategyActionCreator: ShippingStrategyActionCreator,
        private _signInEmailActionCreator: SignInEmailActionCreator,
        private _spamProtectionActionCreator: SpamProtectionActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _subscriptionsActionCreator: SubscriptionsActionCreator
    ) {
        this._errorTransformer = createCheckoutServiceErrorTransformer();
        this._selectorsFactory = createCheckoutSelectorsFactory();
        this._storeProjection = createDataStoreProjection(this._store, this._selectorsFactory);
    }

    /**
     * Returns a snapshot of the current checkout state.
     *
     * The method returns a new instance every time there is a change in the
     * checkout state. You can query the state by calling any of its getter
     * methods.
     *
     * ```js
     * const state = service.getState();
     *
     * console.log(state.data.getOrder());
     * console.log(state.errors.getSubmitOrderError());
     * console.log(state.statuses.isSubmittingOrder());
     * ```
     *
     * @returns The current customer's checkout state
     */
    getState(): CheckoutSelectors {
        return this._storeProjection.getState();
    }

    /**
     * Notifies all subscribers with the current state.
     *
     * When this method gets called, the subscribers get called regardless if
     * they have any filters applied.
     */
    notifyState(): void {
        this._storeProjection.notifyState();
    }

    /**
     * Subscribes to any changes to the current state.
     *
     * The method registers a callback function and executes it every time there
     * is a change in the checkout state.
     *
     * ```js
     * service.subscribe(state => {
     *     console.log(state.data.getCart());
     * });
     * ```
     *
     * The method can be configured to notify subscribers only regarding
     * relevant changes, by providing a filter function.
     *
     * ```js
     * const filter = state => state.data.getCart();
     *
     * // Only trigger the subscriber when the cart changes.
     * service.subscribe(state => {
     *     console.log(state.data.getCart())
     * }, filter);
     * ```
     *
     * @param subscriber - The function to subscribe to state changes.
     * @param filters - One or more functions to filter out irrelevant state
     * changes. If more than one function is provided, the subscriber will only
     * be triggered if all conditions are met.
     * @returns A function, if called, will unsubscribe the subscriber.
     */
    subscribe(
        subscriber: (state: CheckoutSelectors) => void,
        ...filters: Array<(state: CheckoutSelectors) => any>
    ): () => void {
        return this._storeProjection.subscribe(subscriber, ...filters);
    }

    /**
     * Loads the current checkout.
     *
     * This method can only be called if there is an active checkout. Also, it
     * can only retrieve data that belongs to the current customer. When it is
     * successfully executed, you can retrieve the data by calling
     * `CheckoutStoreSelector#getCheckout`.
     *
     * ```js
     * const state = await service.loadCheckout('0cfd6c06-57c3-4e29-8d7a-de55cc8a9052');
     *
     * console.log(state.data.getCheckout());
     * ```
     *
     * @param id - The identifier of the checkout to load, or the default checkout if not provided.
     * @param options - Options for loading the current checkout.
     * @returns A promise that resolves to the current state.
     */
    loadCheckout(id?: string, options?: RequestOptions<CheckoutParams>): Promise<CheckoutSelectors> {
        return this._dispatch(id ?
            this._checkoutActionCreator.loadCheckout(id, options) :
            this._checkoutActionCreator.loadDefaultCheckout(options)
        );
    }

    /**
     * Updates specific properties of the current checkout.
     *
     * ```js
     * const state = await service.updateCheckout(checkout);
     *
     * console.log(state.data.getCheckout());
     * ```
     *
     * @param payload - The checkout properties to be updated.
     * @param options - Options for loading the current checkout.
     * @returns A promise that resolves to the current state.
     */
    updateCheckout(payload: CheckoutRequestBody, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._checkoutActionCreator.updateCheckout(payload, options);

        return this._dispatch(action);
    }

    /**
     * Loads an order by an id.
     *
     * The method can only retrieve an order if the order belongs to the current
     * customer. If it is successfully executed, the data can be retrieved by
     * calling `CheckoutStoreSelector#getOrder`.
     *
     * ```js
     * const state = await service.loadOrder(123);
     *
     * console.log(state.data.getOrder());
     * ```
     *
     * @param orderId - The identifier of the order to load.
     * @param options - Options for loading the order.
     * @returns A promise that resolves to the current state.
     */
    loadOrder(orderId: number, options?: RequestOptions): Promise<CheckoutSelectors> {
        const loadCheckoutAction = this._orderActionCreator.loadOrder(orderId, options);
        const loadConfigAction = this._configActionCreator.loadConfig(options);

        return Promise.all([
            this._dispatch(loadCheckoutAction),
            this._dispatch(loadConfigAction, { queueId: 'config' }),
        ])
            .then(() => this.getState());
    }

    /**
     * Submits an order, thereby completing a checkout process.
     *
     * Before you can submit an order, you must initialize the payment method
     * chosen by the customer by calling `CheckoutService#initializePayment`.
     *
     * ```js
     * await service.initializePayment({ methodId: 'braintree' });
     * await service.submitOrder({
     *     payment: {
     *         methodId: 'braintree',
     *         paymentData: {
     *             ccExpiry: { month: 10, year: 20 },
     *             ccName: 'BigCommerce',
     *             ccNumber: '4111111111111111',
     *             ccCvv: 123,
     *         },
     *     },
     * });
     * ```
     *
     * You are not required to include `paymentData` if the order does not
     * require additional payment details. For example, the customer has already
     * entered their payment details on the cart page using one of the hosted
     * payment methods, such as PayPal. Or the customer has applied a gift
     * certificate that exceeds the grand total amount.
     *
     * If the order is submitted successfully, you can retrieve the newly
     * created order by calling `CheckoutStoreSelector#getOrder`.
     *
     * ```js
     * const state = await service.submitOrder(payload);
     *
     * console.log(state.data.getOrder());
     * ```
     *
     * @param payload - The request payload to submit for the current order.
     * @param options - Options for submitting the current order.
     * @returns A promise that resolves to the current state.
     */
    submitOrder(payload: OrderRequestBody, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.execute(payload, options);

        return this._dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * Finalizes the submission process for an order.
     *
     * This method is only required for certain hosted payment methods that
     * require a customer to enter their credit card details on their website.
     * You need to call this method once the customer has redirected back to
     * checkout in order to complete the checkout process.
     *
     * If the method is called before order finalization is required or for a
     * payment method that does not require order finalization, an error will be
     * thrown. Conversely, if the method is called successfully, you should
     * immediately redirect the customer to the order confirmation page.
     *
     * ```js
     * try {
     *     await service.finalizeOrderIfNeeded();
     *
     *     window.location.assign('/order-confirmation');
     * } catch (error) {
     *     if (error.type !== 'order_finalization_not_required') {
     *         throw error;
     *     }
     * }
     * ```
     *
     * @param options - Options for finalizing the current order.
     * @returns A promise that resolves to the current state.
     * @throws `OrderFinalizationNotRequiredError` error if order finalization
     * is not required for the current order at the time of execution.
     */
    finalizeOrderIfNeeded(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.finalize(options);

        return this._dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * Loads a list of payment methods available for checkout.
     *
     * If a customer enters their payment details before navigating to the
     * checkout page (i.e.: using PayPal checkout button on the cart page), only
     * one payment method will be available for the customer - the selected
     * payment method. Otherwise, by default, all payment methods configured by
     * the merchant will be available for the customer.
     *
     * Once the method is executed successfully, you can call
     * `CheckoutStoreSelector#getPaymentMethods` to retrieve the list of payment
     * methods.
     *
     * ```js
     * const state = service.loadPaymentMethods();
     *
     * console.log(state.data.getPaymentMethods());
     * ```
     *
     * @param options - Options for loading the payment methods that are
     * available to the current customer.
     * @returns A promise that resolves to the current state.
     */
    loadPaymentMethods(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentMethodActionCreator.loadPaymentMethods(options);

        return this._dispatch(action, { queueId: 'paymentMethods' });
    }

    /**
     * Loads a payment method by an id.
     *
     * This method does not work with multi-option payment providers. Due to its
     * limitation, it is deprecated and will be removed in the future.
     *
     * @deprecated
     * @internal
     * @param methodId - The identifier for the payment method to load.
     * @param options - Options for loading the payment method.
     * @returns A promise that resolves to the current state.
     */
    loadPaymentMethod(methodId: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);

        return this._dispatch(action, { queueId: 'paymentMethods' });
    }

    /**
     * Initializes the payment step of a checkout process.
     *
     * Before a payment method can accept payment details, it must first be
     * initialized. Some payment methods require you to provide additional
     * initialization options. For example, Amazon requires a container ID in
     * order to initialize their payment widget.
     *
     * ```js
     * await service.initializePayment({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'walletWidget',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the payment step of checkout.
     * @returns A promise that resolves to the current state.
     */
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.initialize(options);

        return this._dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * De-initializes the payment step of a checkout process.
     *
     * The method should be called once you no longer require a payment method
     * to be initialized. It can perform any necessary clean-up behind the
     * scene, i.e.: remove DOM nodes or event handlers that are attached as a
     * result of payment initialization.
     *
     * ```js
     * await service.deinitializePayment({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the payment step of checkout.
     * @returns A promise that resolves to the current state.
     */
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.deinitialize(options);

        return this._dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * Loads a list of countries available for billing.
     *
     * Once you make a successful request, you will be able to retrieve the list
     * of countries by calling `CheckoutStoreSelector#getBillingCountries`.
     *
     * ```js
     * const state = await service.loadBillingCountries();
     *
     * console.log(state.data.getBillingCountries());
     * ```
     *
     * @param options - Options for loading the available billing countries.
     * @returns A promise that resolves to the current state.
     */
    loadBillingCountries(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._countryActionCreator.loadCountries(options);

        return this._dispatch(action, { queueId: 'billingCountries' });
    }

    /**
     * Loads a list of countries available for shipping.
     *
     * The list is determined based on the shipping zones configured by a
     * merchant. Once you make a successful call, you will be able to retrieve
     * the list of available shipping countries by calling
     * `CheckoutStoreSelector#getShippingCountries`.
     *
     * ```js
     * const state = await service.loadShippingCountries();
     *
     * console.log(state.data.getShippingCountries());
     * ```
     *
     * @param options - Options for loading the available shipping countries.
     * @returns A promise that resolves to the current state.
     */
    loadShippingCountries(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._shippingCountryActionCreator.loadCountries(options);

        return this._dispatch(action, { queueId: 'shippingCountries' });
    }

    /**
     * Loads a set of form fields that should be presented to customers in order
     * to capture their billing address.
     *
     * Once the method has been executed successfully, you can call
     * `CheckoutStoreSelector#getBillingAddressFields` to retrieve the set of
     * form fields.
     *
     * ```js
     * const state = service.loadBillingAddressFields();
     *
     * console.log(state.data.getBillingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the billing address form fields.
     * @returns A promise that resolves to the current state.
     */
    loadBillingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors> {
        return this.loadBillingCountries(options);
    }

    /**
     * Loads a set of form fields that should be presented to customers in order
     * to capture their shipping address.
     *
     * Once the method has been executed successfully, you can call
     * `CheckoutStoreSelector#getShippingAddressFields` to retrieve the set of
     * form fields.
     *
     * ```js
     * const state = service.loadShippingAddressFields();
     *
     * console.log(state.data.getShippingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the shipping address form fields.
     * @returns A promise that resolves to the current state.
     */
    loadShippingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors> {
        return this.loadShippingCountries(options);
    }

    /**
     * Initializes the sign-in step of a checkout process.
     *
     * Some payment methods, such as Amazon, have their own sign-in flow. In
     * order to support them, this method must be called.
     *
     * ```js
     * await service.initializeCustomer({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'signInButton',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the customer step of checkout.
     * @returns A promise that resolves to the current state.
     */
    initializeCustomer(options?: CustomerInitializeOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.initialize(options);

        return this._dispatch(action, { queueId: 'customerStrategy' });
    }

    /**
     * De-initializes the sign-in step of a checkout process.
     *
     * It should be called once you no longer want to prompt customers to sign
     * in. It can perform any necessary clean-up behind the scene, i.e.: remove
     * DOM nodes or event handlers that are attached as a result of customer
     * initialization.
     *
     * ```js
     * await service.deinitializeCustomer({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the customer step of checkout.
     * @returns A promise that resolves to the current state.
     */
    deinitializeCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.deinitialize(options);

        return this._dispatch(action, { queueId: 'customerStrategy' });
    }

    /**
     * Sends a email that contains a single-use sign-in link. When clicked, this link
     * signs in the customer without requiring any password.
     *
     * @internal
     * @param email - The email to be sent the sign-in link.
     * @param options - Options for the send email request.
     * @returns A promise that resolves to the current state.
     */
    sendSignInEmail(email: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._signInEmailActionCreator.sendSignInEmail(email, options);

        return this._dispatch(action, { queueId: 'signInEmail' });
    }

    /**
     * Updates the subscriptions associated to an email.
     *
     * @param subscriptions - The email and associated subscriptions to update.
     * @param options - Options for continuing as a guest.
     * @returns A promise that resolves to the current state.
     */
    updateSubscriptions(subscriptions: Subscriptions, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._subscriptionsActionCreator.updateSubscriptions(subscriptions, options);

        return this._dispatch(action, { queueId: 'subscriptions' });
    }

    /**
     * Continues to check out as a guest.
     *
     * The customer is required to provide their email address in order to
     * continue. Once they provide their email address, it will be stored as a
     * part of their billing address.
     *
     * @param credentials - The guest credentials to use, with optional subscriptions.
     * @param options - Options for continuing as a guest.
     * @returns A promise that resolves to the current state.
     */
    continueAsGuest(credentials: GuestCredentials, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._billingAddressActionCreator.continueAsGuest(credentials, options);

        return this._dispatch(action);
    }

    /**
     * Signs into a customer's registered account.
     *
     * Once the customer is signed in successfully, the checkout state will be
     * populated with information associated with the customer, such as their
     * saved addresses. You can call `CheckoutStoreSelector#getCustomer` to
     * retrieve the data.
     *
     * ```js
     * const state = await service.signInCustomer({
     *     email: 'foo@bar.com',
     *     password: 'password123',
     * });
     *
     * console.log(state.data.getCustomer());
     * ```
     *
     * @param credentials - The credentials to be used for signing in the customer.
     * @param options - Options for signing in the customer.
     * @returns A promise that resolves to the current state.
     */
    signInCustomer(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.signIn(credentials, options);

        return this._dispatch(action, { queueId: 'customerStrategy' });
    }

    /**
     * Signs out the current customer if they are previously signed in.
     *
     * Once the customer is successfully signed out, the checkout state will be
     * reset automatically.
     *
     * ```js
     * const state = await service.signOutCustomer();
     *
     * // The returned object should not contain information about the previously signed-in customer.
     * console.log(state.data.getCustomer());
     * ```
     *
     * @param options - Options for signing out the customer.
     * @returns A promise that resolves to the current state.
     */
    signOutCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.signOut(options);

        return this._dispatch(action, { queueId: 'customerStrategy' });
    }

    /**
     * Loads a list of shipping options available for checkout.
     *
     * Available shipping options can only be determined once a customer
     * provides their shipping address. If the method is executed successfully,
     * `CheckoutStoreSelector#getShippingOptions` can be called to retrieve the
     * list of shipping options.
     *
     * ```js
     * const state = await service.loadShippingOptions();
     *
     * console.log(state.data.getShippingOptions());
     * ```
     *
     * @param options - Options for loading the available shipping options.
     * @returns A promise that resolves to the current state.
     */
    loadShippingOptions(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.loadShippingOptions(options);

        return this._dispatch(action);
    }

    /**
     * Initializes the shipping step of a checkout process.
     *
     * Some payment methods, such as Amazon, can provide shipping information to
     * be used for checkout. In order to support them, this method must be
     * called.
     *
     * ```js
     * await service.initializeShipping({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'addressBook',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the shipping step of checkout.
     * @returns A promise that resolves to the current state.
     */
    initializeShipping(options?: ShippingInitializeOptions): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.initialize(options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * De-initializes the shipping step of a checkout process.
     *
     * It should be called once you no longer need to collect shipping details.
     * It can perform any necessary clean-up behind the scene, i.e.: remove DOM
     * nodes or event handlers that are attached as a result of shipping
     * initialization.
     *
     * ```js
     * await service.deinitializeShipping({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the shipping step of checkout.
     * @returns A promise that resolves to the current state.
     */
    deinitializeShipping(options?: ShippingRequestOptions): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.deinitialize(options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Selects a shipping option for the current address.
     *
     * If a shipping option has an additional cost, the quote for the current
     * order will be adjusted once the option is selected.
     *
     * ```js
     * const state = await service.selectShippingOption('address-id', 'shipping-option-id');
     *
     * console.log(state.data.getSelectedShippingOption());
     * ```
     *
     * @param shippingOptionId - The identifier of the shipping option to
     * select.
     * @param options - Options for selecting the shipping option.
     * @returns A promise that resolves to the current state.
     */
    selectShippingOption(shippingOptionId: string, options?: ShippingRequestOptions): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.selectOption(shippingOptionId, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Updates the shipping address for the current checkout.
     *
     * When a customer updates their shipping address for an order, they will
     * see an updated list of shipping options and the cost for each option,
     * unless no options are available. If the update is successful, you can
     * call `CheckoutStoreSelector#getShippingAddress` to retrieve the address.
     *
     * If the shipping address changes and the selected shipping option becomes
     * unavailable for the updated address, the shipping option will be
     * deselected.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateShippingAddress(address);
     *
     * console.log(state.data.getShippingAddress());
     * ```
     *
     * @param address - The address to be used for shipping.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    updateShippingAddress(
        address: Partial<AddressRequestBody>,
        options?: ShippingRequestOptions<CheckoutParams>
    ): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.updateAddress(address, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Creates consignments given a list.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#updateShippingAddress`.
     *
     * When consignments are created, an updated list of shipping options will
     * become available for each consignment, unless no options are available.
     * If the update is successful, you can call
     * `CheckoutStoreSelector#getConsignments` to retrieve the updated list of
     * consignments.'
     *
     * Beware that if a consignment includes all line items from another
     * consignment, that consignment will be deleted as a valid consignment must
     * include at least one valid line item.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.createConsignments(consignments);
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignments - The list of consignments to be created.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    createConsignments(
        consignments: ConsignmentsRequestBody,
        options?: RequestOptions
    ): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.createConsignments(consignments, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Deletes a consignment
     *
     * ```js
     * const state = await service.deleteConsignment('55c96cda6f04c');
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignmentId - The ID of the consignment to be deleted
     * @param options - Options for the consignment delete request
     * @returns A promise that resolves to the current state.
     */
    deleteConsignment(
        consignmentId: string,
        options?: RequestOptions
    ): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.deleteConsignment(consignmentId, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Updates a specific consignment.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#selectShippingOption`.
     *
     * When a shipping address for a consignment is updated, an updated list of
     * shipping options will become available for the consignment, unless no
     * options are available. If the update is successful, you can call
     * `CheckoutStoreSelector#getConsignments` to retrieve updated list of
     * consignments.
     *
     * Beware that if the updated consignment includes all line items from another
     * consignment, that consignment will be deleted as a valid consignment must
     * include at least one valid line item.
     *
     * If the shipping address changes and the selected shipping option becomes
     * unavailable for the updated address, the shipping option will be
     * deselected.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateConsignment(consignment);
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignment - The consignment data that will be used.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    updateConsignment(
        consignment: ConsignmentUpdateRequestBody,
        options?: RequestOptions
    ): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.updateConsignment(consignment, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Convenience method that assigns items to be shipped to a specific address.
     *
     * Note: this method finds an existing consignment that matches the provided address
     * and assigns the provided items. If no consignment matches the address, a new one
     * will be created.
     *
     * @param consignment - The consignment data that will be used.
     * @param options - Options for the request
     * @returns A promise that resolves to the current state.
     */
    assignItemsToAddress(
        consignment: ConsignmentAssignmentRequestBody,
        options?: RequestOptions
    ): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.assignItemsByAddress(consignment, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Convenience method that unassigns items from a specific shipping address.
     *
     * Note: this method finds an existing consignment that matches the provided address
     * and unassigns the specified items. If the consignment ends up with no line items
     * after the unassignment, it will be deleted.
     *
     * @param consignment - The consignment data that will be used.
     * @param options - Options for the request
     * @returns A promise that resolves to the current state.
     */
    unassignItemsToAddress(
        consignment: ConsignmentAssignmentRequestBody,
        options?: RequestOptions
    ): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.unassignItemsByAddress(consignment, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Selects a shipping option for a given consignment.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#updateShippingAddress`.
     *
     * If a shipping option has an additional cost, the quote for the current
     * order will be adjusted once the option is selected.
     *
     * ```js
     * const state = await service.selectConsignmentShippingOption(consignmentId, optionId);
     *
     * console.log(state.data.getConsignments());
     * ```
     *
     * @param consignmentId - The identified of the consignment to be updated.
     * @param shippingOptionId - The identifier of the shipping option to
     * select.
     * @param options - Options for selecting the shipping option.
     * @returns A promise that resolves to the current state.
     */
    selectConsignmentShippingOption(
        consignmentId: string,
        shippingOptionId: string,
        options?: ShippingRequestOptions
    ): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.updateShippingOption({
            id: consignmentId,
            shippingOptionId,
        }, options);

        return this._dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * Updates the billing address for the current checkout.
     *
     * A customer must provide their billing address before they can proceed to
     * pay for their order.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateBillingAddress(address);
     *
     * console.log(state.data.getBillingAddress());
     * ```
     *
     * @param address - The address to be used for billing.
     * @param options - Options for updating the billing address.
     * @returns A promise that resolves to the current state.
     */
    updateBillingAddress(address: Partial<BillingAddressRequestBody>, options: RequestOptions = {}): Promise<CheckoutSelectors> {
        const action = this._billingAddressActionCreator.updateAddress(address, options);

        return this._dispatch(action);
    }

    /**
     * Applies or removes customer's store credit code to the current checkout.
     *
     * Once the store credit gets applied, the outstanding balance will be adjusted accordingly.
     *
     * ```js
     * const state = await service.applyStoreCredit(true);
     *
     * console.log(state.data.getCheckout().outstandingBalance);
     * ```
     *
     * @param options - Options for applying store credit.
     * @returns A promise that resolves to the current state.
     */
    applyStoreCredit(useStoreCredit: boolean, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._storeCreditActionCreator.applyStoreCredit(useStoreCredit, options);

        return this._dispatch(action);
    }

    /**
     * Applies a coupon code to the current checkout.
     *
     * Once the coupon code gets applied, the quote for the current checkout will
     * be adjusted accordingly. The same coupon code cannot be applied more than
     * once.
     *
     * ```js
     * await service.applyCoupon('COUPON');
     * ```
     *
     * @param code - The coupon code to apply to the current checkout.
     * @param options - Options for applying the coupon code.
     * @returns A promise that resolves to the current state.
     */
    applyCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._couponActionCreator.applyCoupon(code, options);

        return this._dispatch(action);
    }

    /**
     * Removes a coupon code from the current checkout.
     *
     * Once the coupon code gets removed, the quote for the current checkout will
     * be adjusted accordingly.
     *
     * ```js
     * await service.removeCoupon('COUPON');
     * ```
     *
     * @param code - The coupon code to remove from the current checkout.
     * @param options - Options for removing the coupon code.
     * @returns A promise that resolves to the current state.
     */
    removeCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._couponActionCreator.removeCoupon(code, options);

        return this._dispatch(action);
    }

    /**
     * Applies a gift certificate to the current checkout.
     *
     * Once the gift certificate gets applied, the quote for the current
     * checkout will be adjusted accordingly.
     *
     * ```js
     * await service.applyGiftCertificate('GIFT_CERTIFICATE');
     * ```
     *
     * @param code - The gift certificate to apply to the current checkout.
     * @param options - Options for applying the gift certificate.
     * @returns A promise that resolves to the current state.
     */
    applyGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._giftCertificateActionCreator.applyGiftCertificate(code, options);

        return this._dispatch(action);
    }

    /**
     * Removes a gift certificate from an order.
     *
     * Once the gift certificate gets removed, the quote for the current
     * checkout will be adjusted accordingly.
     *
     * ```js
     * await service.removeGiftCertificate('GIFT_CERTIFICATE');
     * ```
     *
     * @param code - The gift certificate to remove from the current checkout.
     * @param options - Options for removing the gift certificate.
     * @returns A promise that resolves to the current state.
     */
    removeGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._giftCertificateActionCreator.removeGiftCertificate(code, options);

        return this._dispatch(action);
    }

    /**
     * Loads a list of payment instruments associated with a customer.
     *
     * Once the method has been called successfully, you can retrieve the list
     * of payment instruments by calling `CheckoutStoreSelector#getInstruments`.
     * If the customer does not have any payment instruments on record, i.e.:
     * credit card, you will get an empty list instead.
     *
     * ```js
     * const state = service.loadInstruments();
     *
     * console.log(state.data.getInstruments());
     * ```
     *
     * @returns A promise that resolves to the current state.
     */
    loadInstruments(): Promise<CheckoutSelectors> {
        const action = this._instrumentActionCreator.loadInstruments();

        return this._dispatch(action);
    }

    /**
     * Deletes a payment instrument by an id.
     *
     * Once an instrument gets removed, it can no longer be retrieved using
     * `CheckoutStoreSelector#getInstruments`.
     *
     * ```js
     * const state = service.deleteInstrument('123');
     *
     * console.log(state.data.getInstruments());
     * ```
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns A promise that resolves to the current state.
     */
    deleteInstrument(instrumentId: string): Promise<CheckoutSelectors> {
        const action = this._instrumentActionCreator.deleteInstrument(instrumentId);

        return this._dispatch(action)
            .then(() => this.loadInstruments());
    }

    /**
     * Clear errors that have been collected from previous calls.
     *
     * ```js
     * const state = await service.clearError(error);
     *
     * console.log(state.errors.getError());
     * ```
     *
     * @param error - Specific error object to clear
     * @returns A promise that resolves to the current state.
     */
    clearError(error: Error): Promise<CheckoutSelectors> {
        const action = this._errorActionCreator.clearError(error);

        return this._dispatch(action);
    }

    /**
     * Initializes the spam protection for order creation.
     *
     * Note: Use `CheckoutService#executeSpamCheck` instead.
     * You do not need to call this method before calling
     * `CheckoutService#executeSpamCheck`.
     *
     * With spam protection enabled, the customer has to be verified as
     * a human. The order creation will fail if spam protection
     * is enabled but verification fails.
     *
     * ```js
     * await service.initializeSpamProtection();
     * ```
     *
     * @param options - Options for initializing spam protection.
     * @returns A promise that resolves to the current state.
     * @deprecated - Use CheckoutService#executeSpamCheck instead.
     */
    initializeSpamProtection(options: SpamProtectionOptions): Promise<CheckoutSelectors> {
        const action = this._spamProtectionActionCreator.initialize(options);

        return this._dispatch(action, { queueId: 'spamProtection' });
    }

    /**
     * Verifies whether the current checkout is created by a human.
     *
     * Note: this method will do the initialization, therefore you do not
     * need to call `CheckoutService#initializeSpamProtection`
     * before calling this method.
     *
     * With spam protection enabled, the customer has to be verified as
     * a human. The order creation will fail if spam protection
     * is enabled but verification fails.
     *
     * ```js
     * await service.executeSpamCheck();
     * ```
     *
     * @returns A promise that resolves to the current state.
     */
    executeSpamCheck(): Promise<CheckoutSelectors> {
        const action = this._spamProtectionActionCreator.initialize();

        return this._dispatch(action, { queueId: 'spamProtection' })
            .then(() => {
                const action = this._spamProtectionActionCreator.execute();

                return this._dispatch(action, { queueId: 'spamProtection' });
            });
    }

    /**
     * Dispatches an action through the data store and returns the current state
     * once the action is dispatched.
     *
     * @param action - The action to dispatch.
     * @returns A promise that resolves to the current state.
     */
    private _dispatch(action: Action | Observable<Action> | ThunkAction<Action>, options?: { queueId?: string }): Promise<CheckoutSelectors> {
        return this._store.dispatch(action, options)
            .then(() => this.getState())
            .catch(error => {
                throw this._errorTransformer.transform(error);
            });
    }
}
