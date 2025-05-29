@bigcommerce/checkout-sdk

# @bigcommerce/checkout-sdk

## Table of contents

### Enumerations

- [AdyenCardFields](enums/AdyenCardFields.md)
- [BraintreeFormFieldType](enums/BraintreeFormFieldType.md)
- [CheckoutButtonMethodType](enums/CheckoutButtonMethodType.md)
- [CheckoutIncludes](enums/CheckoutIncludes.md)
- [EmbeddedCheckoutEventType](enums/EmbeddedCheckoutEventType.md)
- [ExtensionCommandType](enums/ExtensionCommandType.md)
- [ExtensionEventType](enums/ExtensionEventType.md)
- [ExtensionMessageType](enums/ExtensionMessageType.md)
- [ExtensionQueryType](enums/ExtensionQueryType.md)
- [ExtensionRegion](enums/ExtensionRegion.md)
- [GooglePayKey](enums/GooglePayKey.md)
- [HostedFieldEventType](enums/HostedFieldEventType.md)
- [HostedFieldType](enums/HostedFieldType.md)
- [HostedInputEventType](enums/HostedInputEventType.md)
- [IconStyle](enums/IconStyle.md)
- [PaypalButtonStyleColorOption](enums/PaypalButtonStyleColorOption.md)
- [PaypalButtonStyleLabelOption](enums/PaypalButtonStyleLabelOption.md)
- [PaypalButtonStyleLayoutOption](enums/PaypalButtonStyleLayoutOption.md)
- [PaypalButtonStyleShapeOption](enums/PaypalButtonStyleShapeOption.md)
- [PaypalButtonStyleSizeOption](enums/PaypalButtonStyleSizeOption.md)
- [RadiusUnit](enums/RadiusUnit.md)
- [StyleButtonColor](enums/StyleButtonColor.md)
- [StyleButtonColor_2](enums/StyleButtonColor_2.md)
- [StyleButtonLabel](enums/StyleButtonLabel.md)
- [StyleButtonLabel_2](enums/StyleButtonLabel_2.md)
- [StyleButtonShape](enums/StyleButtonShape.md)
- [StyleButtonShape_2](enums/StyleButtonShape_2.md)
- [StyleButtonShape_3](enums/StyleButtonShape_3.md)
- [StyleButtonSize](enums/StyleButtonSize.md)
- [UntrustedShippingCardVerificationType](enums/UntrustedShippingCardVerificationType.md)

### Classes

- [CartChangedError](classes/CartChangedError.md)
- [CartConsistencyError](classes/CartConsistencyError.md)
- [CheckoutButtonErrorSelector](classes/CheckoutButtonErrorSelector.md)
- [CheckoutButtonInitializer](classes/CheckoutButtonInitializer.md)
- [CheckoutButtonStatusSelector](classes/CheckoutButtonStatusSelector.md)
- [CheckoutService](classes/CheckoutService.md)
- [CurrencyService](classes/CurrencyService.md)
- [DetachmentObserver](classes/DetachmentObserver.md)
- [EmbeddedCheckout](classes/EmbeddedCheckout.md)
- [GoogleRecaptcha](classes/GoogleRecaptcha.md)
- [GoogleRecaptchaScriptLoader](classes/GoogleRecaptchaScriptLoader.md)
- [HostedField](classes/HostedField.md)
- [HostedForm](classes/HostedForm.md)
- [HostedFormFactory](classes/HostedFormFactory.md)
- [HostedFormOrderDataTransformer](classes/HostedFormOrderDataTransformer.md)
- [IframeEventListener](classes/IframeEventListener.md)
- [IframeEventPoster](classes/IframeEventPoster.md)
- [LanguageService](classes/LanguageService.md)
- [MutationObserverFactory](classes/MutationObserverFactory.md)
- [PaymentHumanVerificationHandler](classes/PaymentHumanVerificationHandler.md)
- [RequestError](classes/RequestError.md)
- [StandardError](classes/StandardError.md)
- [StoredCardHostedFormService](classes/StoredCardHostedFormService.md)

### Interfaces

