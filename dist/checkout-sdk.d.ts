import { createTimeout } from '@bigcommerce/request-sender';
import { Timeout } from '@bigcommerce/request-sender';

declare interface AmazonPayCustomerInitializeOptions {
    container: string;
    color?: string;
    size?: string;
    onError?(error: AmazonPayWidgetError | StandardError): void;
}

declare interface AmazonPayOrderReference {
    getAmazonBillingAgreementId(): string;
    getAmazonOrderReferenceId(): string;
}

declare interface AmazonPayPaymentInitializeOptions {
    container: string;
    onError?(error: AmazonPayWidgetError | StandardError): void;
    onPaymentSelect?(reference: AmazonPayOrderReference): void;
    onReady?(reference: AmazonPayOrderReference): void;
}

declare interface AmazonPayShippingInitializeOptions {
    container: string;
    onAddressSelect?(reference: AmazonPayOrderReference): void;
    onError?(error: AmazonPayWidgetError | StandardError): void;
    onReady?(): void;
}

declare interface AmazonPayWidgetError extends Error {
    getErrorCode(): string;
}

declare interface BraintreePaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;
}

declare interface BraintreeThreeDSecureOptions {
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement, cancel: () => Promise<BraintreeVerifyPayload> | undefined): void;
    removeFrame(): void;
}

declare interface BraintreeVerifyPayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    liabilityShiftPossible: boolean;
    liabilityShifted: boolean;
}

declare interface BraintreeVisaCheckoutCustomerInitializeOptions {
    container: string;
    onError?(error: Error): void;
}

declare interface BraintreeVisaCheckoutPaymentInitializeOptions {
    onError?(error: Error): void;
    onPaymentSelect?(): void;
}

declare interface CheckoutSelectors {
    checkout: CheckoutStoreSelector;
    errors: CheckoutStoreErrorSelector;
    statuses: CheckoutStoreStatusSelector;
}

/**
 * Responsible for completing the checkout process for the current customer.
 *
 * This object can be used to collect all information that is required for
 * checkout, such as shipping and billing information. It can also be used to
 * retrieve the current checkout state and subscribe to its changes.
 */
