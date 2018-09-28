# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.7.0"></a>
# [1.7.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.6.1...v1.7.0) (2018-09-28)


### Features

* **checkout:** INT-775 Implement Masterpass button in customer section ([898381c](https://github.com/bigcommerce/checkout-sdk-js/commit/898381c))
* **order:** CHECKOUT-3563 Add External Source param when creating order ([41d76a0](https://github.com/bigcommerce/checkout-sdk-js/commit/41d76a0))
* **payment:** INT-616 Add Chase Pay wallet support ([e40a457](https://github.com/bigcommerce/checkout-sdk-js/commit/e40a457))
* **payment:** INT-685 Correctly set up CCAvenue MARS return URL ([7a563c3](https://github.com/bigcommerce/checkout-sdk-js/commit/7a563c3))



<a name="1.6.1"></a>
## [1.6.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.6.0...v1.6.1) (2018-09-26)


### Bug Fixes

* **common:** CHECKOUT-3529 Fix createCurrencyService type ([7f4b828](https://github.com/bigcommerce/checkout-sdk-js/commit/7f4b828))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.5.0...v1.6.0) (2018-09-25)


### Bug Fixes

* **payment:** INT-751 Show Masterpass button in payments section into square form ([35f0aae](https://github.com/bigcommerce/checkout-sdk-js/commit/35f0aae))


### Features

* **common:** CHECKOUT-3529 Add currency utilities ([67ee82f](https://github.com/bigcommerce/checkout-sdk-js/commit/67ee82f))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.4.0...v1.5.0) (2018-09-24)


### Bug Fixes

* **cart:** CP-3982 Add missing `productId` property to `LineItem` interface ([#405](https://github.com/bigcommerce/checkout-sdk-js/issues/405)) ([4fbca67](https://github.com/bigcommerce/checkout-sdk-js/commit/4fbca67))
* **payment:** PAYMENTS-3288 Leave deviceData as it is in dataCollector ([26863b4](https://github.com/bigcommerce/checkout-sdk-js/commit/26863b4))


### Features

* **checkout-button:** PAYMENTS-3071 Support more features of paypal checkout buttons ([67a7cba](https://github.com/bigcommerce/checkout-sdk-js/commit/67a7cba))
* **common:** CHECKOUT-3239 Add isCouponCodeCollapsed checkout setting ([e51c01e](https://github.com/bigcommerce/checkout-sdk-js/commit/e51c01e))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.3.0...v1.4.0) (2018-09-10)


### Bug Fixes

* **billing:** CHECKOUT-3492 Update CheckoutService#updateBillingAddress signature ([3a190cb](https://github.com/bigcommerce/checkout-sdk-js/commit/3a190cb))
* **checkout:** CHECKOUT-3011 Make sure host config is passed along for `CheckoutService` ([c5612c5](https://github.com/bigcommerce/checkout-sdk-js/commit/c5612c5))
* **checkout-button:** CHECKOUT-3011 Make sure host config is passed along for `CheckoutButtonInitializer` ([b95784b](https://github.com/bigcommerce/checkout-sdk-js/commit/b95784b))
* **order:** CHECKOUT-3437 Include options in line items ([7b04cd8](https://github.com/bigcommerce/checkout-sdk-js/commit/7b04cd8))
* **payment:** CHECKOUT-3516 Trigger `onReady` callback after order reference is passed to BC ([8d441a7](https://github.com/bigcommerce/checkout-sdk-js/commit/8d441a7))


### Features

* **billing:** CHECKOUT-3492 Add error/status selectors for CheckoutService#continueAsGuest ([b537d14](https://github.com/bigcommerce/checkout-sdk-js/commit/b537d14))
* **billing:** CHECKOUT-3492 Do not overwrite billing info when continuing as guest ([d42b2de](https://github.com/bigcommerce/checkout-sdk-js/commit/d42b2de))
* **billing:** CHECKOUT-3492 Track error/status independently for CheckoutService#continueAsGuest ([d271781](https://github.com/bigcommerce/checkout-sdk-js/commit/d271781))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.2.0...v1.3.0) (2018-09-04)


### Features

* **checkout-button:** CHECKOUT-3011 Add `CheckoutButtonInitializer` for initializing third party checkout buttons ([#374](https://github.com/bigcommerce/checkout-sdk-js/issues/374)) ([4a27a6c](https://github.com/bigcommerce/checkout-sdk-js/commit/4a27a6c))
* **shipping:** CHECKOUT-3461 Add ConsignmentSelector#getUnassignedItems method ([ba2dae8](https://github.com/bigcommerce/checkout-sdk-js/commit/ba2dae8))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.1.1...v1.2.0) (2018-09-03)


### Features

* **cart:** CHECKOUT-3493 Add `addedByPromotion` property to line items ([88bf435](https://github.com/bigcommerce/checkout-sdk-js/commit/88bf435))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.1.0...v1.1.1) (2018-08-28)


### Bug Fixes

* **checkout:** CHECKOUT-3449 Return correct status flags for actions that trigger other sub-actions ([23bfd24](https://github.com/bigcommerce/checkout-sdk-js/commit/23bfd24))
* **common:** CHECKOUT-3462 Update dependencies to remove Node requirement ([ed60802](https://github.com/bigcommerce/checkout-sdk-js/commit/ed60802))
* **order:** CHECKOUT-3449 Use correct order ID when reloading current order after order creation ([6d39e16](https://github.com/bigcommerce/checkout-sdk-js/commit/6d39e16))
* **payment:** CHECKOUT-3398 Check payment method payload ([ea621bf](https://github.com/bigcommerce/checkout-sdk-js/commit/ea621bf))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.0.0...v1.1.0) (2018-08-20)


### Bug Fixes

* **payment:** CHECKOUT-3401 Load order payments using checkout.orderId ([1bf885d](https://github.com/bigcommerce/checkout-sdk-js/commit/1bf885d))
* **payment:** CHECKOUT-3401 Stop loading current order before executing payment strategy ([093016d](https://github.com/bigcommerce/checkout-sdk-js/commit/093016d))


### Features

* **shipping:** CHECKOUT-3393 Add address comparator and rename previous to isInternalAddressEqual ([26b396c](https://github.com/bigcommerce/checkout-sdk-js/commit/26b396c))
* **shipping:** CHECKOUT-3393 Add consignment deletion status/error check in store selector ([9ce4774](https://github.com/bigcommerce/checkout-sdk-js/commit/9ce4774))
* **shipping:** CHECKOUT-3393 Add convenience methods to assign items to addresses/consignments ([f4e0469](https://github.com/bigcommerce/checkout-sdk-js/commit/f4e0469))
* **shipping:** CHECKOUT-3393 Add getConsignmentById in ConsignmentSelector ([16fbdeb](https://github.com/bigcommerce/checkout-sdk-js/commit/16fbdeb))
* **shipping:** CHECKOUT-3393 Provide CheckoutService#deleteConsignment method ([b3d401e](https://github.com/bigcommerce/checkout-sdk-js/commit/b3d401e))
* **shipping:** CHECKOUT-3393 Provide error/status selectors for CheckoutService#deleteConsignment ([66615b0](https://github.com/bigcommerce/checkout-sdk-js/commit/66615b0))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.8...v1.0.0) (2018-08-08)



<a name="0.28.8"></a>
## [0.28.8](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.7...v0.28.8) (2018-08-07)


### Bug Fixes

* **shipping:** CHECKOUT-3399 Use geo-ip only for the public shippingAddress selector ([178f145](https://github.com/bigcommerce/checkout-sdk-js/commit/178f145))



<a name="0.28.7"></a>
## [0.28.7](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.6...v0.28.7) (2018-08-07)



<a name="0.28.6"></a>
## [0.28.6](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.5...v0.28.6) (2018-07-31)


### Bug Fixes

* **order:** CHECKOUT-3390 Fix customer message getting overridden when submitting order ([60f10b5](https://github.com/bigcommerce/checkout-sdk-js/commit/60f10b5))
* **payment:** CHECKOUT-3380 Check payload is an object when loading payment methods ([f4ad1cd](https://github.com/bigcommerce/checkout-sdk-js/commit/f4ad1cd))



<a name="0.28.5"></a>
## [0.28.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.4...v0.28.5) (2018-07-30)


### Bug Fixes

* **payment:** PAYMENTS-3251 Load Klarna widget only once ([85cbcce](https://github.com/bigcommerce/checkout-sdk-js/commit/85cbcce))



<a name="0.28.4"></a>
## [0.28.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.3...v0.28.4) (2018-07-26)


### Bug Fixes

* **common:** PAYMENTS-3251 Check that argument is a valid string in toSingleLine utility ([c87484e](https://github.com/bigcommerce/checkout-sdk-js/commit/c87484e))
* **payment:** PAYMENTS-3251 Throw proper errors when Klarna authorization fails ([bf16895](https://github.com/bigcommerce/checkout-sdk-js/commit/bf16895))


### Features

* **checkout:** CHECKOUT-3371 Provide status/error checks for CheckoutService#updateCheckout ([fe2e07f](https://github.com/bigcommerce/checkout-sdk-js/commit/fe2e07f))


### Performance Improvements

* **common:** CHECKOUT-3009 Improve file bundle size ([9e0f458](https://github.com/bigcommerce/checkout-sdk-js/commit/9e0f458))



<a name="0.28.3"></a>
## [0.28.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.2...v0.28.3) (2018-07-24)


### Bug Fixes

* **shipping:** CHECKOUT-3243 Fix checkout data not getting retained after updating shipping option ([850b108](https://github.com/bigcommerce/checkout-sdk-js/commit/850b108))



<a name="0.28.2"></a>
## [0.28.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.1...v0.28.2) (2018-07-24)


### Bug Fixes

* **payment:** CHECKOUT-3370 Fix Afterpay not able to finalize order after redirection ([6e0f03c](https://github.com/bigcommerce/checkout-sdk-js/commit/6e0f03c))



<a name="0.28.1"></a>
## [0.28.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.28.0...v0.28.1) (2018-07-23)


### Features

* **shipping:** CHECKOUT-3243 Add createConsignments to ConsignmentActionCreator ([f9c1258](https://github.com/bigcommerce/checkout-sdk-js/commit/f9c1258))
* **shipping:** CHECKOUT-3243 Add multi-shipping methods in CheckoutService ([62c0dc3](https://github.com/bigcommerce/checkout-sdk-js/commit/62c0dc3))
* **shipping:** CHECKOUT-3243 Add updateConsignment to ConsignmentActionCreator ([a9da7c0](https://github.com/bigcommerce/checkout-sdk-js/commit/a9da7c0))
* **shipping:** CHECKOUT-3243 Support tracking loading and error states per consignment ([12c55da](https://github.com/bigcommerce/checkout-sdk-js/commit/12c55da))



<a name="0.28.0"></a>
# [0.28.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.27.2...v0.28.0) (2018-07-19)


### Bug Fixes

* **billing:** CHECKOUT-3359 Keep the email when creating a billingAddress if it was set ([672586f](https://github.com/bigcommerce/checkout-sdk-js/commit/672586f))
* **cart:** CHECKOUT-3356 Only compare important cart attributes ([07fe7be](https://github.com/bigcommerce/checkout-sdk-js/commit/07fe7be))


### Code Refactoring

* **checkout:** CHECKOUT-3331 Remove `checkout` property from `CheckoutSelectors` ([00c188f](https://github.com/bigcommerce/checkout-sdk-js/commit/00c188f))
* **payment:** CHECKOUT-3331 Mark `CheckoutService#loadPaymentMethod` as internal ([9a6ecfa](https://github.com/bigcommerce/checkout-sdk-js/commit/9a6ecfa))
* **shopper:** CHECKOUT-3331 Remove `signInGuest` from `CheckoutService` ([64f1969](https://github.com/bigcommerce/checkout-sdk-js/commit/64f1969))


### Features

* **payment:** INT-690 Remove all VCO references from Chase Pay code ([9cf3cda](https://github.com/bigcommerce/checkout-sdk-js/commit/9cf3cda))


### BREAKING CHANGES

* **payment:** `loadPaymentMethod` has been deprecated for some time.
However, due to legacy reasons, this method is still in use by Optimized
Checkout. To further discourage people from using it, we now mark it as
`internal` and remove it from the documentation. We will completely
remove it once it is no longer used by Optimized Checkout.
* **shopper:** `signInGuest` has been from `CheckoutService`. Call
`continueAsGuest` instead.
* **checkout:** `checkout` property has been removed from
`CheckoutSelector`. Use `data` property instead.



<a name="0.27.2"></a>
## [0.27.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.27.1...v0.27.2) (2018-07-11)


### Features

* **checkout:** CHECKOUT-3332 Make id optional for CheckoutService#loadCheckout ([22a1b98](https://github.com/bigcommerce/checkout-sdk-js/commit/22a1b98))



<a name="0.27.1"></a>
## [0.27.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.27.0...v0.27.1) (2018-07-10)


### Bug Fixes

* **common:** CHECKOUT-3334 Prevent order data from overwriting checkout data when retrieving payment information ([0bf5be2](https://github.com/bigcommerce/checkout-sdk-js/commit/0bf5be2))
* **payment:** CHECKOUT-3320 Clean order store after a new order is created ([ea2e632](https://github.com/bigcommerce/checkout-sdk-js/commit/ea2e632))
* **payment:** CHECKOUT-3329 Do not submit the order until PayPal tokenization finishes ([ebfc837](https://github.com/bigcommerce/checkout-sdk-js/commit/ebfc837))
* **payment:** PAYMENTS-3064 Braintree's DataCollector actually returns device_session_id and fraud_merchant_id as JSON but we just want the device_session_id ([b8f2c30](https://github.com/bigcommerce/checkout-sdk-js/commit/b8f2c30))
* **shopper:** CHECKOUT-3329 BillingAddressReducer shouldn't overwrite customer's email address ([1ddb485](https://github.com/bigcommerce/checkout-sdk-js/commit/1ddb485))



<a name="0.27.0"></a>
# [0.27.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.26.1...v0.27.0) (2018-07-04)


### Bug Fixes

* **common:** CHECKOUT-2960 Fix TS compilation issue ([ff3fc8a](https://github.com/bigcommerce/checkout-sdk-js/commit/ff3fc8a))
* **order:** CHECKOUT-3314 Map fields for digital items ([a289dc8](https://github.com/bigcommerce/checkout-sdk-js/commit/a289dc8))
* **payment:** CHECKOUT-3311 Send token and callbackUrl to bigpay ([a5f2df1](https://github.com/bigcommerce/checkout-sdk-js/commit/a5f2df1))
* **payment:** CHECKOUT-3319 Append returnUrl for Adyen ([3158c9b](https://github.com/bigcommerce/checkout-sdk-js/commit/3158c9b))
* **shipping:** CHECKOUT-3276 Create specific action for loading shipping options ([33cd64a](https://github.com/bigcommerce/checkout-sdk-js/commit/33cd64a))
* **shopper:** CHECKOUT-3319 Use customer information from billing address ([11f5039](https://github.com/bigcommerce/checkout-sdk-js/commit/11f5039))


### Code Refactoring

* **cart:** CHECKOUT-3053 Return `Cart` object in different schema ([1b65671](https://github.com/bigcommerce/checkout-sdk-js/commit/1b65671))
* **checkout:** CHECKOUT-3054 Return `Coupon` and `GiftCertificate` objects in different schema ([69a8431](https://github.com/bigcommerce/checkout-sdk-js/commit/69a8431))
* **checkout:** CHECKOUT-3282 Remove `loadConfig` method ([2426e19](https://github.com/bigcommerce/checkout-sdk-js/commit/2426e19))
* **order:** CHECKOUT-3056 Return `Order` object in different schema ([a316188](https://github.com/bigcommerce/checkout-sdk-js/commit/a316188))
* **payment:** CHECKOUT-3205 Transform snakecase payloads to camel ([d7a3876](https://github.com/bigcommerce/checkout-sdk-js/commit/d7a3876))


### Features

* **checkout:** CHECKOUT-3312 Provide updateCheckout method ([c9dd542](https://github.com/bigcommerce/checkout-sdk-js/commit/c9dd542))
* **common:** CHECKOUT-327 Export CacheKeyResolver ([18519d6](https://github.com/bigcommerce/checkout-sdk-js/commit/18519d6))
* **common:** CHECKOUT-3274 Remove quote mapper ([82de622](https://github.com/bigcommerce/checkout-sdk-js/commit/82de622))
* **common:** CHECKOUT-3275 Remove Address mapper ([93bfed6](https://github.com/bigcommerce/checkout-sdk-js/commit/93bfed6))
* **shipping:** CHECKOUT-3276 Expose consignments via checkoutStoreSelector ([6950ce9](https://github.com/bigcommerce/checkout-sdk-js/commit/6950ce9))
* **shopper:** CHECKOUT-3277 Remove cart dependency from customer mapper ([a5797d4](https://github.com/bigcommerce/checkout-sdk-js/commit/a5797d4))


### BREAKING CHANGES

* **payment:** Instrument interfaces now respond with camel case
object properties
* **checkout:** `loadConfig` method has been removed. Configuration
data is now automatically loaded when you call `loadCheckout` or
`loadOrder`.
* **checkout:** `getCoupons` and `getGiftCertificate` method now returns `Coupons` and `GiftCertificate` objects with different properties respectively.
* **cart:** `getCart` method now returns `Cart` object with different properties.
* **order:** `getOrder` method now returns `Order` object with different properties.
It also returns `undefined` until the order is created.
* **quote:** `getQuote` method has been removed.
* **shipping:** `getShippingAddress` method now returns `Address` object with different properties.
* **shipping:** `getShippingOptions` method now returns `ShippingOption[]` array with different properties.
* **shipping:** `getSelectedShippingOption` method now returns `ShippingOption` object with different properties.
* **billing:** `getBillingAddress` method now returns `Address` object with different properties.
* **customer:** `getCustomer` method now returns `Customer` object with different properties.



<a name="0.26.1"></a>
## [0.26.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.26.0...v0.26.1) (2018-06-27)


### Bug Fixes

* **common:** CHECKOUT-3299 Filter keys recursively when comparing objects ([68da93e](https://github.com/bigcommerce/checkout-sdk-js/commit/68da93e))



<a name="0.26.0"></a>
# [0.26.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.25.0...v0.26.0) (2018-06-27)


### Bug Fixes

* **billing:** CHECKOUT-3052 Fall back in billing email when not provided ([d2893ca](https://github.com/bigcommerce/checkout-sdk-js/commit/d2893ca))
* **common:** CHECKOUT-3170 Remove engine requirement for consumers ([9d2adbc](https://github.com/bigcommerce/checkout-sdk-js/commit/9d2adbc))
* **common:** CHECKOUT-3299 Fix performance of object comparison ([1a69d2f](https://github.com/bigcommerce/checkout-sdk-js/commit/1a69d2f))
* **order:** CHECKOUT-3056 Store billing address state when order loads ([44f40a9](https://github.com/bigcommerce/checkout-sdk-js/commit/44f40a9))
* **payment:** CHECKOUT-3054 Update gift certificate state when relevant actions are dispatched ([412990d](https://github.com/bigcommerce/checkout-sdk-js/commit/412990d))
* **payment:** CHECKOUT-3054 Use remaining balance from API ([a2989d4](https://github.com/bigcommerce/checkout-sdk-js/commit/a2989d4))
* **shipping:** CHECKOUT-3052 Pass consignment id to address mapper ([56de8e3](https://github.com/bigcommerce/checkout-sdk-js/commit/56de8e3))
* **shipping:** CHECKOUT-3052 Return Quote based on external checkout object ([0f5bab7](https://github.com/bigcommerce/checkout-sdk-js/commit/0f5bab7))
* **shipping:** CHECKOUT-3183 Return shipping address in quote using shipping selector ([988fcd1](https://github.com/bigcommerce/checkout-sdk-js/commit/988fcd1))
* **shipping:** CHECKOUT-3253 Change consigment schema to store selected shipping option object ([08d4a7e](https://github.com/bigcommerce/checkout-sdk-js/commit/08d4a7e))
* **shipping:** CHECKOUT-3253 Return selected shipping option as available shipping options ([9bc034f](https://github.com/bigcommerce/checkout-sdk-js/commit/9bc034f))
* **shipping:** CHECKOUT-3253 Update shipping option schema ([566e251](https://github.com/bigcommerce/checkout-sdk-js/commit/566e251))
* **shipping:** CHECKOUT-3280 Use POST/PUT to update consignments so we retain shippingOptions ([6aebfc5](https://github.com/bigcommerce/checkout-sdk-js/commit/6aebfc5))


### Features

* **checkout:** CHECKOUT-3053 Access data getters via `data` property ([aba3115](https://github.com/bigcommerce/checkout-sdk-js/commit/aba3115))
* **checkout:** INT-475 Chase Pay button to display on Customer section UCO page ([672d132](https://github.com/bigcommerce/checkout-sdk-js/commit/672d132))
* **checkout:** INT-660 Update checkout SDK to accept merchantRequestid ([9abc234](https://github.com/bigcommerce/checkout-sdk-js/commit/9abc234))
* **common:** CHECKOUT-3284 Throw better error when required data is missing ([#302](https://github.com/bigcommerce/checkout-sdk-js/issues/302)) ([3ddfd37](https://github.com/bigcommerce/checkout-sdk-js/commit/3ddfd37))
* **payment:** INT-594 Send ChasePay CheckoutData needed for WePay ([4433ac4](https://github.com/bigcommerce/checkout-sdk-js/commit/4433ac4))
* **shopper:** CHECKOUT-3278 Read from customer selector in checkout selector ([e7678d8](https://github.com/bigcommerce/checkout-sdk-js/commit/e7678d8))



<a name="0.25.0"></a>
# [0.25.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.24.1...v0.25.0) (2018-06-08)


### Bug Fixes

* **cart:** CHECKOUT-3044 Fix subtotal mapping ([6349ece](https://github.com/bigcommerce/checkout-sdk-js/commit/6349ece))
* **cart:** CHECKOUT-3044 Map subTotal value properly ([4f17be8](https://github.com/bigcommerce/checkout-sdk-js/commit/4f17be8))
* **checkout:** CHECKOUT-2932 Fix line items mapping for cart ([0dbc837](https://github.com/bigcommerce/checkout-sdk-js/commit/0dbc837))
* **checkout:** CHECKOUT-3186 Use store credit from customer ([778f70b](https://github.com/bigcommerce/checkout-sdk-js/commit/778f70b))
* **checkout:** CHECKOUT-3188 Rename coupon description to displayName ([6249a2e](https://github.com/bigcommerce/checkout-sdk-js/commit/6249a2e))
* **common:** CHECKOUT-3044 Fix mappings for cart verification ([18b2adb](https://github.com/bigcommerce/checkout-sdk-js/commit/18b2adb))
* **common:** CHECKOUT-3044 Request all includes in other request senders ([b12fead](https://github.com/bigcommerce/checkout-sdk-js/commit/b12fead))
* **common:** CHECKOUT-3051 Include API version in request header ([cb48799](https://github.com/bigcommerce/checkout-sdk-js/commit/cb48799))
* **common:** CHECKOUT-3182 Fix address mapper after API changes ([4934748](https://github.com/bigcommerce/checkout-sdk-js/commit/4934748))
* **payment:** CHECKOUT-3199 Add prefix to payment step when mapping to internal order ([5895fea](https://github.com/bigcommerce/checkout-sdk-js/commit/5895fea))
* **payment:** CHECKOUT-3214 Fix PayPal Express cart and checkout flow. ([a4c9669](https://github.com/bigcommerce/checkout-sdk-js/commit/a4c9669))


### Code Refactoring

* **checkout:** CHECKOUT-2954 Load checkout using storefront API ([256a0fa](https://github.com/bigcommerce/checkout-sdk-js/commit/256a0fa))
* **checkout:** CHECKOUT-3050 Load checkout using checkout id ([5dda2e5](https://github.com/bigcommerce/checkout-sdk-js/commit/5dda2e5))


### Features

* **checkout:** CHECKOUT-2930 Apply Coupons and Gift Certificates via public API ([35ba607](https://github.com/bigcommerce/checkout-sdk-js/commit/35ba607))
* **checkout:** CHECKOUT-3048 Remove fallback API call to quote endpoint ([0c9a066](https://github.com/bigcommerce/checkout-sdk-js/commit/0c9a066))
* **checkout:** CHECKOUT-3169 Verify cart using Storefront API checkout endpoint ([8b143ef](https://github.com/bigcommerce/checkout-sdk-js/commit/8b143ef))
* **order:** CHECKOUT-3047 Include payments by default in OrderRequestSender ([b056ed6](https://github.com/bigcommerce/checkout-sdk-js/commit/b056ed6))
* **order:** CHECKOUT-3047 Remove order backfill ([d5f5cc8](https://github.com/bigcommerce/checkout-sdk-js/commit/d5f5cc8))
* **shipping:** CHECKOUT-2928 Update billing address using Storefront API ([41d3513](https://github.com/bigcommerce/checkout-sdk-js/commit/41d3513))
* **shipping:** CHECKOUT-2929 Use consigments endpoint to update shipping option ([da0823c](https://github.com/bigcommerce/checkout-sdk-js/commit/da0823c))
* **shipping:** CHECKOUT-2929 Use consignments endpoint to update shipping address. ([c8f46ea](https://github.com/bigcommerce/checkout-sdk-js/commit/c8f46ea))
* **shipping:** CHECKOUT-3183 Default to geoCountry when quote has no shipping address ([b5c18da](https://github.com/bigcommerce/checkout-sdk-js/commit/b5c18da))
* **shopper:** CHECKOUT-3110 Provide convenience method to update guest customer email using storefront API ([89d8348](https://github.com/bigcommerce/checkout-sdk-js/commit/89d8348))


### BREAKING CHANGES

* **checkout:** You now need to pass in an ID in order to load
checkout. i.e.: `checkoutService.loadCheckout(id);`
* **checkout:** `CheckoutClient#loadCheckout` now returns storefront
API response.



<a name="0.24.1"></a>
## [0.24.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.24.0...v0.24.1) (2018-06-06)


### Bug Fixes

* **common:** CHECKOUT-3072 Use prepare instead of preinstall in package.json ([a549ca3](https://github.com/bigcommerce/checkout-sdk-js/commit/a549ca3))



<a name="0.24.0"></a>
# [0.24.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.23.1...v0.24.0) (2018-06-06)


### Features

* **common:** CHECKOUT-3072 Update address keys to match new API schema ([0ecc7ca](https://github.com/bigcommerce/checkout-sdk-js/commit/0ecc7ca))



<a name="0.23.1"></a>
## [0.23.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.23.0...v0.23.1) (2018-05-31)



<a name="0.23.0"></a>
# [0.23.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.22.0...v0.23.0) (2018-05-28)


### Bug Fixes

* **common:** CHECKOUT-3191 Update dependencies to fix issue with sourcemaps ([4f6ae44](https://github.com/bigcommerce/checkout-sdk-js/commit/4f6ae44))


### Features

* **payment:** INT-275 Add Cryptogram like a new payment instrument ([811a69a](https://github.com/bigcommerce/checkout-sdk-js/commit/811a69a))
* **payment:** PAYMENTS-2744 Updating Afterpay to support US and NZ customers. ([8f134e8](https://github.com/bigcommerce/checkout-sdk-js/commit/8f134e8))



<a name="0.22.0"></a>
# [0.22.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.21.1...v0.22.0) (2018-05-22)


### Bug Fixes

* **common:** PAYMENTS-2672 Update `package-lock.json` ([b774111](https://github.com/bigcommerce/checkout-sdk-js/commit/b774111))
* **payment:** CHECKOUT-2941 Afterpay token no longer needs to be passed in manually ([b7ecf70](https://github.com/bigcommerce/checkout-sdk-js/commit/b7ecf70))
* **payment:** CHECKOUT-3031 Export VisaCheckoutEventMap ([b1ae134](https://github.com/bigcommerce/checkout-sdk-js/commit/b1ae134))
* **payment:** PAYMENT-2672 Pass accessToken with all instrument payloads ([af3a264](https://github.com/bigcommerce/checkout-sdk-js/commit/af3a264))


### Code Refactoring

* **checkout:** CHECKOUT-3060 Stop exporting `CheckoutService` and `LanguageService` ([215e85f](https://github.com/bigcommerce/checkout-sdk-js/commit/215e85f))
* **checkout:** CHECKOUT-3142 Remove `CheckoutClient` from public exports ([912a1f3](https://github.com/bigcommerce/checkout-sdk-js/commit/912a1f3))
* **order:** CHECKOUT-3060 Change order submission parameters ([5aecc72](https://github.com/bigcommerce/checkout-sdk-js/commit/5aecc72))
* **order:** CHECKOUT-3142 Remove `finalizeOrder` method ([170a639](https://github.com/bigcommerce/checkout-sdk-js/commit/170a639))
* **payment:** CHECKOUT-3060 Update method names to be consistent ([fd7682c](https://github.com/bigcommerce/checkout-sdk-js/commit/fd7682c))


### Features

* **common:** CHECKOUT-2957 Prevent the use of the SDK in non https pages ([7c2bb21](https://github.com/bigcommerce/checkout-sdk-js/commit/7c2bb21))
* **payment:** CHECKOUT-3031 Add Braintree & VisaCheckout types for VisaCheckout ([01ffa12](https://github.com/bigcommerce/checkout-sdk-js/commit/01ffa12))
* **payment:** CHECKOUT-3031 Add BraintreeVisaCheckout to BraintreeSDKCreator ([09ac772](https://github.com/bigcommerce/checkout-sdk-js/commit/09ac772))
* **payment:** CHECKOUT-3031 Add BraintreeVisaCheckoutPaymentProcessor ([4a5e1f4](https://github.com/bigcommerce/checkout-sdk-js/commit/4a5e1f4))
* **payment:** CHECKOUT-3031 Add BraintreeVisaCheckoutPaymentStrategy ([8da4a29](https://github.com/bigcommerce/checkout-sdk-js/commit/8da4a29))
* **payment:** CHECKOUT-3031 Add script loader for BraintreeVisaCheckout ([1b5a2a2](https://github.com/bigcommerce/checkout-sdk-js/commit/1b5a2a2))
* **payment:** CHECKOUT-3031 Add script loader for VisaCheckoutSDK ([53993e3](https://github.com/bigcommerce/checkout-sdk-js/commit/53993e3))
* **payment:** CHECKOUT-3031 Create WidgetInteraction action for Payment Strategy ([6151dd7](https://github.com/bigcommerce/checkout-sdk-js/commit/6151dd7))
* **payment:** PAYMENT-2672 Introduce loadInstrumentsByAddress ([3ec227e](https://github.com/bigcommerce/checkout-sdk-js/commit/3ec227e))
* **shopper:** CHECKOUT-3031 Add BraintreeVisaCheckoutCustomerStrategy ([9a90cca](https://github.com/bigcommerce/checkout-sdk-js/commit/9a90cca))
* **shopper:** CHECKOUT-3031 Create WidgetInteraction action for Customer Strategy ([ab0b61b](https://github.com/bigcommerce/checkout-sdk-js/commit/ab0b61b))


### BREAKING CHANGES

* **checkout:** You can no longer directly call the constructors of
`CheckoutService` and `LanguageService`. Use `createCheckoutService` and
`createLanguageService` factory functions instead.
* **order:** To specify a payment method when submitting an order,
you have to provide `methodId` and `gatewayId` instead of `name` and
`gateway` fields.
* **payment:** `getInitializePaymentMethod` and
`isInitializingPaymentMethod` have now been renamed to
`getInitializePayment` and `isInitializingPayment` respectively.
* **order:** `CheckoutService#finalizeOrder` method has been
removed.
* **checkout:** `CheckoutClient` is no longer exported for public use.



<a name="0.21.1"></a>
## [0.21.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.21.0...v0.21.1) (2018-05-09)


### Bug Fixes

* **checkout:** CHECKOUT-3124 Return same state object unless it is different ([95a3fd4](https://github.com/bigcommerce/checkout-sdk-js/commit/95a3fd4))



<a name="0.21.0"></a>
# [0.21.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.20.1...v0.21.0) (2018-05-09)


### Code Refactoring

* **checkout:** CHECKOUT-3124 Remove `getCheckoutMeta` method ([9cf454e](https://github.com/bigcommerce/checkout-sdk-js/commit/9cf454e))
* **checkout:** CHECKOUT-3124 Remove `verifyCart` method ([53182ec](https://github.com/bigcommerce/checkout-sdk-js/commit/53182ec))


### BREAKING CHANGES

* **checkout:** `CheckoutService#verifyCart` method has been removed.
Now the cart always gets verified before order submission.
* **checkout:** `CheckoutSelector#getCheckoutMeta` has been removed.
The data exposed by this method was intended for internal use only.



<a name="0.20.1"></a>
## [0.20.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.20.0...v0.20.1) (2018-05-08)


### Bug Fixes

* **payment:** CHECKOUT-3138 Fix Braintree Paypal cart flow initialization ([75eb86a](https://github.com/bigcommerce/checkout-sdk-js/commit/75eb86a))



<a name="0.20.0"></a>
# [0.20.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.19.2...v0.20.0) (2018-05-07)


### Features

* **common:** CHECKOUT-3075 Remove legacy config mapper ([1762da2](https://github.com/bigcommerce/checkout-sdk-js/commit/1762da2))


### BREAKING CHANGES

* **common:** Now getConfig() returns a different structure.



<a name="0.19.2"></a>
## [0.19.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.19.1...v0.19.2) (2018-05-03)


### Bug Fixes

* **common:** CHECKOUT-3035 Amend config endpoint URL and header ([dd5105a](https://github.com/bigcommerce/checkout-sdk-js/commit/dd5105a))
* **payment:** CHECKOUT-3035 Inject store to PaymentStrategyRegistry so it can lazy load payment configuration ([a13afb5](https://github.com/bigcommerce/checkout-sdk-js/commit/a13afb5))



<a name="0.19.1"></a>
## [0.19.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.19.0...v0.19.1) (2018-05-02)


### Features

* **common:** CHECKOUT-3035 Use checkout setings public endpoint ([85ce289](https://github.com/bigcommerce/checkout-sdk-js/commit/85ce289))



<a name="0.19.0"></a>
# [0.19.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.18.0...v0.19.0) (2018-05-01)


### Bug Fixes

* **payment:** CHECKOUT-2926 Send Square payment data ([476588f](https://github.com/bigcommerce/checkout-sdk-js/commit/476588f))
* **payment:** PAYMENTS-2122 Ensure instrument Id is accessed via the meta object ([76aaa89](https://github.com/bigcommerce/checkout-sdk-js/commit/76aaa89))


### Code Refactoring

* **payment:** CHECKOUT-2951 Define method-specific options for payment initialization. ([80e3c72](https://github.com/bigcommerce/checkout-sdk-js/commit/80e3c72))
* **payment:** CHECKOUT-2951 Pass methodId and gatewayId as options ([fda9e1c](https://github.com/bigcommerce/checkout-sdk-js/commit/fda9e1c))
* **payment:** CHECKOUT-2951 Rename initializePayment and deinitializePayment methods ([d9626cd](https://github.com/bigcommerce/checkout-sdk-js/commit/d9626cd))
* **payment:** CHECKOUT-2951 Update Braintree initialization options ([0b46130](https://github.com/bigcommerce/checkout-sdk-js/commit/0b46130))
* **payment:** CHECKOUT-2951 Update Klarna initialization options ([802fa61](https://github.com/bigcommerce/checkout-sdk-js/commit/802fa61))
* **payment:** CHECKOUT-2951 Update Square payment initialization params ([29c3855](https://github.com/bigcommerce/checkout-sdk-js/commit/29c3855))
* **shipping:** CHECKOUT-2951 Define method-specific options for shipping initialization. ([1ab385d](https://github.com/bigcommerce/checkout-sdk-js/commit/1ab385d))
* **shopper:** CHECKOUT-2951 Define method-specific options for customer initialization. ([2ac93df](https://github.com/bigcommerce/checkout-sdk-js/commit/2ac93df))


### BREAKING CHANGES

* **payment:** `loadCallback` for Klarna Payment has been renamed to
`onLoad`.
* **payment:** `modalHanlder` for Braintree initialization has been
renamed to `threeDSecure`.
* **payment:** Update initialize options for Square payment.
`widgetConfig` key is no longer required. It is now flattened with
`SquarePaymentInitializeOptions`.
* **payment:** Rename `initializePaymentMethod` to
`initializePayment`, and `deinitializePaymentMethod` to
`deinitializePayment`.
* **payment:** Pass `methodId` and `gatewayId` as an object rather
than individual parameters when calling `initializePaymentMethod` and
`deinitializePaymentMethod`.
* **payment:** Method-specific options need to be passed in under a
key named after the method when calling `initializePaymentMethod`.
* **shipping:** Method-specific options need to be passed in under a
key named after the method when calling `initializeShipping`.
* **shopper:** Method-specific options need to be passed in under a
key named after the method when calling `initalizeCustomer`.



<a name="0.18.0"></a>
# [0.18.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.17.2...v0.18.0) (2018-04-12)


### Features

* **common:** CHECKOUT-3035 Initialize config using API ([013cf59](https://github.com/bigcommerce/checkout-sdk-js/commit/013cf59))


### BREAKING CHANGES

* **common:** You now need to initialize CheckoutService calling
loadConfig() method instead of passing a config object..



<a name="0.17.2"></a>
## [0.17.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.17.1...v0.17.2) (2018-04-10)



<a name="0.17.1"></a>
## [0.17.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.17.0...v0.17.1) (2018-04-10)


### Bug Fixes

* **payment:** CHECKOUT-2926 Register Square Payment Strategy ([bd3d19a](https://github.com/bigcommerce/checkout-sdk-js/commit/bd3d19a))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.16.0...v0.17.0) (2018-04-10)


### Bug Fixes

* **payment:** CHECKOUT-2905 Fix redirect issue with AfterPay in Firefox ([b70bdae](https://github.com/bigcommerce/checkout-sdk-js/commit/b70bdae))


### Features

* **payment:** CHECKOUT-2926 Register Square Payment Strategy ([f698908](https://github.com/bigcommerce/checkout-sdk-js/commit/f698908))



<a name="0.16.0"></a>
# [0.16.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.15.1...v0.16.0) (2018-04-06)


### Features

* **checkout:** INT-251 Add WePay strategy ([d98627d](https://github.com/bigcommerce/checkout-sdk-js/commit/d98627d))
* **payment:** CHECKOUT-3030 Braintree PayPal & PayPal Credit ([b79191f](https://github.com/bigcommerce/checkout-sdk-js/commit/b79191f))



<a name="0.15.1"></a>
## [0.15.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.15.0...v0.15.1) (2018-04-03)


### Bug Fixes

* **checkout:** CHECKOUT-3007 Remove unexpected injections ([f08f02e](https://github.com/bigcommerce/checkout-sdk-js/commit/f08f02e))
* **payment:** CHECKOUT-2905 Hold execution to avoid unwanted redirect ([1753b21](https://github.com/bigcommerce/checkout-sdk-js/commit/1753b21))
* **payment:** CHECKOUT-2926 Unregister Square v2 ([0917ca7](https://github.com/bigcommerce/checkout-sdk-js/commit/0917ca7))
* **payment:** CHECKOUT-3007 Fix issue where shoppers cannot submit offsite payment ([c344e9b](https://github.com/bigcommerce/checkout-sdk-js/commit/c344e9b))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.14.0...v0.15.0) (2018-03-29)


### Bug Fixes

* **checkout:** CHECKOUT-2992 Only return new instance if different ([60b25b0](https://github.com/bigcommerce/checkout-sdk-js/commit/60b25b0))
* **checkout:** CHECKOUT-2992 Update cached value if newly computed value is different ([1f40301](https://github.com/bigcommerce/checkout-sdk-js/commit/1f40301))
* **payment:** CHECKOUT-2926 Fix order submission payload for Square ([15cd3df](https://github.com/bigcommerce/checkout-sdk-js/commit/15cd3df))
* **payment:** CHECKOUT-3007 Use `PaymentStrategyActionCreator` to fix getter not returning initialization and execution status correctly ([6b8a9a8](https://github.com/bigcommerce/checkout-sdk-js/commit/6b8a9a8))
* **shipping:** CHECKOUT-3027 Track strategy execution while synchronizing checkout address for Amazon AddressBook widget ([e16cfdc](https://github.com/bigcommerce/checkout-sdk-js/commit/e16cfdc))
* **shipping:** CHECKOUT-3027 Use `ShippingStrategyAction` to fix getter not returning initialization and execution status correctly ([6444bf4](https://github.com/bigcommerce/checkout-sdk-js/commit/6444bf4))
* **shopper:** CHECKOUT-3028 Use `CustomerStrategyActionCreator` to fix getter not returning initialization and execution status correctly ([5aa9bb4](https://github.com/bigcommerce/checkout-sdk-js/commit/5aa9bb4))


### Features

* **checkout:** CHECKOUT-2951 Add ability to destruct getters ([abc7021](https://github.com/bigcommerce/checkout-sdk-js/commit/abc7021))



<a name="0.14.0"></a>
# [0.14.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.13.0...v0.14.0) (2018-03-29)


### Features

* **payment:** CHECKOUT-2644 Braintree Credit Card Strategy ([b21eea6](https://github.com/bigcommerce/checkout-sdk-js/commit/b21eea6))
* **payment:** CHECKOUT-2644 Braintree Mocks ([c8454db](https://github.com/bigcommerce/checkout-sdk-js/commit/c8454db))
* **payment:** CHECKOUT-2644 Braintree Payment Processor ([ddf4b5f](https://github.com/bigcommerce/checkout-sdk-js/commit/ddf4b5f))
* **payment:** CHECKOUT-2644 Braintree Script Loader ([c6c00c3](https://github.com/bigcommerce/checkout-sdk-js/commit/c6c00c3))
* **payment:** CHECKOUT-2644 Braintree SDK Creator ([f040850](https://github.com/bigcommerce/checkout-sdk-js/commit/f040850))
* **payment:** CHECKOUT-2644 Braintree Type Definition ([26ea828](https://github.com/bigcommerce/checkout-sdk-js/commit/26ea828))
* **payment:** CHECKOUT-2644 Type guard methods for CreditCard, TokenizedCreditCard & VaultedIntrument ([47c298b](https://github.com/bigcommerce/checkout-sdk-js/commit/47c298b))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.12.1...v0.13.0) (2018-03-27)


### Features

* **shipping:** CHECKOUT-2964 Allow making phone number required ([e82ebf9](https://github.com/bigcommerce/checkout-sdk-js/commit/e82ebf9))



<a name="0.12.1"></a>
## [0.12.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.12.0...v0.12.1) (2018-03-26)


### Bug Fixes

* **payment:** CHECKOUT-3032 NoPaymentDataRequiredPaymentStrategy is not properly exported ([1495484](https://github.com/bigcommerce/checkout-sdk-js/commit/1495484))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.11.1...v0.12.0) (2018-03-26)


### Features

* **payment:** CHECKOUT-3032 Create a no payment strategy ([83145b3](https://github.com/bigcommerce/checkout-sdk-js/commit/83145b3))



<a name="0.11.1"></a>
## [0.11.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.11.0...v0.11.1) (2018-03-26)

### Chores

* **common:** CHECKOUT-2959 Update location of updated dependencies. ([2846e9a](https://github.com/bigcommerce/checkout-sdk-js/commit/2846e9aad286ee87f31842c9ffaaada4be5686fa))

<a name="0.11.0"></a>
# [0.11.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.10.3...v0.11.0) (2018-03-20)


### Bug Fixes

* **payments:** CHECKOUT-2926 Do not cache failure when loading scripts ([43d33bb](https://github.com/bigcommerce/checkout-sdk-js/commit/43d33bb))


### Features

* **payments:** CHECKOUT-2926 Add Square V2 payment strategy ([81126fa](https://github.com/bigcommerce/checkout-sdk-js/commit/81126fa))



<a name="0.10.3"></a>
## [0.10.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.10.2...v0.10.3) (2018-03-19)


### Bug Fixes

* **PAYMENTS:** PAYMENTS-2590 Release bigpay-client ([aa3b6c3](https://github.com/bigcommerce/checkout-sdk-js/commit/aa3b6c3))



<a name="0.10.2"></a>
## [0.10.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.10.1...v0.10.2) (2018-03-15)


### Bug Fixes

* **payment:** CHECKOUT-3012 Always override `onAmazonLoginReady` and `onAmazonPaymentReady`. ([71b9805](https://github.com/bigcommerce/checkout-sdk-js/commit/71b9805))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.10.0...v0.10.1) (2018-03-14)


### Bug Fixes

* **common:** CHECKOUT-2954 Bump [@bigcommerce](https://github.com/bigcommerce)/data-store to include various fixes ([88bacb5](https://github.com/bigcommerce/checkout-sdk-js/commit/88bacb5))
* **payment:** CHECKOUT-2955 `isInitializingPaymentMethod` should return true while waiting for initialization to complete ([a26884f](https://github.com/bigcommerce/checkout-sdk-js/commit/a26884f))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.9.0...v0.10.0) (2018-03-06)


### Bug Fixes

* **payment:** CHECKOUT-2902 Submit order comments when paying with Afterpay ([5e5b5f2](https://github.com/bigcommerce/checkout-sdk-js/commit/5e5b5f2))


### Features

* **payments:** CHECKOUT-2646 Add support for Klarna payments ([47ee384](https://github.com/bigcommerce/checkout-sdk-js/commit/47ee384))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.8.0...v0.9.0) (2018-02-26)


### Bug Fixes

* **payment:** CHECKOUT-2274 Fix AmazonPay EU and UK script path ([235fec3](https://github.com/bigcommerce/checkout-sdk-js/commit/235fec3))
* **payment:** CHECKOUT-2274 Forward store credit selection to AmazonPay ([090fbb3](https://github.com/bigcommerce/checkout-sdk-js/commit/090fbb3))
* **payment:** CHECKOUT-2274 Make sure AmazonPay AddressBook is initialized before Wallet ([22d4a49](https://github.com/bigcommerce/checkout-sdk-js/commit/22d4a49))
* **payment:** CHECKOUT-2274 Pass order reference id to wallet ([4744769](https://github.com/bigcommerce/checkout-sdk-js/commit/4744769))
* **payment:** CHECKOUT-2274 Remove duplicate callback ([290c593](https://github.com/bigcommerce/checkout-sdk-js/commit/290c593))
* **payment:** CHECKOUT-2274 Resolve promise before executing callback ([cc18120](https://github.com/bigcommerce/checkout-sdk-js/commit/cc18120))
* **payment:** CHECKOUT-2274 Retrieve new Amazon order reference if none is provided ([18dabff](https://github.com/bigcommerce/checkout-sdk-js/commit/18dabff))
* **payment:** CHECKOUT-2274 Return billing initialization status ([daadf84](https://github.com/bigcommerce/checkout-sdk-js/commit/daadf84))
* **payment:** CHECKOUT-2274 Throw error if unable to find wallet container ([c5a40ab](https://github.com/bigcommerce/checkout-sdk-js/commit/c5a40ab))
* **payment:** CHECKOUT-2274 Verify cart before submitting order with AmazonPay ([0cc90dd](https://github.com/bigcommerce/checkout-sdk-js/commit/0cc90dd))
* **shipping:** CHECKOUT-2274 Return AmazonPay address book initialization error ([a9d77a8](https://github.com/bigcommerce/checkout-sdk-js/commit/a9d77a8))
* **shipping:** CHECKOUT-2274 Throw error if unable to find address book container ([5419a92](https://github.com/bigcommerce/checkout-sdk-js/commit/5419a92))
* **shipping:** CHECKOUT-2274 Throw error if unable to synchronize data after selecting shipping / billing address using AmazonPay widgets ([ad25fc0](https://github.com/bigcommerce/checkout-sdk-js/commit/ad25fc0))


### Features

* **customer:** CHECKOUT-2274 Register AmazonPayCustomerRegistry ([14bf20b](https://github.com/bigcommerce/checkout-sdk-js/commit/14bf20b))
* **payment:** CHECKOUT-2274 Register AmazonPayPaymentStrategy ([e6d5b1e](https://github.com/bigcommerce/checkout-sdk-js/commit/e6d5b1e))
* **shipping:** CHECKOUT-2274 Register AmazonPayShippingStrategy ([67fc81a](https://github.com/bigcommerce/checkout-sdk-js/commit/67fc81a))


### Performance Improvements

* **payment:** CHECKOUT-2274 Initialize remote payment just before order submission ([a564429](https://github.com/bigcommerce/checkout-sdk-js/commit/a564429))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.7.0...v0.8.0) (2018-02-23)


### Bug Fixes

* **payment:** CHECKOUT-2647 Send storeCredit flag and verify cart ([b480ff8](https://github.com/bigcommerce/checkout-sdk-js/commit/b480ff8))
* **shopper:** CHECKOUT-2274 Fix `isSigningOut` status getter for `AmazonPay` ([ccd11ec](https://github.com/bigcommerce/checkout-sdk-js/commit/ccd11ec))
* **shopper:** CHECKOUT-2274 Use POST instead of GET for tracking remote checkout authorization event ([67bcc20](https://github.com/bigcommerce/checkout-sdk-js/commit/67bcc20))


### Features

* **billing:** CHECKOUT-2274 Add billing initialization status and error getter ([2fdee2a](https://github.com/bigcommerce/checkout-sdk-js/commit/2fdee2a))
* **forms:** CHECKOUT-2752 Add subdivision array to Countries mock ([b2bbb41](https://github.com/bigcommerce/checkout-sdk-js/commit/b2bbb41))
* **forms:** CHECKOUT-2752 Enrich getShipping/BillingAddressFields to include information about countries/states/postCode/phone ([91aa682](https://github.com/bigcommerce/checkout-sdk-js/commit/91aa682))
* **payment:** CHECKOUT-2274 Add payment initialization status and error getter ([3b71d97](https://github.com/bigcommerce/checkout-sdk-js/commit/3b71d97))
* **shipping:** CHECKOUT-2274 Add shipping initialization status and error getter ([c78ecc1](https://github.com/bigcommerce/checkout-sdk-js/commit/c78ecc1))
* **shopper:** CHECKOUT-2274 Add customer initialization status and error getter ([4abc7cc](https://github.com/bigcommerce/checkout-sdk-js/commit/4abc7cc))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.6.2...v0.7.0) (2018-02-15)


### Bug Fixes

* **checkout:** CHECKOUT-2274 Properly handle `/remote-checkout` responses ([f487a4c](https://github.com/bigcommerce/checkout-sdk-js/commit/f487a4c))
* **payment:** CHECKOUT-2274 Fix AmazonPay widget script path ([df7ed1e](https://github.com/bigcommerce/checkout-sdk-js/commit/df7ed1e))
* **payment:** CHECKOUT-2274 Fix AmazonPay widgets namespace ([4bd92cd](https://github.com/bigcommerce/checkout-sdk-js/commit/4bd92cd))
* **payment:** CHECKOUT-2274 Fix payment registry injection ([8d6c64d](https://github.com/bigcommerce/checkout-sdk-js/commit/8d6c64d))
* **payment:** CHECKOUT-2274 Only create Amazon wallet when ready ([235e8e8](https://github.com/bigcommerce/checkout-sdk-js/commit/235e8e8))
* **payment:** CHECKOUT-2274 Refresh AmazonPay wallet ([59a6bba](https://github.com/bigcommerce/checkout-sdk-js/commit/59a6bba))
* **shipping:** CHECKOUT-2274 Properly handle shipping data from `/remote-checkout` endpoint ([31d1bc6](https://github.com/bigcommerce/checkout-sdk-js/commit/31d1bc6))


### Features

* **common:** CHECKOUT-2416 Add Config Action Creator ([d90feea](https://github.com/bigcommerce/checkout-sdk-js/commit/d90feea))
* **common:** CHECKOUT-2416 Add Config Request Sender ([aa541df](https://github.com/bigcommerce/checkout-sdk-js/commit/aa541df))
* **common:** CHECKOUT-2416 Complete Config Reducer ([e37f8cd](https://github.com/bigcommerce/checkout-sdk-js/commit/e37f8cd))
* **common:** CHECKOUT-2416 Complete Config Selector ([b20374c](https://github.com/bigcommerce/checkout-sdk-js/commit/b20374c))
* **common:** CHECKOUT-2417 Load Config as part of loadCheckout ([5c2dc05](https://github.com/bigcommerce/checkout-sdk-js/commit/5c2dc05))
* **forms:** CHECKOUT-2417 Add Form Selector ([2c0507d](https://github.com/bigcommerce/checkout-sdk-js/commit/2c0507d))
* **forms:** CHECKOUT-2417 Add Load Shipping/Billing Address Fields ([005c465](https://github.com/bigcommerce/checkout-sdk-js/commit/005c465))
* **forms:** CHECKOUT-2417 Countries always contain the subdivision array ([51390fc](https://github.com/bigcommerce/checkout-sdk-js/commit/51390fc))
* **shipping:** CHECKOUT-2274 Add method for initializing shipping address and shipping option provider ([8dc1b6e](https://github.com/bigcommerce/checkout-sdk-js/commit/8dc1b6e))



<a name="0.6.2"></a>
## [0.6.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.6.1...v0.6.2) (2018-02-02)


### Bug Fixes

* **payment:** CHECKOUT-2875 Return `OrderFinalizationNotRequiredError` if not required to finalize when using SagePay or Offsite payment method ([f3a0caf](https://github.com/bigcommerce/checkout-sdk-js/commit/f3a0caf))



<a name="0.6.1"></a>
## [0.6.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.6.0...v0.6.1) (2018-01-29)


### Bug Fixes

* **common:** CHECKOUT-2844 Fix `Object.setPrototypeOf` not available in some browsers ([1966428](https://github.com/bigcommerce/checkout-sdk-js/commit/1966428))
* **common:** CHECKOUT-2851 Use Lodash instead of `Object.assign` to support older browsers ([70f0126](https://github.com/bigcommerce/checkout-sdk-js/commit/70f0126))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.5.1...v0.6.0) (2018-01-24)


### Bug Fixes

* **common:** CHECKOUT-2749 Fix `TimeoutError` not inheriting members of `RequestError` ([d7d19dd](https://github.com/bigcommerce/checkout-sdk-js/commit/d7d19dd))
* **payment:** CHECKOUT-2842 Don't need to check for missing data when constructing payload for payment service ([3784295](https://github.com/bigcommerce/checkout-sdk-js/commit/3784295))
* **payment:** PAYMENTS-2314 Remove hard coded VAT token ([0628095](https://github.com/bigcommerce/checkout-sdk-js/commit/0628095))


### Features

* **payment:** PAYMETNS-2314 Authorise payment with instrument ([2b91c85](https://github.com/bigcommerce/checkout-sdk-js/commit/2b91c85))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.5.0...v0.5.1) (2018-01-18)


### Bug Fixes

* **common:** CHECKOUT-2749 Fix error message concatenation ([3f75f29](https://github.com/bigcommerce/checkout-sdk-js/commit/3f75f29))
* **payment:** CHECKOUT-2749 Fix SagePay 3DS payment flow ([9d47f31](https://github.com/bigcommerce/checkout-sdk-js/commit/9d47f31))
* **payment:** CHECKOUT-2813 Ensure payment strategies are initialized with corresponding method data ([01d692c](https://github.com/bigcommerce/checkout-sdk-js/commit/01d692c))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.4.0...v0.5.0) (2018-01-15)


### Bug Fixes

* **checkout:** CHECKOUT-2749 Throw error if required data is missing ([8a91844](https://github.com/bigcommerce/checkout-sdk-js/commit/8a91844))


### Code Refactoring

* **common:** CHECKOUT-2749 Do not set initial state unless relevant action is triggered ([ddd817b](https://github.com/bigcommerce/checkout-sdk-js/commit/ddd817b))
* **common:** CHECKOUT-2749 Reject with error instead of state ([cfb99c4](https://github.com/bigcommerce/checkout-sdk-js/commit/cfb99c4))


### Features

* **cart:** CHECKOUT-2749 Add specialized error types related to cart ([779d3fe](https://github.com/bigcommerce/checkout-sdk-js/commit/779d3fe))
* **common:** CHECKOUT-2749 Add `TimeoutError` ([9cd5d27](https://github.com/bigcommerce/checkout-sdk-js/commit/9cd5d27))
* **common:** CHECKOUT-2749 Add common custom error types ([bae946a](https://github.com/bigcommerce/checkout-sdk-js/commit/bae946a))
* **common:** CHECKOUT-2749 Transform payload of all failed actions as `Error` instance ([fc00a37](https://github.com/bigcommerce/checkout-sdk-js/commit/fc00a37))
* **order:** CHECKOUT-2749 Add specialized error types related to order ([43fc520](https://github.com/bigcommerce/checkout-sdk-js/commit/43fc520))
* **payment:** CHECKOUT-2749 Add specialized error types related to payment ([91db667](https://github.com/bigcommerce/checkout-sdk-js/commit/91db667))


### BREAKING CHANGES

* **cart:** Return `CartChangedError` when we detect a change in
the cart content of the shopper. Previously we return a simulated server
response, which contains fields such as `body` and `title`. Now it only
contains `message` and `type`. Also, the value of `type` property has
changed to "cart_changed" instead of "changed_cart".
* **common:** Previously, we return an empty object if we try to
retrieve a piece of data that hasn't been fetched remotely. Now, it
returns `undefined` instead.
* **common:** Return with a rejected promise with the thrown error instead of the current state so that clients can inspect the error directly.



<a name="0.4.0"></a>
# [0.4.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.3.0...v0.4.0) (2018-01-08)


### Bug Fixes

* **checkout:** CHECKOUT-2784 Memoize `getCheckoutMeta` ([871a697](https://github.com/bigcommerce/checkout-sdk-js/commit/871a697))
* **common:** CHECKOUT-2419 Ensure selectors return frozen objects unless configured otherwise ([4d59b24](https://github.com/bigcommerce/checkout-sdk-js/commit/4d59b24))
* **order:** CHECKOUT-2784 Memoize `getOrderMeta` ([31bb709](https://github.com/bigcommerce/checkout-sdk-js/commit/31bb709))
* **payment:** PAYMENTS-1983 Increment PATCH version of bigpay-client ([793faf5](https://github.com/bigcommerce/checkout-sdk-js/commit/793faf5))


### Features

* **common:** CHECKOUT-2419 Warn if mutating state ([6c7bd40](https://github.com/bigcommerce/checkout-sdk-js/commit/6c7bd40))
* **common:** CHECKOUT-2784 Add `CacheFactory` ([bfcdc7a](https://github.com/bigcommerce/checkout-sdk-js/commit/bfcdc7a))


### BREAKING CHANGES

* **common:** You now get an error if you try to mutate the any object returned by `CheckoutService` unless you set `shouldWarnMutation` to false.



<a name="0.3.0"></a>
# [0.3.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.2.0...v0.3.0) (2018-01-03)


### Bug Fixes

* **common:** CHECKOUT-2419 Only trigger subscribers if values have changed ([343446a](https://github.com/bigcommerce/checkout-sdk-js/commit/343446a))
* **payment:** CHECKOUT-2789 Add `PaypalProPaymentStrategy` to handle special conditions for Paypal Payments Pro US ([8312877](https://github.com/bigcommerce/checkout-sdk-js/commit/8312877))


### Features

* **payment:** PAYMENTS-2203 Add the ability to delete an instrument ([9a5b8ec](https://github.com/bigcommerce/checkout-sdk-js/commit/9a5b8ec))
* **payment:** PAYMENTS-2203 Add the ability to get instruments ([1a4f179](https://github.com/bigcommerce/checkout-sdk-js/commit/1a4f179))
* **payment:** PAYMENTS-2203 Add the ability to vault an instrument ([8eda640](https://github.com/bigcommerce/checkout-sdk-js/commit/8eda640))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v0.1.0...v0.2.0) (2017-12-21)


### Bug Fixes

* **payment:** PAYMENTS-2275 Skip payment submission if payment is already acknowledged or finalized ([f8ea5d2](https://github.com/bigcommerce/checkout-sdk-js/commit/f8ea5d2))


### Code Refactoring

* **checkout:** CHECKOUT-2756 Rename getLoadQuoteError to getLoadCheckoutError ([dc8cd04](https://github.com/bigcommerce/checkout-sdk-js/commit/dc8cd04))
* **checkout:** CHECKOUT-2756 Rename isLoadingQuote to isLoadingCheckout ([76920f7](https://github.com/bigcommerce/checkout-sdk-js/commit/76920f7))
* **payment:** PAYMENTS-2275 Change method name from isPaymentRequired to isPaymentDataRequired ([ca44355](https://github.com/bigcommerce/checkout-sdk-js/commit/ca44355))


### Features

* **payment:** PAYMENTS-2275 Add isPaymentDataSubmitted method to check if payment is already submitted for current order ([7f9fc5d](https://github.com/bigcommerce/checkout-sdk-js/commit/7f9fc5d))


### BREAKING CHANGES

* **payment:** The new method name should be less ambigious as it is intended to check whether a shopper is required to enter payment details
* **checkout:** To correspond with the loadCheckout method
* **checkout:** To correspond with the loadCheckout method



<a name="0.1.0"></a>
# 0.1.0 (2017-12-19)


### Features

* **checkout:** CHECKOUT-2098 Add CheckoutService and CheckoutClient ([30aa099](https://github.com/bigcommerce/checkout-sdk-js/commit/30aa099))
