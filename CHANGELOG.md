# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