- [AchInstrument](interfaces/AchInstrument.md)
- [Address](interfaces/Address.md)
- [AddressRequestBody](interfaces/AddressRequestBody.md)
- [AdyenAdditionalActionCallbacks](interfaces/AdyenAdditionalActionCallbacks.md)
- [AdyenAdditionalActionOptions](interfaces/AdyenAdditionalActionOptions.md)
- [AdyenBaseCardComponentOptions](interfaces/AdyenBaseCardComponentOptions.md)
- [AdyenComponent](interfaces/AdyenComponent.md)
- [AdyenComponentEvents](interfaces/AdyenComponentEvents.md)
- [AdyenComponentState](interfaces/AdyenComponentState.md)
- [AdyenCreditCardComponentOptions](interfaces/AdyenCreditCardComponentOptions.md)
- [AdyenIdealComponentOptions](interfaces/AdyenIdealComponentOptions.md)
- [AdyenPaymentMethodState](interfaces/AdyenPaymentMethodState.md)
- [AdyenPlaceholderData](interfaces/AdyenPlaceholderData.md)
- [AdyenThreeDS2Options](interfaces/AdyenThreeDS2Options.md)
- [AdyenV2PaymentInitializeOptions](interfaces/AdyenV2PaymentInitializeOptions.md)
- [AdyenV3PaymentInitializeOptions](interfaces/AdyenV3PaymentInitializeOptions.md)
- [AdyenValidationState](interfaces/AdyenValidationState.md)
- [AmazonPayRemoteCheckout](interfaces/AmazonPayRemoteCheckout.md)
- [AmazonPayV2CustomerInitializeOptions](interfaces/AmazonPayV2CustomerInitializeOptions.md)
- [AmazonPayV2PaymentInitializeOptions](interfaces/AmazonPayV2PaymentInitializeOptions.md)
- [AmazonPayV2ShippingInitializeOptions](interfaces/AmazonPayV2ShippingInitializeOptions.md)
- [ApplePayButtonInitializeOptions](interfaces/ApplePayButtonInitializeOptions.md)
- [ApplePayCustomerInitializeOptions](interfaces/ApplePayCustomerInitializeOptions.md)
- [ApplePayPaymentInitializeOptions](interfaces/ApplePayPaymentInitializeOptions.md)
- [BankInstrument](interfaces/BankInstrument.md)
- [Banner](interfaces/Banner.md)
- [BaseAccountInstrument](interfaces/BaseAccountInstrument.md)
- [BaseCheckoutButtonInitializeOptions](interfaces/BaseCheckoutButtonInitializeOptions.md)
- [BaseCustomerInitializeOptions](interfaces/BaseCustomerInitializeOptions.md)
- [BaseElementOptions](interfaces/BaseElementOptions.md)
- [BaseElementOptions_2](interfaces/BaseElementOptions_2.md)
- [BaseIndividualElementOptions](interfaces/BaseIndividualElementOptions.md)
- [BaseInstrument](interfaces/BaseInstrument.md)
- [BasePaymentInitializeOptions](interfaces/BasePaymentInitializeOptions.md)
- [BigCommercePaymentsAlternativeMethodsButtonInitializeOptions](interfaces/BigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md)
- [BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions](interfaces/BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md)
- [BigCommercePaymentsCreditCardsPaymentInitializeOptions](interfaces/BigCommercePaymentsCreditCardsPaymentInitializeOptions.md)
- [BigCommercePaymentsFastlaneCustomerInitializeOptions](interfaces/BigCommercePaymentsFastlaneCustomerInitializeOptions.md)
- [BigCommercePaymentsFastlanePaymentInitializeOptions](interfaces/BigCommercePaymentsFastlanePaymentInitializeOptions.md)
- [BigCommercePaymentsFieldsStyleOptions](interfaces/BigCommercePaymentsFieldsStyleOptions.md)
- [BigCommercePaymentsPayLaterButtonInitializeOptions](interfaces/BigCommercePaymentsPayLaterButtonInitializeOptions.md)
- [BigCommercePaymentsPayLaterCustomerInitializeOptions](interfaces/BigCommercePaymentsPayLaterCustomerInitializeOptions.md)
- [BigCommercePaymentsPayLaterPaymentInitializeOptions](interfaces/BigCommercePaymentsPayLaterPaymentInitializeOptions.md)
- [BigCommercePaymentsPayPalButtonInitializeOptions](interfaces/BigCommercePaymentsPayPalButtonInitializeOptions.md)
- [BigCommercePaymentsPayPalCustomerInitializeOptions](interfaces/BigCommercePaymentsPayPalCustomerInitializeOptions.md)
- [BigCommercePaymentsPayPalPaymentInitializeOptions](interfaces/BigCommercePaymentsPayPalPaymentInitializeOptions.md)
- [BigCommercePaymentsRatePayPaymentInitializeOptions](interfaces/BigCommercePaymentsRatePayPaymentInitializeOptions.md)
- [BigCommercePaymentsVenmoButtonInitializeOptions](interfaces/BigCommercePaymentsVenmoButtonInitializeOptions.md)
- [BigCommercePaymentsVenmoCustomerInitializeOptions](interfaces/BigCommercePaymentsVenmoCustomerInitializeOptions.md)
- [BigCommercePaymentsVenmoPaymentInitializeOptions](interfaces/BigCommercePaymentsVenmoPaymentInitializeOptions.md)
- [BillingAddress](interfaces/BillingAddress.md)
- [BillingAddressRequestBody](interfaces/BillingAddressRequestBody.md)
- [BillingAddressSelector](interfaces/BillingAddressSelector.md)
- [BirthDate](interfaces/BirthDate.md)
- [BirthDate_2](interfaces/BirthDate_2.md)
- [BlockElementStyles](interfaces/BlockElementStyles.md)
- [BlueSnapDirectAPMInitializeOptions](interfaces/BlueSnapDirectAPMInitializeOptions.md)
- [BlueSnapDirectStyleProps](interfaces/BlueSnapDirectStyleProps.md)
- [BlueSnapV2PaymentInitializeOptions](interfaces/BlueSnapV2PaymentInitializeOptions.md)
- [BlueSnapV2StyleProps](interfaces/BlueSnapV2StyleProps.md)
- [BodlEventsPayload](interfaces/BodlEventsPayload.md)
- [BodlService](interfaces/BodlService.md)
- [BodyStyles](interfaces/BodyStyles.md)
- [BoletoDataPaymentMethodState](interfaces/BoletoDataPaymentMethodState.md)
- [BoletoState](interfaces/BoletoState.md)
- [BoltButtonInitializeOptions](interfaces/BoltButtonInitializeOptions.md)
- [BoltButtonStyleOptions](interfaces/BoltButtonStyleOptions.md)
- [BoltBuyNowInitializeOptions](interfaces/BoltBuyNowInitializeOptions.md)
- [BoltCustomerInitializeOptions](interfaces/BoltCustomerInitializeOptions.md)
- [BoltPaymentInitializeOptions](interfaces/BoltPaymentInitializeOptions.md)
- [BraintreeAchInitializeOptions](interfaces/BraintreeAchInitializeOptions.md)
- [BraintreeAnalyticTrackerService](interfaces/BraintreeAnalyticTrackerService.md)
- [BraintreeFastlaneCustomerInitializeOptions](interfaces/BraintreeFastlaneCustomerInitializeOptions.md)
- [BraintreeFastlanePaymentInitializeOptions](interfaces/BraintreeFastlanePaymentInitializeOptions.md)
- [BraintreeFastlaneShippingInitializeOptions](interfaces/BraintreeFastlaneShippingInitializeOptions.md)
- [BraintreeFormFieldCardTypeChangeEventData](interfaces/BraintreeFormFieldCardTypeChangeEventData.md)
- [BraintreeFormFieldKeyboardEventData](interfaces/BraintreeFormFieldKeyboardEventData.md)
- [BraintreeFormFieldOptions](interfaces/BraintreeFormFieldOptions.md)
- [BraintreeFormFieldState](interfaces/BraintreeFormFieldState.md)
- [BraintreeFormFieldStylesMap](interfaces/BraintreeFormFieldStylesMap.md)
- [BraintreeFormFieldValidateErrorData](interfaces/BraintreeFormFieldValidateErrorData.md)
- [BraintreeFormFieldValidateEventData](interfaces/BraintreeFormFieldValidateEventData.md)
- [BraintreeFormFieldsMap](interfaces/BraintreeFormFieldsMap.md)
- [BraintreeFormOptions](interfaces/BraintreeFormOptions.md)
- [BraintreeLocalMethodsPaymentInitializeOptions](interfaces/BraintreeLocalMethodsPaymentInitializeOptions.md)
- [BraintreePaymentInitializeOptions](interfaces/BraintreePaymentInitializeOptions.md)
- [BraintreePaypalButtonInitializeOptions](interfaces/BraintreePaypalButtonInitializeOptions.md)
- [BraintreePaypalCreditButtonInitializeOptions](interfaces/BraintreePaypalCreditButtonInitializeOptions.md)
- [BraintreePaypalCreditCustomerInitializeOptions](interfaces/BraintreePaypalCreditCustomerInitializeOptions.md)
- [BraintreePaypalCustomerInitializeOptions](interfaces/BraintreePaypalCustomerInitializeOptions.md)
- [BraintreeStoredCardFieldOptions](interfaces/BraintreeStoredCardFieldOptions.md)
- [BraintreeStoredCardFieldsMap](interfaces/BraintreeStoredCardFieldsMap.md)
- [BraintreeThreeDSecureOptions](interfaces/BraintreeThreeDSecureOptions.md)
- [BraintreeVerifyPayload](interfaces/BraintreeVerifyPayload.md)
- [BraintreeVisaCheckoutPaymentInitializeOptions](interfaces/BraintreeVisaCheckoutPaymentInitializeOptions.md)
- [BrowserInfo](interfaces/BrowserInfo.md)
- [ButtonResponse](interfaces/ButtonResponse.md)
- [ButtonStyles](interfaces/ButtonStyles.md)
- [CardCvcElementOptions](interfaces/CardCvcElementOptions.md)
- [CardDataPaymentMethodState](interfaces/CardDataPaymentMethodState.md)
- [CardElementOptions](interfaces/CardElementOptions.md)
- [CardExpiryElementOptions](interfaces/CardExpiryElementOptions.md)
- [CardInstrument](interfaces/CardInstrument.md)
- [CardNumberElementOptions](interfaces/CardNumberElementOptions.md)
- [CardPaymentMethodState](interfaces/CardPaymentMethodState.md)
- [CardState](interfaces/CardState.md)
- [CardStateData](interfaces/CardStateData.md)
- [CardStateErrors](interfaces/CardStateErrors.md)
- [CardingProtectionActionData](interfaces/CardingProtectionActionData.md)
- [Cart](interfaces/Cart.md)
- [CartSelector](interfaces/CartSelector.md)
- [CheckableInputStyles](interfaces/CheckableInputStyles.md)
- [ChecklistStyles](interfaces/ChecklistStyles.md)
- [Checkout](interfaces/Checkout.md)
- [CheckoutButtonDataState](interfaces/CheckoutButtonDataState.md)
- [CheckoutButtonErrorsState](interfaces/CheckoutButtonErrorsState.md)
- [CheckoutButtonInitializerOptions](interfaces/CheckoutButtonInitializerOptions.md)
- [CheckoutButtonOptions](interfaces/CheckoutButtonOptions.md)
- [CheckoutButtonSelector](interfaces/CheckoutButtonSelector.md)
- [CheckoutButtonSelectors](interfaces/CheckoutButtonSelectors.md)
- [CheckoutButtonState](interfaces/CheckoutButtonState.md)
- [CheckoutButtonStatusesState](interfaces/CheckoutButtonStatusesState.md)
- [CheckoutParams](interfaces/CheckoutParams.md)
- [CheckoutPayment](interfaces/CheckoutPayment.md)
- [CheckoutPaymentMethodExecutedOptions](interfaces/CheckoutPaymentMethodExecutedOptions.md)
- [CheckoutRequestBody](interfaces/CheckoutRequestBody.md)
- [CheckoutSelector](interfaces/CheckoutSelector.md)
- [CheckoutSelectors](interfaces/CheckoutSelectors.md)
- [CheckoutServiceOptions](interfaces/CheckoutServiceOptions.md)
- [CheckoutSettings](interfaces/CheckoutSettings.md)
- [CheckoutStoreErrorSelector](interfaces/CheckoutStoreErrorSelector.md)
- [CheckoutStoreSelector](interfaces/CheckoutStoreSelector.md)
- [CheckoutStoreStatusSelector](interfaces/CheckoutStoreStatusSelector.md)
- [Config](interfaces/Config.md)
- [ConfigSelector](interfaces/ConfigSelector.md)
- [Consignment](interfaces/Consignment.md)
- [ConsignmentAssignmentBaseRequestBodyWithAddress](interfaces/ConsignmentAssignmentBaseRequestBodyWithAddress.md)
- [ConsignmentAssignmentBaseRequestBodyWithShippingAddress](interfaces/ConsignmentAssignmentBaseRequestBodyWithShippingAddress.md)
- [ConsignmentAutomaticDiscount](interfaces/ConsignmentAutomaticDiscount.md)
- [ConsignmentCouponDiscount](interfaces/ConsignmentCouponDiscount.md)
- [ConsignmentCreateRequestBody](interfaces/ConsignmentCreateRequestBody.md)
- [ConsignmentDiscountBase](interfaces/ConsignmentDiscountBase.md)
- [ConsignmentLineItem](interfaces/ConsignmentLineItem.md)
- [ConsignmentPickupOption](interfaces/ConsignmentPickupOption.md)
- [ConsignmentSelector](interfaces/ConsignmentSelector.md)
- [ConsignmentUpdateRequestBody](interfaces/ConsignmentUpdateRequestBody.md)
- [ConsignmentsChangedEvent](interfaces/ConsignmentsChangedEvent.md)
- [ContextConfig](interfaces/ContextConfig.md)
- [Coordinates](interfaces/Coordinates.md)
- [Country](interfaces/Country.md)
- [CountrySelector](interfaces/CountrySelector.md)
- [Coupon](interfaces/Coupon.md)
- [CouponSelector](interfaces/CouponSelector.md)
- [CreditCardInstrument](interfaces/CreditCardInstrument.md)
- [CreditCardPaymentInitializeOptions_2](interfaces/CreditCardPaymentInitializeOptions_2.md)
- [CreditCardPlaceHolder](interfaces/CreditCardPlaceHolder.md)
- [CssProperties](interfaces/CssProperties.md)
- [Currency](interfaces/Currency.md)
- [CustomError](interfaces/CustomError.md)
- [CustomItem](interfaces/CustomItem.md)
- [Customer](interfaces/Customer.md)
- [CustomerAccountRequestBody](interfaces/CustomerAccountRequestBody.md)
- [CustomerAddress](interfaces/CustomerAddress.md)
- [CustomerCredentials](interfaces/CustomerCredentials.md)
- [CustomerGroup](interfaces/CustomerGroup.md)
- [CustomerPasswordRequirements](interfaces/CustomerPasswordRequirements.md)
- [CustomerRequestOptions](interfaces/CustomerRequestOptions.md)
- [CustomerSelector](interfaces/CustomerSelector.md)
- [CustomerStrategySelector](interfaces/CustomerStrategySelector.md)
- [CustomizationConfig](interfaces/CustomizationConfig.md)
- [DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions](interfaces/DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions.md)
- [DigitalItem](interfaces/DigitalItem.md)
- [DigitalRiverElementClasses](interfaces/DigitalRiverElementClasses.md)
- [DigitalRiverPaymentInitializeOptions](interfaces/DigitalRiverPaymentInitializeOptions.md)
- [Discount](interfaces/Discount.md)
- [DisplaySettings](interfaces/DisplaySettings.md)
- [EmbeddedCheckoutCompleteEvent](interfaces/EmbeddedCheckoutCompleteEvent.md)
- [EmbeddedCheckoutError](interfaces/EmbeddedCheckoutError.md)
- [EmbeddedCheckoutErrorEvent](interfaces/EmbeddedCheckoutErrorEvent.md)
- [EmbeddedCheckoutFrameErrorEvent](interfaces/EmbeddedCheckoutFrameErrorEvent.md)
- [EmbeddedCheckoutFrameLoadedEvent](interfaces/EmbeddedCheckoutFrameLoadedEvent.md)
- [EmbeddedCheckoutLoadedEvent](interfaces/EmbeddedCheckoutLoadedEvent.md)
- [EmbeddedCheckoutMessenger](interfaces/EmbeddedCheckoutMessenger.md)
- [EmbeddedCheckoutMessengerOptions](interfaces/EmbeddedCheckoutMessengerOptions.md)
- [EmbeddedCheckoutOptions](interfaces/EmbeddedCheckoutOptions.md)
- [EmbeddedCheckoutSignedOutEvent](interfaces/EmbeddedCheckoutSignedOutEvent.md)
- [EmbeddedCheckoutStyles](interfaces/EmbeddedCheckoutStyles.md)
- [EmbeddedContentOptions](interfaces/EmbeddedContentOptions.md)
- [ExecutePaymentMethodCheckoutOptions](interfaces/ExecutePaymentMethodCheckoutOptions.md)
- [Extension](interfaces/Extension.md)
- [ExtensionCommandMap](interfaces/ExtensionCommandMap.md)
- [ExtensionQueryMap](interfaces/ExtensionQueryMap.md)
- [ExtensionSelector](interfaces/ExtensionSelector.md)
- [Fee](interfaces/Fee.md)
- [FlashMessage](interfaces/FlashMessage.md)
- [FormField](interfaces/FormField.md)
- [FormFieldItem](interfaces/FormFieldItem.md)
- [FormFieldOptions](interfaces/FormFieldOptions.md)
- [FormFields](interfaces/FormFields.md)
- [FormSelector](interfaces/FormSelector.md)
- [GatewayOrderPayment](interfaces/GatewayOrderPayment.md)
- [GetConsignmentsMessage](interfaces/GetConsignmentsMessage.md)
- [GetConsignmentsQuery](interfaces/GetConsignmentsQuery.md)
- [GiftCertificate](interfaces/GiftCertificate.md)
- [GiftCertificateItem](interfaces/GiftCertificateItem.md)
- [GiftCertificateOrderPayment](interfaces/GiftCertificateOrderPayment.md)
- [GiftCertificateSelector](interfaces/GiftCertificateSelector.md)
- [GooglePayButtonInitializeOptions](interfaces/GooglePayButtonInitializeOptions.md)
- [GooglePayCustomerInitializeOptions](interfaces/GooglePayCustomerInitializeOptions.md)
- [GooglePayPaymentInitializeOptions](interfaces/GooglePayPaymentInitializeOptions.md)
- [GoogleRecaptchaWindow](interfaces/GoogleRecaptchaWindow.md)
- [HostedCardFieldOptions](interfaces/HostedCardFieldOptions.md)
- [HostedCardFieldOptionsMap](interfaces/HostedCardFieldOptionsMap.md)
- [HostedFieldAttachEvent](interfaces/HostedFieldAttachEvent.md)
- [HostedFieldStoredCardRequestEvent](interfaces/HostedFieldStoredCardRequestEvent.md)
- [HostedFieldStylesMap](interfaces/HostedFieldStylesMap.md)
- [HostedFieldSubmitRequestEvent](interfaces/HostedFieldSubmitRequestEvent.md)
- [HostedFieldValidateRequestEvent](interfaces/HostedFieldValidateRequestEvent.md)
- [HostedFormErrorData](interfaces/HostedFormErrorData.md)
- [HostedFormOrderData](interfaces/HostedFormOrderData.md)
- [HostedInputAttachErrorEvent](interfaces/HostedInputAttachErrorEvent.md)
- [HostedInputAttachSuccessEvent](interfaces/HostedInputAttachSuccessEvent.md)
- [HostedInputBinChangeEvent](interfaces/HostedInputBinChangeEvent.md)
- [HostedInputBlurEvent](interfaces/HostedInputBlurEvent.md)
- [HostedInputCardTypeChangeEvent](interfaces/HostedInputCardTypeChangeEvent.md)
- [HostedInputChangeEvent](interfaces/HostedInputChangeEvent.md)
- [HostedInputEnterEvent](interfaces/HostedInputEnterEvent.md)
- [HostedInputEventMap](interfaces/HostedInputEventMap.md)
- [HostedInputFocusEvent](interfaces/HostedInputFocusEvent.md)
- [HostedInputInitializeErrorData](interfaces/HostedInputInitializeErrorData.md)
- [HostedInputStoredCardErrorEvent](interfaces/HostedInputStoredCardErrorEvent.md)
- [HostedInputStoredCardSucceededEvent](interfaces/HostedInputStoredCardSucceededEvent.md)
- [HostedInputSubmitErrorEvent](interfaces/HostedInputSubmitErrorEvent.md)
- [HostedInputSubmitSuccessEvent](interfaces/HostedInputSubmitSuccessEvent.md)
- [HostedInputValidateErrorData](interfaces/HostedInputValidateErrorData.md)
- [HostedInputValidateErrorDataMap](interfaces/HostedInputValidateErrorDataMap.md)
- [HostedInputValidateEvent](interfaces/HostedInputValidateEvent.md)
- [HostedInputValidateResults](interfaces/HostedInputValidateResults.md)
- [HostedInstrument](interfaces/HostedInstrument.md)
- [HostedStoredCardFieldOptions](interfaces/HostedStoredCardFieldOptions.md)
- [HostedStoredCardFieldOptionsMap](interfaces/HostedStoredCardFieldOptionsMap.md)
- [IbanElementOptions](interfaces/IbanElementOptions.md)
- [IdealElementOptions](interfaces/IdealElementOptions.md)
- [IdealStateData](interfaces/IdealStateData.md)
- [IframeEvent](interfaces/IframeEvent.md)
- [IframeEventPostOptions](interfaces/IframeEventPostOptions.md)
- [IndividualCardElementOptions](interfaces/IndividualCardElementOptions.md)
- [InitCallbackActions](interfaces/InitCallbackActions.md)
- [InitCallbackActions_2](interfaces/InitCallbackActions_2.md)
- [InitiaizedQuery](interfaces/InitiaizedQuery.md)
- [InitializationStrategy](interfaces/InitializationStrategy.md)
- [InlineElementStyles](interfaces/InlineElementStyles.md)
- [InputDetail](interfaces/InputDetail.md)
- [InputStyles](interfaces/InputStyles.md)
- [InstrumentSelector](interfaces/InstrumentSelector.md)
- [InternalAddress](interfaces/InternalAddress.md)
- [InternalCheckoutSelectors](interfaces/InternalCheckoutSelectors.md)
- [InternalOrderMeta](interfaces/InternalOrderMeta.md)
- [InternalOrderPayment](interfaces/InternalOrderPayment.md)
- [Item](interfaces/Item.md)
- [Item_2](interfaces/Item_2.md)
- [LabelStyles](interfaces/LabelStyles.md)
- [LanguageConfig](interfaces/LanguageConfig.md)
- [LegacyHostedFormOptions](interfaces/LegacyHostedFormOptions.md)
- [LineItem](interfaces/LineItem.md)
- [LineItemCategory](interfaces/LineItemCategory.md)
- [LineItemMap](interfaces/LineItemMap.md)
- [LineItemOption](interfaces/LineItemOption.md)
- [LineItemSocialData](interfaces/LineItemSocialData.md)
- [LinkStyles](interfaces/LinkStyles.md)
- [Locales](interfaces/Locales.md)
- [MasterpassCustomerInitializeOptions](interfaces/MasterpassCustomerInitializeOptions.md)
- [MasterpassPaymentInitializeOptions](interfaces/MasterpassPaymentInitializeOptions.md)
- [MolliePaymentInitializeOptions](interfaces/MolliePaymentInitializeOptions.md)
- [MutationObeserverCreator](interfaces/MutationObeserverCreator.md)
- [MutationObserverWindow](interfaces/MutationObserverWindow.md)
- [NonceInstrument](interfaces/NonceInstrument.md)
- [Option](interfaces/Option.md)
- [OptionsResponse](interfaces/OptionsResponse.md)
- [Order](interfaces/Order.md)
- [OrderBillingAddress](interfaces/OrderBillingAddress.md)
- [OrderBillingAddressSelector](interfaces/OrderBillingAddressSelector.md)
- [OrderConsignment](interfaces/OrderConsignment.md)
- [OrderFee](interfaces/OrderFee.md)
- [OrderMetaState](interfaces/OrderMetaState.md)
- [OrderPayment](interfaces/OrderPayment.md)
- [OrderPaymentRequestBody](interfaces/OrderPaymentRequestBody.md)
- [OrderRequestBody](interfaces/OrderRequestBody.md)
- [OrderSelector](interfaces/OrderSelector.md)
- [OrderShippingConsignment](interfaces/OrderShippingConsignment.md)
- [OrderShippingConsignmentDiscount](interfaces/OrderShippingConsignmentDiscount.md)
- [PasswordRequirements](interfaces/PasswordRequirements.md)
- [PayPalButtonStyleOptions](interfaces/PayPalButtonStyleOptions.md)
- [PayPalButtonStyleOptions_2](interfaces/PayPalButtonStyleOptions_2.md)
- [PayPalBuyNowInitializeOptions](interfaces/PayPalBuyNowInitializeOptions.md)
- [PayPalBuyNowInitializeOptions_2](interfaces/PayPalBuyNowInitializeOptions_2.md)
- [PayPalCommerceAlternativeMethodsButtonOptions](interfaces/PayPalCommerceAlternativeMethodsButtonOptions.md)
- [PayPalCommerceAlternativeMethodsPaymentOptions](interfaces/PayPalCommerceAlternativeMethodsPaymentOptions.md)
- [PayPalCommerceAnalyticTrackerService](interfaces/PayPalCommerceAnalyticTrackerService.md)
- [PayPalCommerceButtonInitializeOptions](interfaces/PayPalCommerceButtonInitializeOptions.md)
- [PayPalCommerceCreditButtonInitializeOptions](interfaces/PayPalCommerceCreditButtonInitializeOptions.md)
- [PayPalCommerceCreditCardsPaymentInitializeOptions](interfaces/PayPalCommerceCreditCardsPaymentInitializeOptions.md)
- [PayPalCommerceCreditCustomerInitializeOptions](interfaces/PayPalCommerceCreditCustomerInitializeOptions.md)
- [PayPalCommerceCreditPaymentInitializeOptions](interfaces/PayPalCommerceCreditPaymentInitializeOptions.md)
- [PayPalCommerceCustomerInitializeOptions](interfaces/PayPalCommerceCustomerInitializeOptions.md)
- [PayPalCommerceFastlaneCustomerInitializeOptions](interfaces/PayPalCommerceFastlaneCustomerInitializeOptions.md)
- [PayPalCommerceFastlanePaymentInitializeOptions](interfaces/PayPalCommerceFastlanePaymentInitializeOptions.md)
- [PayPalCommerceFastlaneShippingInitializeOptions](interfaces/PayPalCommerceFastlaneShippingInitializeOptions.md)
- [PayPalCommerceFieldsStyleOptions](interfaces/PayPalCommerceFieldsStyleOptions.md)
- [PayPalCommercePaymentInitializeOptions](interfaces/PayPalCommercePaymentInitializeOptions.md)
- [PayPalCommerceVenmoButtonInitializeOptions](interfaces/PayPalCommerceVenmoButtonInitializeOptions.md)
- [PayPalCommerceVenmoCustomerInitializeOptions](interfaces/PayPalCommerceVenmoCustomerInitializeOptions.md)
- [PayPalCommerceVenmoPaymentInitializeOptions](interfaces/PayPalCommerceVenmoPaymentInitializeOptions.md)
- [PayPalInstrument](interfaces/PayPalInstrument.md)
- [PaymentAdditionalAction](interfaces/PaymentAdditionalAction.md)
- [PaymentInstrumentMeta](interfaces/PaymentInstrumentMeta.md)
- [PaymentMethod](interfaces/PaymentMethod.md)
- [PaymentMethodConfig](interfaces/PaymentMethodConfig.md)
- [PaymentMethodMeta](interfaces/PaymentMethodMeta.md)
- [PaymentMethodSelector](interfaces/PaymentMethodSelector.md)
- [PaymentProviderCustomerSelector](interfaces/PaymentProviderCustomerSelector.md)
- [PaymentRequestOptions](interfaces/PaymentRequestOptions.md)
- [PaymentSelector](interfaces/PaymentSelector.md)
- [PaymentSettings](interfaces/PaymentSettings.md)
- [PaymentStrategySelector](interfaces/PaymentStrategySelector.md)
- [PaypalButtonInitializeOptions](interfaces/PaypalButtonInitializeOptions.md)
- [PaypalCommerceRatePay](interfaces/PaypalCommerceRatePay.md)
- [PaypalExpressPaymentInitializeOptions](interfaces/PaypalExpressPaymentInitializeOptions.md)
- [PaypalStyleOptions](interfaces/PaypalStyleOptions.md)
- [PhysicalItem](interfaces/PhysicalItem.md)
- [PickupMethod](interfaces/PickupMethod.md)
- [PickupOptionRequestBody](interfaces/PickupOptionRequestBody.md)
- [PickupOptionResult](interfaces/PickupOptionResult.md)
- [PickupOptionSelector](interfaces/PickupOptionSelector.md)
- [Promotion](interfaces/Promotion.md)
- [Radius](interfaces/Radius.md)
- [ReRenderShippingForm](interfaces/ReRenderShippingForm.md)
- [RecaptchaResult](interfaces/RecaptchaResult.md)
- [Region](interfaces/Region.md)
- [ReloadCheckoutCommand](interfaces/ReloadCheckoutCommand.md)
- [RemoteCheckoutSelector](interfaces/RemoteCheckoutSelector.md)
- [RemoteCheckoutStateData](interfaces/RemoteCheckoutStateData.md)
- [RequestOptions](interfaces/RequestOptions.md)
- [SearchArea](interfaces/SearchArea.md)
- [SepaPlaceHolder](interfaces/SepaPlaceHolder.md)
- [SepaStateData](interfaces/SepaStateData.md)
- [SetIframeStyleCommand](interfaces/SetIframeStyleCommand.md)
- [ShippingAddressSelector](interfaces/ShippingAddressSelector.md)
- [ShippingCountrySelector](interfaces/ShippingCountrySelector.md)
- [ShippingInitializeOptions](interfaces/ShippingInitializeOptions.md)
- [ShippingOption](interfaces/ShippingOption.md)
- [ShippingRequestOptions](interfaces/ShippingRequestOptions.md)
- [ShippingStrategySelector](interfaces/ShippingStrategySelector.md)
- [ShopperConfig](interfaces/ShopperConfig.md)
- [ShopperCurrency](interfaces/ShopperCurrency.md)
- [ShowLoadingIndicatorCommand](interfaces/ShowLoadingIndicatorCommand.md)
- [SignInEmail](interfaces/SignInEmail.md)
- [SignInEmailRequestBody](interfaces/SignInEmailRequestBody.md)
- [SignInEmailSelector](interfaces/SignInEmailSelector.md)
- [SpamProtectionOptions](interfaces/SpamProtectionOptions.md)
- [SquareV2PaymentInitializeOptions](interfaces/SquareV2PaymentInitializeOptions.md)
- [StepStyles](interfaces/StepStyles.md)
- [StepTracker](interfaces/StepTracker.md)
- [StepTrackerConfig](interfaces/StepTrackerConfig.md)
- [StoreConfig](interfaces/StoreConfig.md)
- [StoreCreditSelector](interfaces/StoreCreditSelector.md)
- [StoreCurrency](interfaces/StoreCurrency.md)
- [StoreLinks](interfaces/StoreLinks.md)
- [StoreProfile](interfaces/StoreProfile.md)
- [StoredCardHostedFormBillingAddress](interfaces/StoredCardHostedFormBillingAddress.md)
- [StoredCardHostedFormData](interfaces/StoredCardHostedFormData.md)
- [StoredCardHostedFormInstrumentFields](interfaces/StoredCardHostedFormInstrumentFields.md)
- [StripeCustomerEvent](interfaces/StripeCustomerEvent.md)
- [StripeElementCSSProperties](interfaces/StripeElementCSSProperties.md)
- [StripeElementClasses](interfaces/StripeElementClasses.md)
- [StripeElementStyle](interfaces/StripeElementStyle.md)
- [StripeElementStyleVariant](interfaces/StripeElementStyleVariant.md)
- [StripeElementUpdateOptions](interfaces/StripeElementUpdateOptions.md)
- [StripeEvent](interfaces/StripeEvent.md)
- [StripeOCSPaymentInitializeOptions](interfaces/StripeOCSPaymentInitializeOptions.md)
- [StripeShippingEvent](interfaces/StripeShippingEvent.md)
- [StripeUPECustomerInitializeOptions](interfaces/StripeUPECustomerInitializeOptions.md)
- [StripeUPEPaymentInitializeOptions](interfaces/StripeUPEPaymentInitializeOptions.md)
- [StripeUPEShippingInitializeOptions](interfaces/StripeUPEShippingInitializeOptions.md)
- [StripeV3PaymentInitializeOptions](interfaces/StripeV3PaymentInitializeOptions.md)
- [StyleOptions](interfaces/StyleOptions.md)
- [SubInputDetail](interfaces/SubInputDetail.md)
- [Subscriptions](interfaces/Subscriptions.md)
- [SubscriptionsSelector](interfaces/SubscriptionsSelector.md)
- [Tax](interfaces/Tax.md)
- [TextInputStyles](interfaces/TextInputStyles.md)
- [ThreeDSecure](interfaces/ThreeDSecure.md)
- [ThreeDSecureToken](interfaces/ThreeDSecureToken.md)
- [TranslationData](interfaces/TranslationData.md)
- [Translations](interfaces/Translations.md)
- [UnknownObject](interfaces/UnknownObject.md)
- [UserExperienceSettings](interfaces/UserExperienceSettings.md)
- [VaultAccessToken](interfaces/VaultAccessToken.md)
- [VaultedInstrument](interfaces/VaultedInstrument.md)
- [WechatDataPaymentMethodState](interfaces/WechatDataPaymentMethodState.md)
- [WechatState](interfaces/WechatState.md)
- [WithAdyenV2PaymentInitializeOptions](interfaces/WithAdyenV2PaymentInitializeOptions.md)
- [WithAdyenV3PaymentInitializeOptions](interfaces/WithAdyenV3PaymentInitializeOptions.md)
- [WithAmazonPayV2ButtonInitializeOptions](interfaces/WithAmazonPayV2ButtonInitializeOptions.md)
- [WithAmazonPayV2CustomerInitializeOptions](interfaces/WithAmazonPayV2CustomerInitializeOptions.md)
- [WithAmazonPayV2PaymentInitializeOptions](interfaces/WithAmazonPayV2PaymentInitializeOptions.md)
- [WithApplePayButtonInitializeOptions](interfaces/WithApplePayButtonInitializeOptions.md)
- [WithApplePayCustomerInitializeOptions](interfaces/WithApplePayCustomerInitializeOptions.md)
- [WithApplePayPaymentInitializeOptions](interfaces/WithApplePayPaymentInitializeOptions.md)
- [WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions](interfaces/WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md)
- [WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions](interfaces/WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md)
- [WithBigCommercePaymentsCreditCardsPaymentInitializeOptions](interfaces/WithBigCommercePaymentsCreditCardsPaymentInitializeOptions.md)
- [WithBigCommercePaymentsFastlaneCustomerInitializeOptions](interfaces/WithBigCommercePaymentsFastlaneCustomerInitializeOptions.md)
- [WithBigCommercePaymentsFastlanePaymentInitializeOptions](interfaces/WithBigCommercePaymentsFastlanePaymentInitializeOptions.md)
- [WithBigCommercePaymentsPayLaterButtonInitializeOptions](interfaces/WithBigCommercePaymentsPayLaterButtonInitializeOptions.md)
- [WithBigCommercePaymentsPayLaterCustomerInitializeOptions](interfaces/WithBigCommercePaymentsPayLaterCustomerInitializeOptions.md)
- [WithBigCommercePaymentsPayLaterPaymentInitializeOptions](interfaces/WithBigCommercePaymentsPayLaterPaymentInitializeOptions.md)
- [WithBigCommercePaymentsPayPalButtonInitializeOptions](interfaces/WithBigCommercePaymentsPayPalButtonInitializeOptions.md)
- [WithBigCommercePaymentsPayPalCustomerInitializeOptions](interfaces/WithBigCommercePaymentsPayPalCustomerInitializeOptions.md)
- [WithBigCommercePaymentsPayPalPaymentInitializeOptions](interfaces/WithBigCommercePaymentsPayPalPaymentInitializeOptions.md)
- [WithBigCommercePaymentsRatePayPaymentInitializeOptions](interfaces/WithBigCommercePaymentsRatePayPaymentInitializeOptions.md)
- [WithBigCommercePaymentsVenmoButtonInitializeOptions](interfaces/WithBigCommercePaymentsVenmoButtonInitializeOptions.md)
- [WithBigCommercePaymentsVenmoCustomerInitializeOptions](interfaces/WithBigCommercePaymentsVenmoCustomerInitializeOptions.md)
- [WithBigCommercePaymentsVenmoPaymentInitializeOptions](interfaces/WithBigCommercePaymentsVenmoPaymentInitializeOptions.md)
- [WithBlueSnapDirectAPMPaymentInitializeOptions](interfaces/WithBlueSnapDirectAPMPaymentInitializeOptions.md)
- [WithBoltButtonInitializeOptions](interfaces/WithBoltButtonInitializeOptions.md)
- [WithBoltCustomerInitializeOptions](interfaces/WithBoltCustomerInitializeOptions.md)
- [WithBoltPaymentInitializeOptions](interfaces/WithBoltPaymentInitializeOptions.md)
- [WithBraintreeAchPaymentInitializeOptions](interfaces/WithBraintreeAchPaymentInitializeOptions.md)
- [WithBraintreeFastlaneCustomerInitializeOptions](interfaces/WithBraintreeFastlaneCustomerInitializeOptions.md)
- [WithBraintreeFastlanePaymentInitializeOptions](interfaces/WithBraintreeFastlanePaymentInitializeOptions.md)
- [WithBraintreeLocalMethodsPaymentInitializeOptions](interfaces/WithBraintreeLocalMethodsPaymentInitializeOptions.md)
- [WithBraintreePaypalButtonInitializeOptions](interfaces/WithBraintreePaypalButtonInitializeOptions.md)
- [WithBraintreePaypalCreditButtonInitializeOptions](interfaces/WithBraintreePaypalCreditButtonInitializeOptions.md)
- [WithBraintreePaypalCreditCustomerInitializeOptions](interfaces/WithBraintreePaypalCreditCustomerInitializeOptions.md)
- [WithBraintreePaypalCustomerInitializeOptions](interfaces/WithBraintreePaypalCustomerInitializeOptions.md)
- [WithBuyNowFeature](interfaces/WithBuyNowFeature.md)
- [WithCheckoutcomFawryInstrument](interfaces/WithCheckoutcomFawryInstrument.md)
- [WithCheckoutcomSEPAInstrument](interfaces/WithCheckoutcomSEPAInstrument.md)
- [WithCreditCardPaymentInitializeOptions](interfaces/WithCreditCardPaymentInitializeOptions.md)
- [WithDocumentInstrument](interfaces/WithDocumentInstrument.md)
- [WithIdealInstrument](interfaces/WithIdealInstrument.md)
- [WithMollieIssuerInstrument](interfaces/WithMollieIssuerInstrument.md)
- [WithMolliePaymentInitializeOptions](interfaces/WithMolliePaymentInitializeOptions.md)
- [WithPayPalCommerceAlternativeMethodsButtonInitializeOptions](interfaces/WithPayPalCommerceAlternativeMethodsButtonInitializeOptions.md)
- [WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions](interfaces/WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions.md)
- [WithPayPalCommerceButtonInitializeOptions](interfaces/WithPayPalCommerceButtonInitializeOptions.md)
- [WithPayPalCommerceCreditButtonInitializeOptions](interfaces/WithPayPalCommerceCreditButtonInitializeOptions.md)
- [WithPayPalCommerceCreditCardsPaymentInitializeOptions](interfaces/WithPayPalCommerceCreditCardsPaymentInitializeOptions.md)
- [WithPayPalCommerceCreditCustomerInitializeOptions](interfaces/WithPayPalCommerceCreditCustomerInitializeOptions.md)
- [WithPayPalCommerceCreditPaymentInitializeOptions](interfaces/WithPayPalCommerceCreditPaymentInitializeOptions.md)
- [WithPayPalCommerceCustomerInitializeOptions](interfaces/WithPayPalCommerceCustomerInitializeOptions.md)
- [WithPayPalCommerceFastlaneCustomerInitializeOptions](interfaces/WithPayPalCommerceFastlaneCustomerInitializeOptions.md)
- [WithPayPalCommerceFastlanePaymentInitializeOptions](interfaces/WithPayPalCommerceFastlanePaymentInitializeOptions.md)
- [WithPayPalCommercePaymentInitializeOptions](interfaces/WithPayPalCommercePaymentInitializeOptions.md)
- [WithPayPalCommerceRatePayPaymentInitializeOptions](interfaces/WithPayPalCommerceRatePayPaymentInitializeOptions.md)
- [WithPayPalCommerceVenmoButtonInitializeOptions](interfaces/WithPayPalCommerceVenmoButtonInitializeOptions.md)
- [WithPayPalCommerceVenmoCustomerInitializeOptions](interfaces/WithPayPalCommerceVenmoCustomerInitializeOptions.md)
- [WithPayPalCommerceVenmoPaymentInitializeOptions](interfaces/WithPayPalCommerceVenmoPaymentInitializeOptions.md)
- [WithSquareV2PaymentInitializeOptions](interfaces/WithSquareV2PaymentInitializeOptions.md)
- [WithStripeOCSPaymentInitializeOptions](interfaces/WithStripeOCSPaymentInitializeOptions.md)
- [WithStripeUPECustomerInitializeOptions](interfaces/WithStripeUPECustomerInitializeOptions.md)
- [WithStripeUPEPaymentInitializeOptions](interfaces/WithStripeUPEPaymentInitializeOptions.md)
- [WithStripeV3PaymentInitializeOptions](interfaces/WithStripeV3PaymentInitializeOptions.md)
- [WithWorldpayAccessPaymentInitializeOptions](interfaces/WithWorldpayAccessPaymentInitializeOptions.md)
- [WorldpayAccessPaymentInitializeOptions](interfaces/WorldpayAccessPaymentInitializeOptions.md)
- [ZipCodeElementOptions](interfaces/ZipCodeElementOptions.md)