declare class CheckoutService {
    private _store;
    private _billingAddressActionCreator;
    private _cartActionCreator;
    private _configActionCreator;
    private _countryActionCreator;
    private _couponActionCreator;
    private _customerStrategyActionCreator;
    private _giftCertificateActionCreator;
    private _instrumentActionCreator;
    private _orderActionCreator;
    private _paymentMethodActionCreator;
    private _paymentStrategyActionCreator;
    private _quoteActionCreator;
    private _shippingCountryActionCreator;
    private _shippingOptionActionCreator;
    private _shippingStrategyActionCreator;
    private _state;
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
     * console.log(state.checkout.getOrder());
     * console.log(state.errors.getSubmitOrderError());
     * console.log(state.statuses.isSubmittingOrder());
     * ```
     *
     * @returns The current customer's checkout state
     */
    getState(): CheckoutSelectors;
    /**
     * Notifies all subscribers with the current state.
     *
     * When this method gets called, the subscribers get called regardless if
     * they have any filters applied.
     */
    notifyState(): void;
    /**
     * Subscribes to any changes to the current state.
     *
     * The method registers a callback function and executes it every time there
     * is a change in the checkout state.
     *
     * ```js
     * service.subscribe(state => {
     *     console.log(state.checkout.getCart());
     * });
     * ```
     *
     * The method can be configured to notify subscribers only regarding
     * relevant changes, by providing a filter function.
     *
     * ```js
     * const filter = state => state.checkout.getCart();
     *
     * // Only trigger the subscriber when the cart changes.
     * service.subscribe(state => {
     *     console.log(state.checkout.getCart())
     * }, filter);
     * ```
     *
     * @param subscriber - The function to subscribe to state changes.
     * @param filters - One or more functions to filter out irrelevant state
     * changes. If more than one function is provided, the subscriber will only
     * be triggered if all conditions are met.
     * @returns A function, if called, will unsubscribe the subscriber.
     */
    subscribe(subscriber: (state: CheckoutSelectors) => void, ...filters: Array<(state: CheckoutSelectors) => any>): () => void;
    /**
     * Loads the current checkout.
     *
     * This method can only be called if there is an active checkout. Also, it
     * can only retrieve data that belongs to the current customer. When it is
     * successfully executed, you can retrieve the data by calling
     * `CheckoutStoreSelector#getCheckout`.
     *
     * ```js
     * const state = await service.loadCheckout();
     *
     * console.log(state.checkout.getCheckout());
     * ```
     *
     * @param options - Options for loading the current checkout.
     * @returns A promise that resolves to the current state.
     */
    loadCheckout(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads the checkout configuration of a store.
     *
     * This method should be called before performing any other actions using
     * this service. If it is successfully executed, the data can be retrieved
     * by calling `CheckoutStoreSelector#getConfig`.
     *
     * ```js
     * const state = await service.loadConfig();
     *
     * console.log(state.checkout.getConfig());
     * ```
     *
     * @param options - Options for loading the checkout configuration.
     * @returns A promise that resolves to the current state.
     */
    loadConfig(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads the current cart.
     *
     * This method can only be called if there is an active cart. Also, it can
     * only retrieve data that belongs to the current customer.
     *
     * If the method is called successfully, you can retrieve the current cart
     * by calling `CheckoutStoreSelector#getCart`
     *
     * ```js
     * const state = await service.loadCart();
     *
     * console.log(state.checkout.getCart());
     * ```
     *
     * @param options - Options for loading the current cart.
     * @returns A promise that resolves to the current state.
     */
    loadCart(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads an order by an id.
     *
     * The method can only retrieve an order if the order belongs to the current
     * customer. If it is successfully executed, the data can be retrieved by
     * calling `CheckoutStoreSelector#getOrder`.
     *
     * ```js
     * const state = await service.loadOrder();
     *
     * console.log(state.checkout.getOrder());
     * ```
     *
     * @param orderId - The identifier of the order to load.
     * @param options - Options for loading the order.
     * @returns A promise that resolves to the current state.
     */
    loadOrder(orderId: number, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Submits an order, thereby completing a checkout process.
     *
     * Before you can submit an order, you must initialize the payment method
     * chosen by the customer by calling `CheckoutService#initializePayment`.
     *
     * ```js
     * await service.initializePayment({ methodId: 'braintree' });
     * await service.submitOrder({
     *     methodId: 'braintree',
     *     payment: {
     *         paymentData: {
     *             ccExpiry: { month: 10, year: 20 },
     *             ccName: 'BigCommerce',
     *             ccNumber: '4111111111111111',
     *             ccType: 'visa',
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
     * console.log(state.checkout.getOrder());
     * ```
     *
     * @param payload - The request payload to submit for the current order.
     * @param options - Options for submitting the current order.
     * @returns A promise that resolves to the current state.
     */
    submitOrder(payload: OrderRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
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
     * } catch (error) {
     *     if (error.type !== 'order_finalization_not_required') {
     *         return;
     *     }
     *
     *     throw error;
     * }
     *
     * window.location.assign('/order-confirmation');
     * ```
     *
     * @param options - Options for finalizing the current order.
     * @returns A promise that resolves to the current state.
     * @throws `OrderFinalizationNotRequiredError` error if order finalization
     * is not required for the current order at the time of execution.
     */
    finalizeOrderIfNeeded(options?: RequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getPaymentMethods());
     * ```
     *
     * @param options - Options for loading the payment methods that are
     * available to the current customer.
     * @returns A promise that resolves to the current state.
     */
    loadPaymentMethods(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a payment method by an id.
     *
     * This method does not work with multi-option payment providers. Due to its
     * limitation, it is deprecated and will be removed in the future.
     *
     * @deprecated
     * @param methodId - The identifier for the payment method to load.
     * @param options - Options for loading the payment method.
     * @returns A promise that resolves to the current state.
     */
    loadPaymentMethod(methodId: string, options?: RequestOptions): Promise<CheckoutSelectors>;
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
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
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
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Loads a list of countries available for billing.
     *
     * Once you make a successful request, you will be able to retrieve the list
     * of countries by calling `CheckoutStoreSelector#getBillingCountries`.
     *
     * ```js
     * const state = await service.loadBillingCountries();
     *
     * console.log(state.checkout.getBillingCountries());
     * ```
     *
     * @param options - Options for loading the available billing countries.
     * @returns A promise that resolves to the current state.
     */
    loadBillingCountries(options?: RequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getShippingCountries());
     * ```
     *
     * @param options - Options for loading the available shipping countries.
     * @returns A promise that resolves to the current state.
     */
    loadShippingCountries(options?: RequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getBillingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the billing address form fields.
     * @returns A promise that resolves to the current state.
     */
    loadBillingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getShippingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the shipping address form fields.
     * @returns A promise that resolves to the current state.
     */
    loadShippingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors>;
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
    initializeCustomer(options?: CustomerInitializeOptions): Promise<CheckoutSelectors>;
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
    deinitializeCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Signs into a customer's registered account.
     *
     * Once a customer is signed in successfully, the checkout state will be
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
     * console.log(state.checkout.getCustomer());
     * ```
     *
     * @param credentials - The credentials to be used for signing in the customer.
     * @param options - Options for signing in the customer.
     * @returns A promise that resolves to the current state.
     */
    signInCustomer(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getCustomer());
     * ```
     *
     * @param options - Options for signing out the customer.
     * @returns A promise that resolves to the current state.
     */
    signOutCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getShippingOptions());
     * ```
     *
     * @param options - Options for loading the available shipping options.
     * @returns A promise that resolves to the current state.
     */
    loadShippingOptions(options?: RequestOptions): Promise<CheckoutSelectors>;
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
    initializeShipping(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
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
    deinitializeShipping(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    /**
     * Selects a shipping option for a given address.
     *
     * If a shipping option has an additional cost, the quote for the current
     * order will be adjusted once the option is selected.
     *
     * ```js
     * const state = await service.selectShippingOption('address-id', 'shipping-option-id');
     *
     * console.log(state.checkout.getSelectedShippingOption());
     * ```
     *
     * @param addressId - The identifier of the address to be assigned with the
     * shipping option.
     * @param shippingOptionId - The identifier of the shipping option to
     * select.
     * @param options - Options for selecting the shipping option.
     * @returns A promise that resolves to the current state.
     */
    selectShippingOption(addressId: string, shippingOptionId: string, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getShippingAddress());
     * ```
     *
     * @param address - The address to be used for shipping.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    updateShippingAddress(address: InternalAddress, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getBillingAddress());
     * ```
     *
     * @param address - The address to be used for billing.
     * @param options - Options for updating the billing address.
     * @returns A promise that resolves to the current state.
     */
    updateBillingAddress(address: InternalAddress, options?: RequestOptions): Promise<CheckoutSelectors>;
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
    applyCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
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
    removeCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
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
    applyGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
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
    removeGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
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
     * console.log(state.checkout.getInstruments());
     * ```
     *
     * @returns A promise that resolves to the current state.
     */
    loadInstruments(): Promise<CheckoutSelectors>;
    /**
     * Deletes a payment instrument by an id.
     *
     * Once an instrument gets removed, it can no longer be retrieved using
     * `CheckoutStoreSelector#getInstruments`.
     *
     * ```js
     * const state = service.deleteInstrument('123');
     *
     * console.log(state.checkout.getInstruments());
     * ```
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns A promise that resolves to the current state.
     */
    deleteInstrument(instrumentId: string): Promise<CheckoutSelectors>;
}

declare interface CheckoutServiceOptions {
    locale?: string;
    shouldWarnMutation?: boolean;
}

declare interface CheckoutSettings {
    enableOrderComments: boolean;
    enableTermsAndConditions: boolean;
    guestCheckoutEnabled: boolean;
    isCardVaultingEnabled: boolean;
    isPaymentRequestEnabled: boolean;
    isPaymentRequestCanMakePaymentEnabled: boolean;
    orderTermsAndConditions: string;
    orderTermsAndConditionsLink: string;
    orderTermsAndConditionsType: string;
    shippingQuoteFailedMessage: string;
    realtimeShippingProviders: string[];
    remoteCheckoutProviders: any[];
}

/**
 * Responsible for getting the error of any asynchronous checkout action, if
 * there is any.
 *
 * This object has a set of getters that would return an error if an action is
 * not executed successfully. For example, if you are unable to submit an order,
 * you can use this object to retrieve the reason for the failure.
 */
declare class CheckoutStoreErrorSelector {
    private _billingAddress;
    private _cart;
    private _config;
    private _countries;
    private _coupons;
    private _customerStrategies;
    private _giftCertificates;
    private _instruments;
    private _order;
    private _paymentMethods;
    private _paymentStrategies;
    private _quote;
    private _shippingCountries;
    private _shippingOptions;
    private _shippingStrategies;
    /**
     * Gets the error of any checkout action that has failed.
     *
     * @returns The error object if unable to perform any checkout action,
     * otherwise undefined.
     */
    getError(): Error | undefined;
    /**
     * Returns an error if unable to load the current checkout.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCheckoutError(): Error | undefined;
    /**
     * Returns an error if unable to submit the current order.
     *
     * @returns The error object if unable to submit, otherwise undefined.
     */
    getSubmitOrderError(): Error | undefined;
    /**
     * Returns an error if unable to finalize the current order.
     *
     * @returns The error object if unable to finalize, otherwise undefined.
     */
    getFinalizeOrderError(): Error | undefined;
    /**
     * Returns an error if unable to load the current order.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadOrderError(): Error | undefined;
    /**
     * Returns an error if unable to load the current cart.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCartError(): Error | undefined;
    /**
     * Returns an error if unable to verify the current cart.
     *
     * This method is deprecated because cart verification is an internal
     * process, therefore should not be referred externally.
     *
     * @deprecated
     * @returns The error object if unable to verify, otherwise undefined.
     */
    getVerifyCartError(): Error | undefined;
    /**
     * Returns an error if unable to load billing countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadBillingCountriesError(): Error | undefined;
    /**
     * Returns an error if unable to load shipping countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingCountriesError(): Error | undefined;
    /**
     * Returns an error if unable to load payment methods.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodsError(): Error | undefined;
    /**
     * Returns an error if unable to load a specific payment method.
     *
     * @param methodId - The identifier of the payment method to load.
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to initialize a specific payment method.
     *
     * @param methodId - The identifier of the payment method to initialize.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializePaymentError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to sign in.
     *
     * @returns The error object if unable to sign in, otherwise undefined.
     */
    getSignInError(): Error | undefined;
    /**
     * Returns an error if unable to sign out.
     *
     * @returns The error object if unable to sign out, otherwise undefined.
     */
    getSignOutError(): Error | undefined;
    /**
     * Returns an error if unable to initialize the customer step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeCustomerError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to load shipping options.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingOptionsError(): Error | undefined;
    /**
     * Returns an error if unable to select a shipping option.
     *
     * @returns The error object if unable to select, otherwise undefined.
     */
    getSelectShippingOptionError(): Error | undefined;
    /**
     * Returns an error if unable to update a billing address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateBillingAddressError(): Error | undefined;
    /**
     * Returns an error if unable to update a shipping address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateShippingAddressError(): Error | undefined;
    /**
     * Returns an error if unable to initialize the shipping step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeShippingError(methodId?: string): Error | undefined;
    /**
     * Returns an error if unable to apply a coupon code.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyCouponError(): Error | undefined;
    /**
     * Returns an error if unable to remove a coupon code.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveCouponError(): Error | undefined;
    /**
     * Returns an error if unable to apply a gift certificate.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyGiftCertificateError(): Error | undefined;
    /**
     * Returns an error if unable to remove a gift certificate.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveGiftCertificateError(): Error | undefined;
    /**
     * Returns an error if unable to load payment instruments.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadInstrumentsError(): Error | undefined;
    /**
     * Returns an error if unable to delete a payment instrument.
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns The error object if unable to delete, otherwise undefined.
     */
    getDeleteInstrumentError(instrumentId?: string): Error | undefined;
    /**
     * Returns an error if unable to load the checkout configuration of a store.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadConfigError(): Error | undefined;
}

/**
 * Responsible for getting the state of the current checkout.
 *
 * This object has a set of methods that allow you to get a specific piece of
 * checkout information, such as shipping and billing details.
 */
declare class CheckoutStoreSelector {
    private _billingAddress;
    private _cart;
    private _config;
    private _countries;
    private _customer;
    private _form;
    private _instruments;
    private _order;
    private _paymentMethods;
    private _quote;
    private _shippingAddress;
    private _shippingCountries;
    private _shippingOptions;
    /**
     * Gets the current order.
     *
     * If the order is not submitted, the method returns the order as
     * incomplete. Otherwise, it returns the order as complete with an
     * identifier.
     *
     * @returns The current order if it is loaded, otherwise undefined.
     */
    getOrder(): InternalOrder | InternalIncompleteOrder | undefined;
    /**
     * Gets the current quote.
     *
     * @deprecated This method will be replaced in the future.
     * @returns The current quote if it is loaded, otherwise undefined.
     */
    getQuote(): InternalQuote | undefined;
    /**
     * Gets the checkout configuration of a store.
     *
     * @returns The configuration object if it is loaded, otherwise undefined.
     */
    getConfig(): StoreConfig | undefined;
    /**
     * Gets the shipping address of the current checkout.
     *
     * If the address is partially complete, it may not have shipping options
     * associated with it.
     *
     * @returns The shipping address object if it is loaded, otherwise
     * undefined.
     */
    getShippingAddress(): InternalAddress | undefined;
    /**
     * Gets a list of shipping options available for each shipping address.
     *
     * If there is no shipping address assigned to the current checkout, the
     * list of shipping options will be empty.
     *
     * @returns The list of shipping options per address if loaded, otherwise
     * undefined.
     */
    getShippingOptions(): InternalShippingOptionList | undefined;
    /**
     * Gets the selected shipping option for the current checkout.
     *
     * @returns The shipping option object if there is a selected option,
     * otherwise undefined.
     */
    getSelectedShippingOption(): InternalShippingOption | undefined;
    /**
     * Gets a list of countries available for shipping.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getShippingCountries(): Country[] | undefined;
    /**
     * Gets the billing address of an order.
     *
     * @returns The billing address object if it is loaded, otherwise undefined.
     */
    getBillingAddress(): InternalAddress | undefined;
    /**
     * Gets a list of countries available for billing.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getBillingCountries(): Country[] | undefined;
    /**
     * Gets a list of payment methods available for checkout.
     *
     * @returns The list of payment methods if it is loaded, otherwise undefined.
     */
    getPaymentMethods(): PaymentMethod[] | undefined;
    /**
     * Gets a payment method by an id.
     *
     * The method returns undefined if unable to find a payment method with the
     * specified id, either because it is not available for the customer, or it
     * is not loaded.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns The payment method object if loaded and available, otherwise,
     * undefined.
     */
    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined;
    /**
     * Gets the payment method that is selected for checkout.
     *
     * @returns The payment method object if there is a selected method;
     * undefined if otherwise.
     */
    getSelectedPaymentMethod(): PaymentMethod | undefined;
    /**
     * Gets the current cart.
     *
     * @returns The current cart object if it is loaded, otherwise undefined.
     */
    getCart(): InternalCart | undefined;
    /**
     * Gets the current customer.
     *
     * @returns The current customer object if it is loaded, otherwise
     * undefined.
     */
    getCustomer(): InternalCustomer | undefined;
    /**
     * Checks if payment data is required or not.
     *
     * If payment data is required, customers should be prompted to enter their
     * payment details.
     *
     * ```js
     * if (state.checkout.isPaymentDataRequired()) {
     *     // Render payment form
     * } else {
     *     // Render "Payment is not required for this order" message
     * }
     * ```
     *
     * @param useStoreCredit - If true, check whether payment data is required
     * with store credit applied; otherwise, check without store credit.
     * @returns True if payment data is required, otherwise false.
     */
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    /**
     * Checks if payment data is submitted or not.
     *
     * If payment data is already submitted using a payment method, customers
     * should not be prompted to enter their payment details again.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns True if payment data is submitted, otherwise false.
     */
    isPaymentDataSubmitted(methodId: string, gatewayId?: string): boolean;
    /**
     * Gets a list of payment instruments associated with the current customer.
     *
     * @returns The list of payment instruments if it is loaded, otherwise undefined.
     */
    getInstruments(): Instrument[] | undefined;
    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their billing address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of billing address form fields if it is loaded,
     * otherwise undefined.
     */
    getBillingAddressFields(countryCode: string): FormField[];
    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their shipping address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of shipping address form fields if it is loaded,
     * otherwise undefined.
     */
    getShippingAddressFields(countryCode: string): FormField[];
}

/**
 * Responsible for checking the statuses of various asynchronous actions related
 * to checkout.
 *
 * This object has a set of getters that return true if an action is in
 * progress. For example, you can check whether a customer is submitting an
 * order and waiting for the request to complete.
 */
declare class CheckoutStoreStatusSelector {
    private _billingAddress;
    private _cart;
    private _config;
    private _countries;
    private _coupons;
    private _customerStrategies;
    private _giftCertificates;
    private _instruments;
    private _order;
    private _paymentMethods;
    private _paymentStrategies;
    private _quote;
    private _shippingCountries;
    private _shippingOptions;
    private _shippingStrategies;
    /**
     * Checks whether any checkout action is pending.
     *
     * @returns True if there is a pending action, otherwise false.
     */
    isPending(): boolean;
    /**
     * Checks whether the current checkout is loading.
     *
     * @returns True if the current checkout is loading, otherwise false.
     */
    isLoadingCheckout(): boolean;
    /**
     * Checks whether the current order is submitting.
     *
     * @returns True if the current order is submitting, otherwise false.
     */
    isSubmittingOrder(): boolean;
    /**
     * Checks whether the current order is finalizing.
     *
     * @returns True if the current order is finalizing, otherwise false.
     */
    isFinalizingOrder(): boolean;
    /**
     * Checks whether the current order is loading.
     *
     * @returns True if the current order is loading, otherwise false.
     */
    isLoadingOrder(): boolean;
    /**
     * Checks whether the current cart is loading.
     *
     * @returns True if the current cart is loading, otherwise false.
     */
    isLoadingCart(): boolean;
    /**
     * Checks whether the current cart is verifying.
     *
     * This method is deprecated because cart verification is an internal
     * process, therefore should not be referred externally.
     *
     * @deprecated
     * @returns True if the current cart is verifying, otherwise false.
     */
    isVerifyingCart(): boolean;
    /**
     * Checks whether billing countries are loading.
     *
     * @returns True if billing countries are loading, otherwise false.
     */
    isLoadingBillingCountries(): boolean;
    /**
     * Checks whether shipping countries are loading.
     *
     * @returns True if shipping countries are loading, otherwise false.
     */
    isLoadingShippingCountries(): boolean;
    /**
     * Checks whether payment methods are loading.
     *
     * @returns True if payment methods are loading, otherwise false.
     */
    isLoadingPaymentMethods(): boolean;
    /**
     * Checks whether a specific or any payment method is loading.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is loading.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is loading, otherwise false.
     */
    isLoadingPaymentMethod(methodId?: string): boolean;
    /**
     * Checks whether a specific or any payment method is initializing.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is initializing.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is initializing, otherwise false.
     */
    isInitializingPayment(methodId?: string): boolean;
    /**
     * Checks whether the current customer is signing in.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing in using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing in the
     * current customer.
     * @returns True if the customer is signing in, otherwise false.
     */
    isSigningIn(methodId?: string): boolean;
    /**
     * Checks whether the current customer is signing out.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing out using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing out the
     * current customer.
     * @returns True if the customer is signing out, otherwise false.
     */
    isSigningOut(methodId?: string): boolean;
    /**
     * Checks whether the customer step is initializing.
     *
     * If an ID is provided, the method also checks whether the customer step is
     * initializing using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for initializing the
     * customer step of checkout.
     * @returns True if the customer step is initializing, otherwise false.
     */
    isInitializingCustomer(methodId?: string): boolean;
    /**
     * Checks whether shipping options are loading.
     *
     * @returns True if shipping options are loading, otherwise false.
     */
    isLoadingShippingOptions(): boolean;
    /**
     * Checks whether the current customer is selecting a shipping option.
     *
     * @returns True if selecting a shipping option, otherwise false.
     */
    isSelectingShippingOption(): boolean;
    /**
     * Checks whether the current customer is updating their billing address.
     *
     * @returns True if updating their billing address, otherwise false.
     */
    isUpdatingBillingAddress(): boolean;
    /**
     * Checks whether the current customer is updating their shipping address.
     *
     * @returns True if updating their shipping address, otherwise false.
     */
    isUpdatingShippingAddress(): boolean;
    /**
     * Checks whether the shipping step of a checkout process is initializing.
     *
     * If an identifier is provided, the method also checks whether the shipping
     * step is initializing using a specific shipping method with the same
     * identifier.
     *
     * @param methodId - The identifer of the initialization method to check.
     * @returns True if the shipping step is initializing, otherwise false.
     */
    isInitializingShipping(methodId?: string): boolean;
    /**
     * Checks whether the current customer is applying a coupon code.
     *
     * @returns True if applying a coupon code, otherwise false.
     */
    isApplyingCoupon(): boolean;
    /**
     * Checks whether the current customer is removing a coupon code.
     *
     * @returns True if removing a coupon code, otherwise false.
     */
    isRemovingCoupon(): boolean;
    /**
     * Checks whether the current customer is applying a gift certificate.
     *
     * @returns True if applying a gift certificate, otherwise false.
     */
    isApplyingGiftCertificate(): boolean;
    /**
     * Checks whether the current customer is removing a gift certificate.
     *
     * @returns True if removing a gift certificate, otherwise false.
     */
    isRemovingGiftCertificate(): boolean;
    /**
     * Checks whether the current customer's payment instruments are loading.
     *
     * @returns True if payment instruments are loading, otherwise false.
     */
    isLoadingInstruments(): boolean;
    /**
     * Checks whether the current customer is deleting a payment instrument.
     *
     * @returns True if deleting a payment instrument, otherwise false.
     */
    isDeletingInstrument(instrumentId?: string): boolean;
    /**
     * Checks whether the checkout configuration of a store is loading.
     *
     * @returns True if the configuration is loading, otherwise false.
     */
    isLoadingConfig(): boolean;
    /**
     * Checks whether the customer step of a checkout is in a pending state.
     *
     * The customer step is considered to be pending if it is in the process of
     * initializing, signing in, signing out, and/or interacting with a customer
     * widget.
     *
     * @returns True if the customer step is pending, otherwise false.
     */
    isCustomerStepPending(): boolean;
    /**
     * Checks whether the payment step of a checkout is in a pending state.
     *
     * The payment step is considered to be pending if it is in the process of
     * initializing, submitting an order, finalizing an order, and/or
     * interacting with a payment widget.
     *
     * @returns True if the payment step is pending, otherwise false.
     */
    isPaymentStepPending(): boolean;
}

declare interface Country {
    code: string;
    name: string;
    hasPostalCodes: boolean;
    subdivisions: Region[];
}

/**
 * Creates an instance of `CheckoutService`.
 *
 * ```js
 * const service = createCheckoutService();
 *
 * service.subscribe(state => {
 *     console.log(state);
 * });
 *
 * service.loadCheckout();
 * ```
 *
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutService`.
 */
export declare function createCheckoutService(options?: CheckoutServiceOptions): CheckoutService;

/**
 * Creates an instance of `LanguageService`.
 *
 * ```js
 * const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
 * const service = createLanguageService(language);
 *
 * console.log(service.translate('address.city_label'));
 * ```
 *
 * @param config - A configuration object.
 * @returns An instance of `LanguageService`.
 */
export declare function createLanguageService(config?: Partial<LanguageConfig>): LanguageService;

declare interface CreditCardInstrument {
    ccExpiry: {
        month: string;
        year: string;
    };
    ccName: string;
    ccNumber: string;
    ccType: string;
    ccCvv?: string;
    shouldSaveInstrument?: boolean;
    extraData?: any;
}

declare interface Currency {
    code: string;
    decimalPlaces: string;
    decimalSeparator: string;
    symbolLocation: string;
    symbol: string;
    thousandsSeparator: string;
}

declare interface CustomerCredentials {
    email: string;
    password?: string;
}

declare interface CustomerInitializeOptions extends CustomerRequestOptions {
    amazon?: AmazonPayCustomerInitializeOptions;
    braintreevisacheckout?: BraintreeVisaCheckoutCustomerInitializeOptions;
}

declare interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

declare interface DiscountNotification {
    message: string;
    messageHtml: string;
    type: string;
}

declare interface FormField {
    id: string;
    name: string;
    custom: boolean;
    label: string;
    required: boolean;
    default?: string;
    type?: string;
    fieldType?: string;
    itemtype?: string;
    options?: FormFieldOptions;
}

declare interface FormFieldItem {
    value: string;
    label: string;
}

declare interface FormFieldOptions {
    helperLabel?: string;
    items: FormFieldItem[];
}

declare interface FormFields {
    shippingAddressFields: FormField[];
    billingAddressFields: FormField[];
}

declare interface Instrument {
    bigpay_token: string;
    provider: string;
    iin: string;
    last_4: string;
    expiry_month: string;
    expiry_year: string;
    brand: string;
    default_instrument: boolean;
    trusted_shipping_address: boolean;
}

declare interface InternalAddress {
    id: string;
    firstName: string;
    lastName: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    provinceCode: string;
    postCode: string;
    country: string;
    countryCode: string;
    phone: string;
    type: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string;
    }>;
}

declare interface InternalCart {
    id: string;
    items: InternalLineItem[];
    currency: string;
    subtotal: {
        amount: number;
        integerAmount: number;
    };
    coupon: {
        discountedAmount: number;
        coupons: InternalCoupon[];
    };
    discount: {
        amount: number;
        integerAmount: number;
    };
    discountNotifications: DiscountNotification[];
    giftCertificate: {
        totalDiscountedAmount: number;
        appliedGiftCertificates: InternalGiftCertificate[];
    };
    shipping: {
        amount: number;
        integerAmount: number;
        amountBeforeDiscount: number;
        integerAmountBeforeDiscount: number;
        required: boolean;
    };
    storeCredit: {
        amount: number;
    };
    taxSubtotal: {
        amount: number;
        integerAmount: number;
    };
    taxes: Array<{
        name: string;
        amount: number;
    }>;
    taxTotal: {
        amount: number;
        integerAmount: number;
    };
    handling: {
        amount: number;
        integerAmount: number;
    };
    grandTotal: {
        amount: number;
        integerAmount: number;
    };
}

declare interface InternalCoupon {
    code: string;
    discount: string;
    discountType: number;
    name: string;
}

declare interface InternalCustomer {
    addresses: InternalAddress[];
    customerId: number;
    customerGroupId: number;
    customerGroupName: string;
    isGuest: boolean;
    phoneNumber: string;
    storeCredit: number;
    email: string;
    firstName: string;
    name: string;
    remote?: {
        customerMessage?: string;
        provider: string;
        useStoreCredit?: boolean;
    };
}

declare interface InternalGiftCertificate {
    code: string;
    discountedAmount: number;
    remainingBalance: number;
    giftCertificate?: {
        balance: number;
        code: string;
        purchaseDate: string;
    };
}

declare interface InternalIncompleteOrder {
    orderId: number;
    token: string;
    payment: {
        id?: string;
        gateway?: string;
        redirectUrl?: string;
        returnUrl?: string;
        status?: string;
        helpText?: string;
    };
    socialData: {
        [key: string]: {
            name: string;
            description: string;
            image: string;
            url: string;
            shareText: string;
            sharingLink: string;
        };
    };
    status: string;
    customerCreated: boolean;
    hasDigitalItems: boolean;
    isDownloadable: boolean;
    isComplete: boolean;
    callbackUrl: string;
}

declare interface InternalLineItem {
    amount: number;
    amountAfterDiscount: number;
    attributes: Array<{
        name: string;
        value: string;
    }>;
    discount: number;
    id: string;
    imageUrl: string;
    integerAmount: number;
    integerAmountAfterDiscount: number;
    integerDiscount: number;
    integerTax: number;
    name: string;
    quantity: number;
    tax: number;
    type: string;
    variantId: number;
}

declare interface InternalOrder extends InternalIncompleteOrder {
    id: number;
    items: InternalLineItem[];
    currency: string;
    customerCanBeCreated: boolean;
    subtotal: {
        amount: number;
        integerAmount: number;
    };
    coupon: {
        discountedAmount: number;
        coupons: InternalCoupon[];
    };
    discount: {
        amount: number;
        integerAmount: number;
    };
    discountNotifications: Array<{
        message: string;
        messageHtml: string;
        type: string;
    }>;
    giftCertificate: {
        totalDiscountedAmount: number;
        appliedGiftCertificates: InternalGiftCertificate[];
    };
    shipping: {
        amount: number;
        integerAmount: number;
        amountBeforeDiscount: number;
        integerAmountBeforeDiscount: number;
        required: boolean;
    };
    storeCredit: {
        amount: number;
    };
    taxSubtotal: {
        amount: number;
        integerAmount: number;
    };
    taxes: Array<{
        name: string;
        amount: number;
    }>;
    taxTotal: {
        amount: number;
        integerAmount: number;
    };
    handling: {
        amount: number;
        integerAmount: number;
    };
    grandTotal: {
        amount: number;
        integerAmount: number;
    };
}

declare interface InternalQuote {
    orderComment: string;
    shippingOption: string;
    billingAddress: InternalAddress;
    shippingAddress: InternalAddress;
}

declare interface InternalShippingOption {
    description: string;
    module: string;
    method: number;
    price: number;
    formattedPrice: string;
    id: string;
    selected: boolean;
    isRecommended: boolean;
    imageUrl: string;
    transitTime: string;
}

declare interface InternalShippingOptionList {
    [key: string]: InternalShippingOption[];
}

declare interface KlarnaLoadResponse {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaPaymentInitializeOptions {
    container: string;
    onLoad?(response: KlarnaLoadResponse): void;
}

declare interface LanguageConfig {
    defaultTranslations: Translations;
    locale: string;
    locales: Locales;
    translations: Translations;
}

/**
 * Responsible for getting language strings.
 *
 * This object can be used to retrieve language strings that are most
 * appropriate for a given locale.
 *
 * The language strings provided to the object should follow [ICU
 * MessageFormat](http://userguide.icu-project.org/formatparse/messages) syntax.
 */
declare class LanguageService {
    private _logger;
    private _locale;
    private _locales;
    private _translations;
    private _formatters;
    /**
     * Remaps a set of language strings with a different set of keys.
     *
     * ```js
     * service.mapKeys({
     *     'new_key': 'existing_key',
     * });
     *
     * console.log(service.translate('new_key'));
     * ```
     *
     * @param maps - The set of language strings.
     */
    mapKeys(maps: {
        [key: string]: string;
    }): void;
    /**
     * Gets the preferred locale of the current customer.
     *
     * @returns The preferred locale code.
     */
    getLocale(): string;
    /**
     * Gets a language string by a key.
     *
     * ```js
     * service.translate('language_key');
     * ```
     *
     * If the language string contains a placeholder, you can replace it by
     * providing a second argument.
     *
     * ```js
     * service.translate('language_key', { placeholder: 'Hello' });
     * ```
     *
     * @param key - The language key.
     * @param data - Data for replacing placeholders in the language string.
     * @returns The translated language string.
     */
    translate(key: string, data?: TranslationData): string;
    private _transformConfig(config?);
    private _flattenObject(object, result?, parentKey?);
    private _transformData(data);
    private _hasTranslations();
}

declare interface Locales {
    [key: string]: string;
}

declare interface OrderPaymentRequestBody {
    methodId: string;
    gatewayId?: string;
    paymentData?: CreditCardInstrument | VaultedInstrument;
}

declare interface OrderRequestBody {
    payment?: OrderPaymentRequestBody;
    useStoreCredit?: boolean;
    customerMessage?: string;
}

declare interface PasswordRequirements {
    alpha: string;
    numeric: string;
    minlength: number;
    error: string;
}

declare interface PaymentInitializeOptions extends PaymentRequestOptions {
    amazon?: AmazonPayPaymentInitializeOptions;
    braintree?: BraintreePaymentInitializeOptions;
    braintreevisacheckout?: BraintreeVisaCheckoutPaymentInitializeOptions;
    klarna?: KlarnaPaymentInitializeOptions;
    square?: SquarePaymentInitializeOptions;
}

declare interface PaymentMethod {
    id: string;
    config: PaymentMethodConfig;
    method: string;
    supportedCards: string[];
    type: string;
    clientToken?: string;
    gateway?: string;
    logoUrl?: string;
    nonce?: string;
    initializationData?: any;
    returnUrl?: string;
}

declare interface PaymentMethodConfig {
    cardCode?: boolean;
    displayName?: string;
    is3dsEnabled?: boolean;
    merchantId?: string;
    redirectUrl?: string;
    testMode?: boolean;
}

declare interface PaymentRequestOptions extends RequestOptions {
    methodId: string;
    gatewayId?: string;
}

declare interface PaymentSettings {
    bigpayBaseUrl: string;
    clientSidePaymentProviders: string[];
}

declare interface Region {
    code: string;
    name: string;
}

declare interface RequestOptions {
    timeout?: Timeout;
}

declare interface ShippingInitializeOptions extends ShippingRequestOptions {
    amazon?: AmazonPayShippingInitializeOptions;
}

declare interface ShippingRequestOptions extends RequestOptions {
    methodId?: string;
}

declare interface ShopperConfig {
    defaultNewsletterSignup: boolean;
    passwordRequirements: PasswordRequirements;
    showNewsletterSignup: boolean;
}

declare interface ShopperCurrency {
    code: string;
    symbolLocation: string;
    symbol: string;
    decimalPlaces: string;
    decimalSeparator: string;
    thousandsSeparator: string;
    exchangeRate: string;
}

declare interface SquareFormElement {
    elementId: string;
    placeholder?: string;
}

declare interface SquarePaymentInitializeOptions {
    cardNumber: SquareFormElement;
    cvv: SquareFormElement;
    expirationDate: SquareFormElement;
    postalCode: SquareFormElement;
    inputClass?: string;
    inputStyles?: Array<{
        [key: string]: string;
    }>;
}

declare class StandardError extends Error {
    protected type: string;
    constructor(message?: string);
}

declare interface StoreConfig {
    cdnPath: string;
    checkoutSettings: CheckoutSettings;
    currency: Currency;
    formFields: FormFields;
    links: StoreLinks;
    paymentSettings: PaymentSettings;
    shopperConfig: ShopperConfig;
    storeProfile: StoreProfile;
    imageDirectory: string;
    isAngularDebuggingEnabled: boolean;
    shopperCurrency: ShopperCurrency;
}

declare interface StoreLinks {
    cartLink: string;
    checkoutLink: string;
    orderConfirmationLink: string;
}

declare interface StoreProfile {
    orderEmail: string;
    shopPath: string;
    storeCountry: string;
    storeHash: string;
    storeId: string;
    storeName: string;
    storePhoneNumber: string;
    storeLanguage: string;
}

declare interface TranslationData {
    [key: string]: string | number;
}

declare interface Translations {
    [key: string]: string | Translations;
}

declare interface VaultedInstrument {
    instrumentId: string;
    cvv?: number;
}
