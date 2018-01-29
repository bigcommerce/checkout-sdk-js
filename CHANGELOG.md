# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