### Type Aliases

- [AccountInstrument](README.md#accountinstrument)
- [AddressKey](README.md#addresskey)
- [AdyenComponentEventState](README.md#adyencomponenteventstate)
- [AmazonPayV2ButtonInitializeOptions](README.md#amazonpayv2buttoninitializeoptions)
- [AnalyticStepType](README.md#analyticsteptype)
- [BraintreeFormErrorData](README.md#braintreeformerrordata)
- [BraintreeFormErrorDataKeys](README.md#braintreeformerrordatakeys)
- [BraintreeFormErrorsData](README.md#braintreeformerrorsdata)
- [BraintreeFormFieldBlurEventData](README.md#braintreeformfieldblureventdata)
- [BraintreeFormFieldEnterEventData](README.md#braintreeformfieldentereventdata)
- [BraintreeFormFieldFocusEventData](README.md#braintreeformfieldfocuseventdata)
- [BraintreeFormFieldStyles](README.md#braintreeformfieldstyles)
- [CheckoutButtonInitializeOptions](README.md#checkoutbuttoninitializeoptions)
- [CheckoutIncludeParam](README.md#checkoutincludeparam)
- [ComparableCheckout](README.md#comparablecheckout)
- [ConsignmentAssignmentRequestBody](README.md#consignmentassignmentrequestbody)
- [ConsignmentDiscount](README.md#consignmentdiscount)
- [ConsignmentsRequestBody](README.md#consignmentsrequestbody)
- [CustomerAddressRequestBody](README.md#customeraddressrequestbody)
- [CustomerInitializeOptions](README.md#customerinitializeoptions)
- [ExtensionEvent](README.md#extensionevent)
- [ExtensionMessage](README.md#extensionmessage)
- [FlashMessageType](README.md#flashmessagetype)
- [FormFieldFieldType](README.md#formfieldfieldtype)
- [FormFieldType](README.md#formfieldtype)
- [GooglePayButtonColor](README.md#googlepaybuttoncolor)
- [GooglePayButtonType](README.md#googlepaybuttontype)
- [GuestCredentials](README.md#guestcredentials)
- [HostedCreditCardInstrument](README.md#hostedcreditcardinstrument)
- [HostedFieldBlurEventData](README.md#hostedfieldblureventdata)
- [HostedFieldCardTypeChangeEventData](README.md#hostedfieldcardtypechangeeventdata)
- [HostedFieldEnterEventData](README.md#hostedfieldentereventdata)
- [HostedFieldEvent](README.md#hostedfieldevent)
- [HostedFieldFocusEventData](README.md#hostedfieldfocuseventdata)
- [HostedFieldOptionsMap](README.md#hostedfieldoptionsmap)
- [HostedFieldStyles](README.md#hostedfieldstyles)
- [HostedFieldValidateEventData](README.md#hostedfieldvalidateeventdata)
- [HostedFormErrorDataKeys](README.md#hostedformerrordatakeys)
- [HostedFormErrorsData](README.md#hostedformerrorsdata)
- [HostedFormEventCallbacks](README.md#hostedformeventcallbacks)
- [HostedInputStyles](README.md#hostedinputstyles)
- [HostedVaultedInstrument](README.md#hostedvaultedinstrument)
- [IframeEventMap](README.md#iframeeventmap)
- [Instrument](README.md#instrument)
- [InstrumentMeta](README.md#instrumentmeta)
- [Omit](README.md#omit)
- [OrderMeta](README.md#ordermeta)
- [OrderPaymentInstrument](README.md#orderpaymentinstrument)
- [OrderPayments](README.md#orderpayments)
- [PaymentInitializeOptions](README.md#paymentinitializeoptions)
- [PaymentInstrument](README.md#paymentinstrument)
- [PaymentProviderCustomer](README.md#paymentprovidercustomer)
- [ReadableCheckoutStore](README.md#readablecheckoutstore)
- [StripeElementOptions](README.md#stripeelementoptions)
- [StripeEventType](README.md#stripeeventtype)
- [StripeUPEAppearanceValues](README.md#stripeupeappearancevalues)
- [WithGooglePayButtonInitializeOptions](README.md#withgooglepaybuttoninitializeoptions)
- [WithGooglePayCustomerInitializeOptions](README.md#withgooglepaycustomerinitializeoptions)
- [WithGooglePayPaymentInitializeOptions](README.md#withgooglepaypaymentinitializeoptions)

### Functions

- [createBodlService](README.md#createbodlservice)
- [createBraintreeAnalyticTracker](README.md#createbraintreeanalytictracker)
- [createCheckoutButtonInitializer](README.md#createcheckoutbuttoninitializer)
- [createCheckoutService](README.md#createcheckoutservice)
- [createCurrencyService](README.md#createcurrencyservice)
- [createEmbeddedCheckoutMessenger](README.md#createembeddedcheckoutmessenger)
- [createLanguageService](README.md#createlanguageservice)
- [createPayPalCommerceAnalyticTracker](README.md#createpaypalcommerceanalytictracker)
- [createStepTracker](README.md#createsteptracker)
- [createStoredCardHostedFormService](README.md#createstoredcardhostedformservice)
- [embedCheckout](README.md#embedcheckout)

## Type Aliases

### AccountInstrument

Ƭ **AccountInstrument**: [`PayPalInstrument`](interfaces/PayPalInstrument.md) \| [`BankInstrument`](interfaces/BankInstrument.md) \| [`AchInstrument`](interfaces/AchInstrument.md)

___

### AddressKey

Ƭ **AddressKey**: keyof [`Address`](interfaces/Address.md)

___

### AdyenComponentEventState

Ƭ **AdyenComponentEventState**: [`CardState`](interfaces/CardState.md) \| [`BoletoState`](interfaces/BoletoState.md) \| [`WechatState`](interfaces/WechatState.md)

___

### AmazonPayV2ButtonInitializeOptions

Ƭ **AmazonPayV2ButtonInitializeOptions**: `AmazonPayV2ButtonParameters` \| [`WithBuyNowFeature`](interfaces/WithBuyNowFeature.md)

The required config to render the AmazonPayV2 button.

___

### AnalyticStepType

Ƭ **AnalyticStepType**: ``"customer"`` \| ``"shipping"`` \| ``"billing"`` \| ``"payment"``

___

### BraintreeFormErrorData

Ƭ **BraintreeFormErrorData**: [`Omit`](README.md#omit)<[`BraintreeFormFieldState`](interfaces/BraintreeFormFieldState.md), ``"isFocused"``\>

___

### BraintreeFormErrorDataKeys

Ƭ **BraintreeFormErrorDataKeys**: ``"number"`` \| ``"expirationDate"`` \| ``"expirationMonth"`` \| ``"expirationYear"`` \| ``"cvv"`` \| ``"postalCode"``

___

### BraintreeFormErrorsData

Ƭ **BraintreeFormErrorsData**: `Partial`<`Record`<[`BraintreeFormErrorDataKeys`](README.md#braintreeformerrordatakeys), [`BraintreeFormErrorData`](README.md#braintreeformerrordata)\>\>

___

### BraintreeFormFieldBlurEventData

Ƭ **BraintreeFormFieldBlurEventData**: [`BraintreeFormFieldKeyboardEventData`](interfaces/BraintreeFormFieldKeyboardEventData.md)

___

### BraintreeFormFieldEnterEventData

Ƭ **BraintreeFormFieldEnterEventData**: [`BraintreeFormFieldKeyboardEventData`](interfaces/BraintreeFormFieldKeyboardEventData.md)

___

### BraintreeFormFieldFocusEventData

Ƭ **BraintreeFormFieldFocusEventData**: [`BraintreeFormFieldKeyboardEventData`](interfaces/BraintreeFormFieldKeyboardEventData.md)

___

### BraintreeFormFieldStyles

Ƭ **BraintreeFormFieldStyles**: `Partial`<`Pick`<`CSSStyleDeclaration`, ``"color"`` \| ``"fontFamily"`` \| ``"fontSize"`` \| ``"fontWeight"``\>\>

___

### CheckoutButtonInitializeOptions

Ƭ **CheckoutButtonInitializeOptions**: [`BaseCheckoutButtonInitializeOptions`](interfaces/BaseCheckoutButtonInitializeOptions.md) & [`WithAmazonPayV2ButtonInitializeOptions`](interfaces/WithAmazonPayV2ButtonInitializeOptions.md) & [`WithApplePayButtonInitializeOptions`](interfaces/WithApplePayButtonInitializeOptions.md) & [`WithBigCommercePaymentsPayPalButtonInitializeOptions`](interfaces/WithBigCommercePaymentsPayPalButtonInitializeOptions.md) & [`WithBigCommercePaymentsPayLaterButtonInitializeOptions`](interfaces/WithBigCommercePaymentsPayLaterButtonInitializeOptions.md) & [`WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions`](interfaces/WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions.md) & [`WithBigCommercePaymentsVenmoButtonInitializeOptions`](interfaces/WithBigCommercePaymentsVenmoButtonInitializeOptions.md) & [`WithBoltButtonInitializeOptions`](interfaces/WithBoltButtonInitializeOptions.md) & [`WithBraintreePaypalButtonInitializeOptions`](interfaces/WithBraintreePaypalButtonInitializeOptions.md) & [`WithBraintreePaypalCreditButtonInitializeOptions`](interfaces/WithBraintreePaypalCreditButtonInitializeOptions.md) & [`WithGooglePayButtonInitializeOptions`](README.md#withgooglepaybuttoninitializeoptions) & [`WithPayPalCommerceButtonInitializeOptions`](interfaces/WithPayPalCommerceButtonInitializeOptions.md) & [`WithPayPalCommerceCreditButtonInitializeOptions`](interfaces/WithPayPalCommerceCreditButtonInitializeOptions.md) & [`WithPayPalCommerceVenmoButtonInitializeOptions`](interfaces/WithPayPalCommerceVenmoButtonInitializeOptions.md) & [`WithPayPalCommerceAlternativeMethodsButtonInitializeOptions`](interfaces/WithPayPalCommerceAlternativeMethodsButtonInitializeOptions.md)

___

### CheckoutIncludeParam

Ƭ **CheckoutIncludeParam**: { [key in CheckoutIncludes]?: boolean }

___

### ComparableCheckout

Ƭ **ComparableCheckout**: `Pick`<[`Checkout`](interfaces/Checkout.md), ``"outstandingBalance"`` \| ``"coupons"`` \| ``"giftCertificates"``\> & { `cart`: `Partial`<[`Cart`](interfaces/Cart.md)\>  }

___

### ConsignmentAssignmentRequestBody

Ƭ **ConsignmentAssignmentRequestBody**: [`ConsignmentAssignmentBaseRequestBodyWithShippingAddress`](interfaces/ConsignmentAssignmentBaseRequestBodyWithShippingAddress.md) \| [`ConsignmentAssignmentBaseRequestBodyWithAddress`](interfaces/ConsignmentAssignmentBaseRequestBodyWithAddress.md)

___

### ConsignmentDiscount

Ƭ **ConsignmentDiscount**: [`ConsignmentAutomaticDiscount`](interfaces/ConsignmentAutomaticDiscount.md) \| [`ConsignmentCouponDiscount`](interfaces/ConsignmentCouponDiscount.md)

___

### ConsignmentsRequestBody

Ƭ **ConsignmentsRequestBody**: [`ConsignmentCreateRequestBody`](interfaces/ConsignmentCreateRequestBody.md)[]

___

### CustomerAddressRequestBody

Ƭ **CustomerAddressRequestBody**: [`AddressRequestBody`](interfaces/AddressRequestBody.md)

___

### CustomerInitializeOptions

Ƭ **CustomerInitializeOptions**: [`BaseCustomerInitializeOptions`](interfaces/BaseCustomerInitializeOptions.md) & [`WithAmazonPayV2CustomerInitializeOptions`](interfaces/WithAmazonPayV2CustomerInitializeOptions.md) & [`WithApplePayCustomerInitializeOptions`](interfaces/WithApplePayCustomerInitializeOptions.md) & [`WithBigCommercePaymentsPayPalCustomerInitializeOptions`](interfaces/WithBigCommercePaymentsPayPalCustomerInitializeOptions.md) & [`WithBigCommercePaymentsFastlaneCustomerInitializeOptions`](interfaces/WithBigCommercePaymentsFastlaneCustomerInitializeOptions.md) & [`WithBigCommercePaymentsPayLaterCustomerInitializeOptions`](interfaces/WithBigCommercePaymentsPayLaterCustomerInitializeOptions.md) & [`WithBigCommercePaymentsVenmoCustomerInitializeOptions`](interfaces/WithBigCommercePaymentsVenmoCustomerInitializeOptions.md) & [`WithBoltCustomerInitializeOptions`](interfaces/WithBoltCustomerInitializeOptions.md) & [`WithBraintreePaypalCustomerInitializeOptions`](interfaces/WithBraintreePaypalCustomerInitializeOptions.md) & [`WithBraintreePaypalCreditCustomerInitializeOptions`](interfaces/WithBraintreePaypalCreditCustomerInitializeOptions.md) & [`WithBraintreeFastlaneCustomerInitializeOptions`](interfaces/WithBraintreeFastlaneCustomerInitializeOptions.md) & [`WithGooglePayCustomerInitializeOptions`](README.md#withgooglepaycustomerinitializeoptions) & [`WithPayPalCommerceCustomerInitializeOptions`](interfaces/WithPayPalCommerceCustomerInitializeOptions.md) & [`WithPayPalCommerceCreditCustomerInitializeOptions`](interfaces/WithPayPalCommerceCreditCustomerInitializeOptions.md) & [`WithPayPalCommerceVenmoCustomerInitializeOptions`](interfaces/WithPayPalCommerceVenmoCustomerInitializeOptions.md) & [`WithPayPalCommerceFastlaneCustomerInitializeOptions`](interfaces/WithPayPalCommerceFastlaneCustomerInitializeOptions.md) & [`WithStripeUPECustomerInitializeOptions`](interfaces/WithStripeUPECustomerInitializeOptions.md)

___

### ExtensionEvent

Ƭ **ExtensionEvent**: [`ConsignmentsChangedEvent`](interfaces/ConsignmentsChangedEvent.md)

___

### ExtensionMessage

Ƭ **ExtensionMessage**: [`ExtensionEvent`](README.md#extensionevent) \| [`GetConsignmentsMessage`](interfaces/GetConsignmentsMessage.md)

___

### FlashMessageType

Ƭ **FlashMessageType**: ``"error"`` \| ``"info"`` \| ``"warning"`` \| ``"success"``

___

### FormFieldFieldType

Ƭ **FormFieldFieldType**: ``"checkbox"`` \| ``"date"`` \| ``"text"`` \| ``"dropdown"`` \| ``"password"`` \| ``"radio"`` \| ``"multiline"``

___

### FormFieldType

Ƭ **FormFieldType**: ``"array"`` \| ``"date"`` \| ``"integer"`` \| ``"string"``

___

### GooglePayButtonColor

Ƭ **GooglePayButtonColor**: ``"default"`` \| ``"black"`` \| ``"white"``

___

### GooglePayButtonType

Ƭ **GooglePayButtonType**: ``"book"`` \| ``"buy"`` \| ``"checkout"`` \| ``"donate"`` \| ``"order"`` \| ``"pay"`` \| ``"plain"`` \| ``"subscribe"`` \| ``"long"`` \| ``"short"``

___

### GuestCredentials

Ƭ **GuestCredentials**: `Partial`<[`Subscriptions`](interfaces/Subscriptions.md)\> & { `email`: `string` ; `id?`: `string`  }

___

### HostedCreditCardInstrument

Ƭ **HostedCreditCardInstrument**: [`Omit`](README.md#omit)<[`CreditCardInstrument`](interfaces/CreditCardInstrument.md), ``"ccExpiry"`` \| ``"ccName"`` \| ``"ccNumber"`` \| ``"ccCvv"``\>

___

### HostedFieldBlurEventData

Ƭ **HostedFieldBlurEventData**: [`HostedInputBlurEvent`](interfaces/HostedInputBlurEvent.md)[``"payload"``]

___

### HostedFieldCardTypeChangeEventData

Ƭ **HostedFieldCardTypeChangeEventData**: [`HostedInputCardTypeChangeEvent`](interfaces/HostedInputCardTypeChangeEvent.md)[``"payload"``]

___

### HostedFieldEnterEventData

Ƭ **HostedFieldEnterEventData**: [`HostedInputEnterEvent`](interfaces/HostedInputEnterEvent.md)[``"payload"``]

___

### HostedFieldEvent

Ƭ **HostedFieldEvent**: [`HostedFieldAttachEvent`](interfaces/HostedFieldAttachEvent.md) \| [`HostedFieldSubmitRequestEvent`](interfaces/HostedFieldSubmitRequestEvent.md) \| [`HostedFieldValidateRequestEvent`](interfaces/HostedFieldValidateRequestEvent.md) \| [`HostedFieldStoredCardRequestEvent`](interfaces/HostedFieldStoredCardRequestEvent.md)

___

### HostedFieldFocusEventData

Ƭ **HostedFieldFocusEventData**: [`HostedInputFocusEvent`](interfaces/HostedInputFocusEvent.md)[``"payload"``]

___

### HostedFieldOptionsMap

Ƭ **HostedFieldOptionsMap**: [`HostedCardFieldOptionsMap`](interfaces/HostedCardFieldOptionsMap.md) \| [`HostedStoredCardFieldOptionsMap`](interfaces/HostedStoredCardFieldOptionsMap.md)

___

### HostedFieldStyles

Ƭ **HostedFieldStyles**: [`HostedInputStyles`](README.md#hostedinputstyles)

___

### HostedFieldValidateEventData

Ƭ **HostedFieldValidateEventData**: [`HostedInputValidateEvent`](interfaces/HostedInputValidateEvent.md)[``"payload"``]

___

### HostedFormErrorDataKeys

Ƭ **HostedFormErrorDataKeys**: ``"number"`` \| ``"expirationDate"`` \| ``"expirationMonth"`` \| ``"expirationYear"`` \| ``"cvv"`` \| ``"postalCode"``

___

### HostedFormErrorsData

Ƭ **HostedFormErrorsData**: `Partial`<`Record`<[`HostedFormErrorDataKeys`](README.md#hostedformerrordatakeys), [`HostedFormErrorData`](interfaces/HostedFormErrorData.md)\>\>

___

### HostedFormEventCallbacks

Ƭ **HostedFormEventCallbacks**: `Pick`<[`LegacyHostedFormOptions`](interfaces/LegacyHostedFormOptions.md), ``"onBlur"`` \| ``"onCardTypeChange"`` \| ``"onFocus"`` \| ``"onEnter"`` \| ``"onValidate"``\>

___

### HostedInputStyles

Ƭ **HostedInputStyles**: `Partial`<`Pick`<`CSSStyleDeclaration`, ``"color"`` \| ``"fontFamily"`` \| ``"fontSize"`` \| ``"fontWeight"``\>\>

___

### HostedVaultedInstrument

Ƭ **HostedVaultedInstrument**: [`Omit`](README.md#omit)<[`VaultedInstrument`](interfaces/VaultedInstrument.md), ``"ccNumber"`` \| ``"ccCvv"``\>

___

### IframeEventMap

Ƭ **IframeEventMap**<`TType`\>: { [key in TType]: IframeEvent<TType\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TType` | extends `string` \| `number` \| `symbol``string` |

___

### Instrument

Ƭ **Instrument**: [`CardInstrument`](interfaces/CardInstrument.md)

___

### InstrumentMeta

Ƭ **InstrumentMeta**: [`VaultAccessToken`](interfaces/VaultAccessToken.md)

___

### Omit

Ƭ **Omit**<`T`, `K`\>: `Pick`<`T`, `Exclude`<keyof `T`, `K`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `K` | extends keyof `T` |

___

### OrderMeta

Ƭ **OrderMeta**: [`OrderMetaState`](interfaces/OrderMetaState.md)

___

### OrderPaymentInstrument

Ƭ **OrderPaymentInstrument**: `WithBankAccountInstrument` \| `WithEcpInstrument` \| `WithSepaInstrument` \| `WithPayByBankInstrument` \| [`WithIdealInstrument`](interfaces/WithIdealInstrument.md) \| [`CreditCardInstrument`](interfaces/CreditCardInstrument.md) \| [`HostedInstrument`](interfaces/HostedInstrument.md) \| [`HostedCreditCardInstrument`](README.md#hostedcreditcardinstrument) \| [`HostedVaultedInstrument`](README.md#hostedvaultedinstrument) \| [`NonceInstrument`](interfaces/NonceInstrument.md) \| [`VaultedInstrument`](interfaces/VaultedInstrument.md) \| [`CreditCardInstrument`](interfaces/CreditCardInstrument.md) & [`WithDocumentInstrument`](interfaces/WithDocumentInstrument.md) \| [`CreditCardInstrument`](interfaces/CreditCardInstrument.md) & [`WithCheckoutcomFawryInstrument`](interfaces/WithCheckoutcomFawryInstrument.md) \| [`CreditCardInstrument`](interfaces/CreditCardInstrument.md) & [`WithCheckoutcomSEPAInstrument`](interfaces/WithCheckoutcomSEPAInstrument.md) \| [`CreditCardInstrument`](interfaces/CreditCardInstrument.md) & [`WithIdealInstrument`](interfaces/WithIdealInstrument.md) \| [`HostedInstrument`](interfaces/HostedInstrument.md) & [`WithMollieIssuerInstrument`](interfaces/WithMollieIssuerInstrument.md) \| `WithAccountCreation`

___

### OrderPayments

Ƭ **OrderPayments**: ([`GatewayOrderPayment`](interfaces/GatewayOrderPayment.md) \| [`GiftCertificateOrderPayment`](interfaces/GiftCertificateOrderPayment.md))[]

___

### PaymentInitializeOptions

Ƭ **PaymentInitializeOptions**: [`BasePaymentInitializeOptions`](interfaces/BasePaymentInitializeOptions.md) & [`WithAdyenV3PaymentInitializeOptions`](interfaces/WithAdyenV3PaymentInitializeOptions.md) & [`WithAdyenV2PaymentInitializeOptions`](interfaces/WithAdyenV2PaymentInitializeOptions.md) & [`WithAmazonPayV2PaymentInitializeOptions`](interfaces/WithAmazonPayV2PaymentInitializeOptions.md) & [`WithApplePayPaymentInitializeOptions`](interfaces/WithApplePayPaymentInitializeOptions.md) & [`WithBigCommercePaymentsPayPalPaymentInitializeOptions`](interfaces/WithBigCommercePaymentsPayPalPaymentInitializeOptions.md) & [`WithBigCommercePaymentsFastlanePaymentInitializeOptions`](interfaces/WithBigCommercePaymentsFastlanePaymentInitializeOptions.md) & [`WithBigCommercePaymentsPayLaterPaymentInitializeOptions`](interfaces/WithBigCommercePaymentsPayLaterPaymentInitializeOptions.md) & [`WithBigCommercePaymentsRatePayPaymentInitializeOptions`](interfaces/WithBigCommercePaymentsRatePayPaymentInitializeOptions.md) & [`WithBigCommercePaymentsCreditCardsPaymentInitializeOptions`](interfaces/WithBigCommercePaymentsCreditCardsPaymentInitializeOptions.md) & [`WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions`](interfaces/WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions.md) & [`WithBigCommercePaymentsVenmoPaymentInitializeOptions`](interfaces/WithBigCommercePaymentsVenmoPaymentInitializeOptions.md) & [`WithBlueSnapDirectAPMPaymentInitializeOptions`](interfaces/WithBlueSnapDirectAPMPaymentInitializeOptions.md) & [`WithBoltPaymentInitializeOptions`](interfaces/WithBoltPaymentInitializeOptions.md) & [`WithBraintreeAchPaymentInitializeOptions`](interfaces/WithBraintreeAchPaymentInitializeOptions.md) & [`WithBraintreeLocalMethodsPaymentInitializeOptions`](interfaces/WithBraintreeLocalMethodsPaymentInitializeOptions.md) & [`WithBraintreeFastlanePaymentInitializeOptions`](interfaces/WithBraintreeFastlanePaymentInitializeOptions.md) & [`WithCreditCardPaymentInitializeOptions`](interfaces/WithCreditCardPaymentInitializeOptions.md) & [`WithGooglePayPaymentInitializeOptions`](README.md#withgooglepaypaymentinitializeoptions) & [`WithMolliePaymentInitializeOptions`](interfaces/WithMolliePaymentInitializeOptions.md) & [`WithPayPalCommercePaymentInitializeOptions`](interfaces/WithPayPalCommercePaymentInitializeOptions.md) & [`WithPayPalCommerceCreditPaymentInitializeOptions`](interfaces/WithPayPalCommerceCreditPaymentInitializeOptions.md) & [`WithPayPalCommerceVenmoPaymentInitializeOptions`](interfaces/WithPayPalCommerceVenmoPaymentInitializeOptions.md) & [`WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions`](interfaces/WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions.md) & [`WithPayPalCommerceCreditCardsPaymentInitializeOptions`](interfaces/WithPayPalCommerceCreditCardsPaymentInitializeOptions.md) & [`WithPayPalCommerceRatePayPaymentInitializeOptions`](interfaces/WithPayPalCommerceRatePayPaymentInitializeOptions.md) & [`WithPayPalCommerceFastlanePaymentInitializeOptions`](interfaces/WithPayPalCommerceFastlanePaymentInitializeOptions.md) & [`WithSquareV2PaymentInitializeOptions`](interfaces/WithSquareV2PaymentInitializeOptions.md) & [`WithStripeV3PaymentInitializeOptions`](interfaces/WithStripeV3PaymentInitializeOptions.md) & [`WithStripeUPEPaymentInitializeOptions`](interfaces/WithStripeUPEPaymentInitializeOptions.md) & [`WithStripeOCSPaymentInitializeOptions`](interfaces/WithStripeOCSPaymentInitializeOptions.md) & [`WithWorldpayAccessPaymentInitializeOptions`](interfaces/WithWorldpayAccessPaymentInitializeOptions.md)

___

### PaymentInstrument

Ƭ **PaymentInstrument**: [`CardInstrument`](interfaces/CardInstrument.md) \| [`AccountInstrument`](README.md#accountinstrument)

___

### PaymentProviderCustomer

Ƭ **PaymentProviderCustomer**: `PaymentProviderCustomerType`

___

### ReadableCheckoutStore

Ƭ **ReadableCheckoutStore**: `ReadableDataStore`<[`InternalCheckoutSelectors`](interfaces/InternalCheckoutSelectors.md)\>

___

### StripeElementOptions

Ƭ **StripeElementOptions**: [`CardElementOptions`](interfaces/CardElementOptions.md) \| [`CardExpiryElementOptions`](interfaces/CardExpiryElementOptions.md) \| [`CardNumberElementOptions`](interfaces/CardNumberElementOptions.md) \| [`CardCvcElementOptions`](interfaces/CardCvcElementOptions.md) \| [`IdealElementOptions`](interfaces/IdealElementOptions.md) \| [`IbanElementOptions`](interfaces/IbanElementOptions.md) \| [`ZipCodeElementOptions`](interfaces/ZipCodeElementOptions.md)

___

### StripeEventType

Ƭ **StripeEventType**: [`StripeShippingEvent`](interfaces/StripeShippingEvent.md) \| [`StripeCustomerEvent`](interfaces/StripeCustomerEvent.md)

___

### StripeUPEAppearanceValues

Ƭ **StripeUPEAppearanceValues**: `string` \| `string`[] \| `number` \| `undefined`

___

### WithGooglePayButtonInitializeOptions

Ƭ **WithGooglePayButtonInitializeOptions**: { [k in GooglePayKey]?: GooglePayButtonInitializeOptions }

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### WithGooglePayCustomerInitializeOptions

Ƭ **WithGooglePayCustomerInitializeOptions**: { [k in GooglePayKey]?: GooglePayCustomerInitializeOptions }

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

___

### WithGooglePayPaymentInitializeOptions

Ƭ **WithGooglePayPaymentInitializeOptions**: { [k in GooglePayKey]?: GooglePayPaymentInitializeOptions }

The options that are required to initialize the GooglePay payment method.
They can be omitted unless you need to support GooglePay.

## Functions

### createBodlService

▸ **createBodlService**(`subscribe`): [`BodlService`](interfaces/BodlService.md)

Creates an instance of `BodlService`.

**`remarks`**

```js
const bodlService = BodlService();
bodlService.checkoutBegin();

```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subscribe` | (`subscriber`: (`state`: [`CheckoutSelectors`](interfaces/CheckoutSelectors.md)) => `void`) => `void` | The callback function, what get a subscriber as a property, that subscribes to state changes. |

#### Returns

[`BodlService`](interfaces/BodlService.md)

an instance of `BodlService`.

___

### createBraintreeAnalyticTracker

▸ **createBraintreeAnalyticTracker**(`checkoutService`): [`BraintreeAnalyticTrackerService`](interfaces/BraintreeAnalyticTrackerService.md)

Creates an instance of `BraintreeAnalyticTrackerService`.

**`remarks`**
```js
const checkoutService = createCheckoutService();
await checkoutService.loadCheckout();
const braintreeAnalyticTracker = createBraintreeAnalyticTracker(checkoutService);

braintreeAnalyticTracker.customerPaymentMethodExecuted();
braintreeAnalyticTracker.paymentComplete();
braintreeAnalyticTracker.selectedPaymentMethod('applepay');
braintreeAnalyticTracker.walletButtonClick('paypal');
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `checkoutService` | [`CheckoutService`](classes/CheckoutService.md) |

#### Returns

[`BraintreeAnalyticTrackerService`](interfaces/BraintreeAnalyticTrackerService.md)

an instance of `BraintreeAnalyticTrackerService`.

___

### createCheckoutButtonInitializer

▸ **createCheckoutButtonInitializer**(`options?`): [`CheckoutButtonInitializer`](classes/CheckoutButtonInitializer.md)

Creates an instance of `CheckoutButtonInitializer`.

**`remarks`**
```js
const initializer = createCheckoutButtonInitializer();

initializer.initializeButton({
    methodId: 'braintreepaypal',
    braintreepaypal: {
        container: '#checkoutButton',
    },
});
```

**`alpha`**
Please note that `CheckoutButtonInitializer` is currently in an early stage
of development. Therefore the API is unstable and not ready for public
consumption.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`CheckoutButtonInitializerOptions`](interfaces/CheckoutButtonInitializerOptions.md) | A set of construction options. |

#### Returns

[`CheckoutButtonInitializer`](classes/CheckoutButtonInitializer.md)

an instance of `CheckoutButtonInitializer`.

___

### createCheckoutService

▸ **createCheckoutService**(`options?`): [`CheckoutService`](classes/CheckoutService.md)

Creates an instance of `CheckoutService`.

**`remarks`**
```js
const service = createCheckoutService();

service.subscribe(state => {
    console.log(state);
});

service.loadCheckout();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`CheckoutServiceOptions`](interfaces/CheckoutServiceOptions.md) | A set of construction options. |

#### Returns

[`CheckoutService`](classes/CheckoutService.md)

an instance of `CheckoutService`.

___

### createCurrencyService

▸ **createCurrencyService**(`config`): [`CurrencyService`](classes/CurrencyService.md)

Creates an instance of `CurrencyService`.

**`remarks`**
```js
const { data } = checkoutService.getState();
const config = data.getConfig();
const checkout = data.getCheckout();
const currencyService = createCurrencyService(config);

currencyService.toStoreCurrency(checkout.grandTotal);
currencyService.toCustomerCurrency(checkout.grandTotal);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`StoreConfig`](interfaces/StoreConfig.md) | The config object containing the currency configuration |

#### Returns

[`CurrencyService`](classes/CurrencyService.md)

an instance of `CurrencyService`.

___

### createEmbeddedCheckoutMessenger

▸ **createEmbeddedCheckoutMessenger**(`options`): [`EmbeddedCheckoutMessenger`](interfaces/EmbeddedCheckoutMessenger.md)

Create an instance of `EmbeddedCheckoutMessenger`.

**`remarks`**
The object is responsible for posting messages to the parent window from the
iframe when certain events have occurred. For example, when the checkout
form is first loaded, you should notify the parent window about it.

The iframe can only be embedded in domains that are allowed by the store.

```ts
const messenger = createEmbeddedCheckoutMessenger({
    parentOrigin: 'https://some/website',
});

messenger.postFrameLoaded();
```

**`alpha`**
Please note that this feature is currently in an early stage of development.
Therefore the API is unstable and not ready for public consumption.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`EmbeddedCheckoutMessengerOptions`](interfaces/EmbeddedCheckoutMessengerOptions.md) | Options for creating `EmbeddedCheckoutMessenger` |

#### Returns

[`EmbeddedCheckoutMessenger`](interfaces/EmbeddedCheckoutMessenger.md)

- An instance of `EmbeddedCheckoutMessenger`

___

### createLanguageService

▸ **createLanguageService**(`config?`): [`LanguageService`](classes/LanguageService.md)

Creates an instance of `LanguageService`.

**`remarks`**
```js
const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
const service = createLanguageService(language);

console.log(service.translate('address.city_label'));
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config?` | `Partial`<[`LanguageConfig`](interfaces/LanguageConfig.md)\> | A configuration object. |

#### Returns

[`LanguageService`](classes/LanguageService.md)

An instance of `LanguageService`.

___

### createPayPalCommerceAnalyticTracker

▸ **createPayPalCommerceAnalyticTracker**(`checkoutService`): [`PayPalCommerceAnalyticTrackerService`](interfaces/PayPalCommerceAnalyticTrackerService.md)

Creates an instance of `PayPalCommerceAnalyticTrackerService`.

**`remarks`**
```js
const checkoutService = createCheckoutService();
await checkoutService.loadCheckout();
const paypalCommerceAnalyticTracker = createPayPalCommerceAnalyticTracker(checkoutService);

paypalCommerceAnalyticTracker.customerPaymentMethodExecuted();
paypalCommerceAnalyticTracker.paymentComplete();
paypalCommerceAnalyticTracker.selectedPaymentMethod('applepay');
paypalCommerceAnalyticTracker.walletButtonClick('paypal');
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `checkoutService` | [`CheckoutService`](classes/CheckoutService.md) |

#### Returns

[`PayPalCommerceAnalyticTrackerService`](interfaces/PayPalCommerceAnalyticTrackerService.md)

an instance of `PayPalCommerceAnalyticTrackerService`.

___

### createStepTracker

▸ **createStepTracker**(`checkoutService`, `stepTrackerConfig?`): [`StepTracker`](interfaces/StepTracker.md)

Creates an instance of `StepTracker`.

**`remarks`**
```js
const checkoutService = createCheckoutService();
await checkoutService.loadCheckout();
const stepTracker = createStepTracker(checkoutService);

stepTracker.trackCheckoutStarted();
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `checkoutService` | [`CheckoutService`](classes/CheckoutService.md) |
| `stepTrackerConfig?` | [`StepTrackerConfig`](interfaces/StepTrackerConfig.md) |

#### Returns

[`StepTracker`](interfaces/StepTracker.md)

an instance of `StepTracker`.

___

### createStoredCardHostedFormService

▸ **createStoredCardHostedFormService**(`host`): [`StoredCardHostedFormService`](classes/StoredCardHostedFormService.md)

Creates an instance of `StoredCardHostedFormService`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `host` | `string` | Host url string parameter. |

#### Returns

[`StoredCardHostedFormService`](classes/StoredCardHostedFormService.md)

An instance of `StoredCardHostedFormService`.

___

### embedCheckout

▸ **embedCheckout**(`options`): `Promise`<[`EmbeddedCheckout`](classes/EmbeddedCheckout.md)\>

Embed the checkout form in an iframe.

**`remarks`**
Once the iframe is embedded, it will automatically resize according to the
size of the checkout form. It will also notify the parent window when certain
events have occurred. i.e.: when the form is loaded and ready to be used.

```js
embedCheckout({
    url: 'https://checkout/url',
    containerId: 'container-id',
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`EmbeddedCheckoutOptions`](interfaces/EmbeddedCheckoutOptions.md) | Options for embedding the checkout form. |

#### Returns

`Promise`<[`EmbeddedCheckout`](classes/EmbeddedCheckout.md)\>

A promise that resolves to an instance of `EmbeddedCheckout`.
