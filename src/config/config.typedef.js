/**
 * @typedef {Object} Context
 * @property {FlashMessage[]} flashMessages
 * @property {Object} payment
 * @property {string|null} payment.token
 */

/**
 * @typedef {Object} CustomizationSettings
 * @property {LanguageData} languageData
 */

/**
 * @typedef {Object} CheckoutSettings
 * @property {boolean} enableOrderComments
 * @property {boolean} enableTermsAndConditions
 * @property {boolean} guestCheckoutEnabled
 * @property {boolean} isCardVaultingEnabled
 * @property {boolean} isPaymentRequestEnabled
 * @property {boolean} isPaymentRequestCanMakePaymentEnabled
 * @property {string} orderTermsAndConditions
 * @property {string} orderTermsAndConditionsLink
 * @property {string} orderTermsAndConditionsType
 * @property {string} shippingQuoteFailedMessage
 * @property {string[]} realtimeShippingProviders
 * @property {string[]} remoteCheckoutProviders
 */

/**
 * @typedef {Object} CurrencySettings
 * @property {string} code
 * @property {string} decimalPlaces
 * @property {string} decimalSeparator
 * @property {string} symbolLocation
 * @property {string} symbol
 * @property {string} thousandsSeparator
 */

/**
 * @typedef {Object} FormFieldsSettings
 * @property {Field[]} shippingAddressFields
 * @property {Field[]} billingAddressFields
 */

/**
 * @typedef {Object} Links
 * @property {string} cartLink
 * @property {string} checkoutLink
 * @property {string} orderConfirmationLink

/**
 * @typedef {Object} PaymentSettings
 * @property {string} bigpayBaseUrl
 * @property {string[]} clientSidePaymentProviders
 */

/**
 * @typedef {Object} ShopperConfig
 * @property {boolean} defaultNewsletterSignup
 * @property {Object} passwordRequirements
 * @property {string} passwordRequirements.alpha
 * @property {string} passwordRequirements.numeric
 * @property {number} passwordRequirements.minlength
 * @property {string} passwordRequirements.error
 * @property {boolean} showNewsletterSignup
 */

/**
 * @typedef {Object} StoreProfile
 * @property {string} orderEmail
 * @property {string} shopPath
 * @property {string} storeCountry
 * @property {string} storeHash
 * @property {string} storeId
 * @property {string} storeName
 * @property {string} storePhoneNumber
 * @property {string} storeLanguage
 */

/**
 * @typedef {Object} ShopperCurrencySettings
 * @property {string} code
 * @property {string} symbolLocation
 * @property {string} symbol
 * @property {string} decimalPlaces
 * @property {string} decimalSeparator
 * @property {string} thousandsSeparator
 * @property {string} exchangeRate
 */


/**
 * @typedef {Object} StoreConfig
 * @property {string} cdnPath
 * @property {CheckoutSettings} checkoutSettings
 * @property {CurrencySettings} currency
 * @property {FormFieldsSettings} formFields
 * @property {Links} links
 * @property {PaymentSettings} paymentSettings
 * @property {ShopperConfig} shopperConfig
 * @property {StoreProfile} storeProfile
 * @property {string} imageDirectory
 * @property {boolean} isAngularDebuggingEnabled
 * @property {ShopperCurrencySettings} shopperCurrency
 */

/**
 * @typedef {Object} Config
 * @property {Context} context
 * @property {CustomizationSettings} customization
 * @property {StoreConfig} storeConfig
 */
