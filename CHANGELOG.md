# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.60.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.60.0...v1.60.1) (2020-04-22)


### Bug Fixes

* **checkout:** CHECKOUT-4774 Handle no hosted fields to be rendered scenario ([84acf19](https://github.com/bigcommerce/checkout-sdk-js/commit/84acf19))

## [1.60.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.59.0...v1.60.0) (2020-04-16)


### Bug Fixes

* **embedded-checkout:** CHECKOUT-4789 Export createEmbeddedCheckoutMessenger function in embedded-checkout bundle ([d2f9f8c](https://github.com/bigcommerce/checkout-sdk-js/commit/d2f9f8c))


### Features

* **payment:** INT-2410 Add stripe account as configuration ([aa39dc0](https://github.com/bigcommerce/checkout-sdk-js/commit/aa39dc0))

## [1.59.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.58.0...v1.59.0) (2020-04-03)


### Bug Fixes

* **payment:** PAYMENTS-5178 Add hasDefaultStoredInstrument property to PaymentMethodConfig to fix default stored instruments feature ([b2f559b](https://github.com/bigcommerce/checkout-sdk-js/commit/b2f559b))


### Features

* **payment:** INT-2452 Add billing and shipping for klarna ([d264abf](https://github.com/bigcommerce/checkout-sdk-js/commit/d264abf))

## [1.58.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.57.0...v1.58.0) (2020-04-02)


### Bug Fixes

* **common:** CHECKOUT-4789 Apply polyfills to external dependencies for targeted environments ([864fd31](https://github.com/bigcommerce/checkout-sdk-js/commit/864fd31))
* **payment:** INT-2431 Adds expiration date for Bancontact payments ([7249375](https://github.com/bigcommerce/checkout-sdk-js/commit/7249375))


### Features

* **checkout:** INT-2001 Enable support for Store Credit on both versions of Klarna ([b05f46a](https://github.com/bigcommerce/checkout-sdk-js/commit/b05f46a))

## [1.57.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.56.2...v1.57.0) (2020-03-26)


### Features

* **payment:** INT-1710 Add support for ACH & Vipps on Adyen ([76a51ca](https://github.com/bigcommerce/checkout-sdk-js/commit/76a51ca))

### [1.56.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.56.1...v1.56.2) (2020-03-19)


### Bug Fixes

* **payment:** INT-2427 Use ExpiryDate while paying with a vaulted Bancontact card rather than CVV ([1c67049](https://github.com/bigcommerce/checkout-sdk-js/commit/1c67049))

### [1.56.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.56.0...v1.56.1) (2020-03-17)


### Bug Fixes

* **payment:** INT-2418 Use SecurityNumber to validate safeguard ([e9cadb4](https://github.com/bigcommerce/checkout-sdk-js/commit/e9cadb4))

## [1.56.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.55.2...v1.56.0) (2020-03-15)


### Features

* **payment:** INT-1104 Add GooglePay on Auth.net ([98d8090](https://github.com/bigcommerce/checkout-sdk-js/commit/98d8090))

### [1.55.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.55.1...v1.55.2) (2020-03-14)

### [1.55.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.55.0...v1.55.1) (2020-03-13)


### Code Refactoring

* **payment:** INT-2350 Style the object syntax in the test so it can easily be read ([46990e2](https://github.com/bigcommerce/checkout-sdk-js/commit/46990e2))
* **payment:** INT-2350 Use createFromAction for every payment method ([d1a62e9](https://github.com/bigcommerce/checkout-sdk-js/commit/d1a62e9))

## [1.55.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.54.0...v1.55.0) (2020-03-04)


### Bug Fixes

* **shipping:** CHECKOUT-4416 Include custom items IDs when calling CheckoutService#updateShippingAddress ([6ee47c5](https://github.com/bigcommerce/checkout-sdk-js/commit/6ee47c5))
* **shopper:** CHECKOUT-4640 Fix state when consent is provided ([d9bf7f5](https://github.com/bigcommerce/checkout-sdk-js/commit/d9bf7f5))


### Features

* **checkout:** INT-1434 Creating klarnav2 strategy to support multi-option ([c8e4667](https://github.com/bigcommerce/checkout-sdk-js/commit/c8e4667))

## [1.54.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.53.1...v1.54.0) (2020-02-24)


### Features

* **payment:** INT-2062 Support iDEAL & Giropay APM's through AdyenV2 gateway ([1334714](https://github.com/bigcommerce/checkout-sdk-js/commit/1334714))

### [1.53.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.53.0...v1.53.1) (2020-02-24)


### Bug Fixes

* **shopper:** CHECKOUT-4640 Add support for marketing emails consent ([04714a1](https://github.com/bigcommerce/checkout-sdk-js/commit/04714a1))

## [1.53.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.52.1...v1.53.0) (2020-02-21)


### Features

* **payments:** INT-1997 Integrate BlueSnap V2 strategy ([#732](https://github.com/bigcommerce/checkout-sdk-js/issues/732)) ([d2cc31c](https://github.com/bigcommerce/checkout-sdk-js/commit/d2cc31c))

### [1.52.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.52.0...v1.52.1) (2020-02-12)


### Bug Fixes

* **common:** CHECKOUT-4669 Convert buffer to string before comparing with package version ([0f8f411](https://github.com/bigcommerce/checkout-sdk-js/commit/0f8f411))

## [1.52.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.51.1...v1.52.0) (2020-02-11)


### Bug Fixes

* **checkout:** CHECKOUT-4245 handle custom fields for amazon pay ([d7c7273](https://github.com/bigcommerce/checkout-sdk-js/commit/d7c7273))


### Features

* **payment:** CHECKOUT-4669 Create version-specific loader file and reference it in hosted payment form ([4d00281](https://github.com/bigcommerce/checkout-sdk-js/commit/4d00281))

### [1.51.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.51.0...v1.51.1) (2020-02-10)


### Bug Fixes

* **payment:** CHECKOUT-4655 Make Cardinal 3DS work with hosted payment form ([199f19c](https://github.com/bigcommerce/checkout-sdk-js/commit/199f19c))

## [1.51.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.50.2...v1.51.0) (2020-02-09)


### Features

* **payment:** INT-2286 Use credit_card as payment method instead of card ([11c2ad1](https://github.com/bigcommerce/checkout-sdk-js/commit/11c2ad1))

### [1.50.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.50.1...v1.50.2) (2020-02-03)


### Bug Fixes

* **payment:** CHECKOUT-4655 Fix SagePay form post target value ([8f6c7c1](https://github.com/bigcommerce/checkout-sdk-js/commit/8f6c7c1))

### [1.50.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.50.0...v1.50.1) (2020-02-03)


### Bug Fixes

* **payment:** CHECKOUT-4655 Add support for additional card types when validating hosted payment form ([1253191](https://github.com/bigcommerce/checkout-sdk-js/commit/1253191))
* **payment:** CHECKOUT-4655 Rethrow payment request error when paying with hosted payment form ([05ce3fc](https://github.com/bigcommerce/checkout-sdk-js/commit/05ce3fc))
* **payment:** CHECKOUT-4655 Use hosted payment form when paying with SagePay ([08a151e](https://github.com/bigcommerce/checkout-sdk-js/commit/08a151e))

## [1.50.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.49.0...v1.50.0) (2020-02-02)


### Features

* **payment:** INT-1990 Add browser info as part of payload to Adyen V2 ([0a91d66](https://github.com/bigcommerce/checkout-sdk-js/commit/0a91d66))

## [1.49.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.48.0...v1.49.0) (2020-01-23)


### Bug Fixes

* **payment:** CHECKOUT-4205 Reload checkout page if for some reason form expires after initial page load ([444a006](https://github.com/bigcommerce/checkout-sdk-js/commit/444a006))
* **payment:** CHECKOUT-4627 Load fonts required for hosted fields ([5261968](https://github.com/bigcommerce/checkout-sdk-js/commit/5261968))
* **shipping:** CHECKOUT-3818 Update coupon state when shipping option is updated ([e0a9786](https://github.com/bigcommerce/checkout-sdk-js/commit/e0a9786))


### Code Refactoring

* **common:** CHECKOUT-4203 Allow synthetic default imports ([f446753](https://github.com/bigcommerce/checkout-sdk-js/commit/f446753))
* **common:** CHECKOUT-4203 Move iframe event listener and poster to `common` module and add ability to wait for feedback when posting messages ([6d571ce](https://github.com/bigcommerce/checkout-sdk-js/commit/6d571ce))
* **payment:** CHECKOUT-4203 Remove duplicate code ([df03c1b](https://github.com/bigcommerce/checkout-sdk-js/commit/df03c1b))


### Features

* **payment:** CHECKOUT-4203 Add card number and expiry inputs ([8403202](https://github.com/bigcommerce/checkout-sdk-js/commit/8403202))
* **payment:** CHECKOUT-4203 Add factory for creating hosted payment form ([a8b35f5](https://github.com/bigcommerce/checkout-sdk-js/commit/a8b35f5))
* **payment:** CHECKOUT-4203 Add functions for creating hosted inputs ([e42046a](https://github.com/bigcommerce/checkout-sdk-js/commit/e42046a))
* **payment:** CHECKOUT-4203 Add text input element responsible for accepting user input inside iframe ([b460e97](https://github.com/bigcommerce/checkout-sdk-js/commit/b460e97))
* **payment:** CHECKOUT-4203 Export hosted input initializer as separate file ([74b2676](https://github.com/bigcommerce/checkout-sdk-js/commit/74b2676))
* **payment:** CHECKOUT-4203 Submit card details via hosted fields for stored instrument verification ([58cf2d8](https://github.com/bigcommerce/checkout-sdk-js/commit/58cf2d8))
* **payment:** CHECKOUT-4203 Use hosted payment form for credit card payment if feature is enabled ([a0512a1](https://github.com/bigcommerce/checkout-sdk-js/commit/a0512a1))
* **payment:** CHECKOUT-4204 Format credit card field values ([69e717a](https://github.com/bigcommerce/checkout-sdk-js/commit/69e717a))
* **payment:** CHECKOUT-4205 Improve the way validation errors are returned to the caller ([d3701d8](https://github.com/bigcommerce/checkout-sdk-js/commit/d3701d8))
* **payment:** CHECKOUT-4627 Add hosted form to loader ([f0fe47a](https://github.com/bigcommerce/checkout-sdk-js/commit/f0fe47a))

## [1.48.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.47.4...v1.48.0) (2020-01-21)


### Features

* **common:** CHECKOUT-4187 Build distribution files for static server ([e84da54](https://github.com/bigcommerce/checkout-sdk-js/commit/e84da54))

### [1.47.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.47.3...v1.47.4) (2020-01-20)


### Bug Fixes

* **payment:** INT-2140 Unpatch mapToCardInstrument ([dcc5a04](https://github.com/bigcommerce/checkout-sdk-js/commit/dcc5a04))
* **payment:** PAYMENTS-4997 After deleting a PP account from checkout, all accounts with same email are deleted but not removed from available vaulted accounts list unless page is refreshed ([6cc92e0](https://github.com/bigcommerce/checkout-sdk-js/commit/6cc92e0))

### [1.47.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.47.2...v1.47.3) (2020-01-09)


### Bug Fixes

* **payment:** PAYMENTS-5037 Bump bigpay-client version to 5.4.1 ([af98270](https://github.com/bigcommerce/checkout-sdk-js/commit/af98270))

### [1.47.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.47.1...v1.47.2) (2020-01-08)


### Bug Fixes

* **payment:** PAYMENTS-5037 Add Item Unit Price to Line Item object in order payment payload ([1919da1](https://github.com/bigcommerce/checkout-sdk-js/commit/1919da1))

### [1.47.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.47.0...v1.47.1) (2020-01-07)


### Bug Fixes

* **spam-protection:** CHECKOUT-4560 Fix spam protection not working for braintree in non-chrome browsers ([4c2c8ac](https://github.com/bigcommerce/checkout-sdk-js/commit/4c2c8ac))

## [1.47.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.46.2...v1.47.0) (2019-12-30)


### Features

* **payment:** INT-2181 Utilize Adyen Custom Card Components in TSV ([ceebc4d](https://github.com/bigcommerce/checkout-sdk-js/commit/ceebc4d))

### [1.46.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.46.1...v1.46.2) (2019-12-18)


### Bug Fixes

* **payment:** INT-2195 Fix barclaycard supported instrument mapping ([a37e8d7](https://github.com/bigcommerce/checkout-sdk-js/commit/a37e8d7))

### [1.46.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.46.0...v1.46.1) (2019-12-16)


### Bug Fixes

* **billing:** CHECKOUT-4421 Return billing address if it is partially complete ([dd99533](https://github.com/bigcommerce/checkout-sdk-js/commit/dd99533))

## [1.46.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.45.1...v1.46.0) (2019-12-11)


### Features

* **billing:** CHECKOUT-4421 Preselect billing country when no billing address has been set ([1583373](https://github.com/bigcommerce/checkout-sdk-js/commit/1583373))
* **checkout:** INT-1780 Add supported intruments ([8eadd11](https://github.com/bigcommerce/checkout-sdk-js/commit/8eadd11))
* **checkout:** INT-1780 Enable card vaulting for barclaycard ([ee87641](https://github.com/bigcommerce/checkout-sdk-js/commit/ee87641))
* **checkout:** INT-1780 Remove provider specific strategy ([a2d0cbb](https://github.com/bigcommerce/checkout-sdk-js/commit/a2d0cbb))
* **checkout:** INT-1780 Remove unnecessary decosntruction ([6cfbcc2](https://github.com/bigcommerce/checkout-sdk-js/commit/6cfbcc2))
* **checkout:** INT-1780 Remove unused import ([209909e](https://github.com/bigcommerce/checkout-sdk-js/commit/209909e))
* **checkout:** INT-1780 Remove unused interface ([1f7507f](https://github.com/bigcommerce/checkout-sdk-js/commit/1f7507f))
* **checkout:** INT-1780 Send only one param ([2579c84](https://github.com/bigcommerce/checkout-sdk-js/commit/2579c84))
* **checkout:** INT-1780 Send params separately ([c77d4cc](https://github.com/bigcommerce/checkout-sdk-js/commit/c77d4cc))
* **checkout:** INT-1780 Use offsite to pay with instrument ([04315ee](https://github.com/bigcommerce/checkout-sdk-js/commit/04315ee))
* **common:** CHECKOUT-4571 Add StepTracker service ([f4b1dd4](https://github.com/bigcommerce/checkout-sdk-js/commit/f4b1dd4))

### [1.45.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.45.0...v1.45.1) (2019-11-27)

## [1.45.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.44.1...v1.45.0) (2019-11-25)


### Bug Fixes

* **checkout:** CHECKOUT-4513 Add extendedComparisonPrice from API ([a3f56d9](https://github.com/bigcommerce/checkout-sdk-js/commit/a3f56d9))
* **payment:** PAYMENTS-4971 Remove extra keys from Braintree PayPal Tokenize call ([33ef094](https://github.com/bigcommerce/checkout-sdk-js/commit/33ef094))


### Features

* **payment:** INT-1902 Update payment method id and instrument selector to support gateway ([7709c45](https://github.com/bigcommerce/checkout-sdk-js/commit/7709c45))

### [1.44.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.44.0...v1.44.1) (2019-11-25)


### Bug Fixes

* **payment:** PAYMENTS-4971 Remove extra keys from Braintree PayPal Tokenize call ([90755fb](https://github.com/bigcommerce/checkout-sdk-js/commit/90755fb))

## [1.44.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.43.0...v1.44.0) (2019-11-12)


### Features

* **payment:** INT-1902 Support vaulting with instrument_type ([6f77be9](https://github.com/bigcommerce/checkout-sdk-js/commit/6f77be9))

## [1.43.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.42.0...v1.43.0) (2019-11-05)


### Features

* **checkout:** CHECKOUT-4465 Make state/province optional for certain countries based on requireState flag ([d177113](https://github.com/bigcommerce/checkout-sdk-js/commit/d177113))
* **common:** PAYPAL-7 Pass in merchant ID on PayPal button script for PayPal Express Checkout ([dee37aa](https://github.com/bigcommerce/checkout-sdk-js/commit/dee37aa))
* **common:** PAYPAL-7 Pass in merchant ID on PayPal button script for PayPal Express Checkout ([99d4142](https://github.com/bigcommerce/checkout-sdk-js/commit/99d4142))
* **payment:** PAYPAL-7 Pass in merchant ID on PayPal button script for PayPal Express Checkout ([8044df2](https://github.com/bigcommerce/checkout-sdk-js/commit/8044df2))

## [1.42.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.41.0...v1.42.0) (2019-11-04)


### Bug Fixes

* **payment:** INT-1928 map sku in internal line item ([fcb32dd](https://github.com/bigcommerce/checkout-sdk-js/commit/fcb32dd))
* **payment:** PAYMENTS-4704 Send shipping address when checking out using Braintree PayPal ([b047cfe](https://github.com/bigcommerce/checkout-sdk-js/commit/b047cfe))


### Features

* **checkout:** INT-1916 Make barclaycard compatible with offsite strategy ([cdf578b](https://github.com/bigcommerce/checkout-sdk-js/commit/cdf578b))

## [1.41.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.40.0...v1.41.0) (2019-10-28)


### Bug Fixes

* **payment:** PAYMENTS-4616 Add braintree.paypal as a supported instrument ([e532a19](https://github.com/bigcommerce/checkout-sdk-js/commit/e532a19))


### Features

* **shipping:** CHECKOUT-4509 Optional param to include shippings options when updating shipping address ([132075c](https://github.com/bigcommerce/checkout-sdk-js/commit/132075c))

## [1.40.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.39.0...v1.40.0) (2019-10-27)


### Code Refactoring

* **payment:** PAYMENTS-4616 Use an object for paypal configuration ([b743c39](https://github.com/bigcommerce/checkout-sdk-js/commit/b743c39))
* **payment:** PAYMENTS-4616 Use paypal_account for sending paypal information to bigpay ([cd1abbe](https://github.com/bigcommerce/checkout-sdk-js/commit/cd1abbe))


### Features

* **payment:** PAYMENTS-4616 Add support for paying with a vaulted paypal account ([4f98f39](https://github.com/bigcommerce/checkout-sdk-js/commit/4f98f39))
* **payment:** PAYMENTS-4616 Add support for vaulting Paypal Accounts ([6b578ea](https://github.com/bigcommerce/checkout-sdk-js/commit/6b578ea))

## [1.39.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.38.1...v1.39.0) (2019-10-27)


### Bug Fixes

* **checkout:** CHECKOUT-3365 Update cart and checkout state when shipping options are loaded ([05c80bf](https://github.com/bigcommerce/checkout-sdk-js/commit/05c80bf))
* **payment:** PAYMENTS-4759 Make Instrument types backward compatible ([f700b45](https://github.com/bigcommerce/checkout-sdk-js/commit/f700b45))


### Features

* **payment:** PAYMENTS-4759 Add support for filtering instruments ([5dfa155](https://github.com/bigcommerce/checkout-sdk-js/commit/5dfa155))
* **payment:** PAYMENTS-4759 Support for account Instruments ([9fc0e73](https://github.com/bigcommerce/checkout-sdk-js/commit/9fc0e73))

### [1.38.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.38.0...v1.38.1) (2019-10-15)


### Bug Fixes

* **common:** PAYMENTS-4802 Fix ArrayReplace default comparison ([c4f2b19](https://github.com/bigcommerce/checkout-sdk-js/commit/c4f2b19))
* **shipping:** SHIPPING-1384 Extend shipping option interface ([a6a850a](https://github.com/bigcommerce/checkout-sdk-js/commit/a6a850a))


### Code Refactoring

* **common:** CHECKOUT-4455 Upgrade `script-loader` version ([dc5b3e5](https://github.com/bigcommerce/checkout-sdk-js/commit/dc5b3e5))
* **common:** CHECKOUT-4485 Fix inconsistency in import statements by using `eslint-plugin-import` plugin ([71980ef](https://github.com/bigcommerce/checkout-sdk-js/commit/71980ef))
* **common:** CHECKOUT-4485 Use ESLint to enforce use of newline in import statements ([3da456b](https://github.com/bigcommerce/checkout-sdk-js/commit/3da456b))

## [1.38.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.37.2...v1.38.0) (2019-10-08)


### Bug Fixes

* **order:** CHECKOUT-4450 Handle recaptcha challenge not finish loading on slow connection ([62c3f73](https://github.com/bigcommerce/checkout-sdk-js/commit/62c3f73))


### Features

* **payment:** INT-1901 Use modal to handle 3DS for Adyen ([038836f](https://github.com/bigcommerce/checkout-sdk-js/commit/038836f))

### [1.37.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.37.1...v1.37.2) (2019-10-03)


### Bug Fixes

* **order:** CHECKOUT-4450 Fix recaptcha iframe not found for german language ([94cd8a7](https://github.com/bigcommerce/checkout-sdk-js/commit/94cd8a7))

### [1.37.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.37.0...v1.37.1) (2019-10-02)


### Bug Fixes

* **embedded-checkout:** CHECKOUT-4462 Only retry again if sufficient time has passed ([b7567ad](https://github.com/bigcommerce/checkout-sdk-js/commit/b7567ad))
* **embedded-checkout:** CHECKOUT-4462 Only trigger event handler if type matches ([b5263c5](https://github.com/bigcommerce/checkout-sdk-js/commit/b5263c5))

## [1.37.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.36.0...v1.37.0) (2019-09-25)


### Features

* **payment:** ISSUE-640 Add shippingAddress initial param for Braintree PayPal ([09326b5](https://github.com/bigcommerce/checkout-sdk-js/commit/09326b5))

## [1.36.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.35.2...v1.36.0) (2019-09-25)


### Features

* **common:** CHECKOUT-4403 Upgrade to latest Typescript ([65c0468](https://github.com/bigcommerce/checkout-sdk-js/commit/65c0468))
* **payment:** INT-1759 Using same order reference ID when an error occurs ([1a25fb8](https://github.com/bigcommerce/checkout-sdk-js/commit/1a25fb8))

<a name="1.35.2"></a>
## [1.35.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.35.1...v1.35.2) (2019-09-18)


### Bug Fixes

* **shopper:** CHECKOUT-4415 Check if `customerGroup` is defined before accessing it ([bbd43ee](https://github.com/bigcommerce/checkout-sdk-js/commit/bbd43ee))



<a name="1.35.1"></a>
## [1.35.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.35.0...v1.35.1) (2019-09-17)


### Bug Fixes

* **common:** 681 Use Lodash find ([a1ea70b](https://github.com/bigcommerce/checkout-sdk-js/commit/a1ea70b))
* **embedded-checkout:** CHECKOUT-4427 Fix IE11 not returning origin of URL ([7d772bb](https://github.com/bigcommerce/checkout-sdk-js/commit/7d772bb))
* **embedded-checkout:** CHECKOUT-4427 Provide index position when inserting CSS rule for IE11 ([7cfddc7](https://github.com/bigcommerce/checkout-sdk-js/commit/7cfddc7))
* **payment:** CHECKOUT-4418 Upgrade bigpay-client version ([48d65f1](https://github.com/bigcommerce/checkout-sdk-js/commit/48d65f1))
* **payment:** INT-1759 Emit error action when strategy throws error ([cc3084c](https://github.com/bigcommerce/checkout-sdk-js/commit/cc3084c))
* **shopper:** CHECKOUT-4415 Add Customer Group to Customer object in payments payload ([8fad4ea](https://github.com/bigcommerce/checkout-sdk-js/commit/8fad4ea))



<a name="1.35.0"></a>
# [1.35.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.34.3...v1.35.0) (2019-09-12)


### Bug Fixes

* **cart:** CHECKOUT-4315 Add comparisonPrice attribute ([9f4a2c4](https://github.com/bigcommerce/checkout-sdk-js/commit/9f4a2c4))
* **order:** CHECKOUT-4393 Fix could not resubmit order after failed attempt ([9127318](https://github.com/bigcommerce/checkout-sdk-js/commit/9127318))


### Features

* **payment:** CHECKOUT-4263 Support for applying/removing store credit ([fc59792](https://github.com/bigcommerce/checkout-sdk-js/commit/fc59792))
* **payment:** INT-1783 AdyenV2 payment strategy with 3DS2 / 3DS1 flow support ([1551703](https://github.com/bigcommerce/checkout-sdk-js/commit/1551703))



<a name="1.34.3"></a>
## [1.34.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.34.2...v1.34.3) (2019-09-04)


### Bug Fixes

* **embedded-checkout:** CHECKOUT-4388 Mark index file of Embedded Checkout as file with side effects ([d3c528b](https://github.com/bigcommerce/checkout-sdk-js/commit/d3c528b))



<a name="1.34.2"></a>
## [1.34.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.34.1...v1.34.2) (2019-08-29)


### Bug Fixes

* **common:** CHECKOUT-4367 Set error name for StandardError ([59728eb](https://github.com/bigcommerce/checkout-sdk-js/commit/59728eb))
* **common:** CHECKOUT-4367 Stop throwing generic `StandardError` type ([857c04b](https://github.com/bigcommerce/checkout-sdk-js/commit/857c04b))



<a name="1.34.1"></a>
## [1.34.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.34.0...v1.34.1) (2019-08-28)


### Bug Fixes

* **payment:** INT-1829 Remove error validation if no code action is present ([b7e07c7](https://github.com/bigcommerce/checkout-sdk-js/commit/b7e07c7))
* **payment:** INT-1836 Update strategy to support 3ds with vaulting ([44e8ac6](https://github.com/bigcommerce/checkout-sdk-js/commit/44e8ac6))


### Performance Improvements

* **common:** CHECKOUT-4272 Only set up event listeners for iframe resizer when it is in use ([58e0a1e](https://github.com/bigcommerce/checkout-sdk-js/commit/58e0a1e))



<a name="1.34.0"></a>
# [1.34.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.33.0...v1.34.0) (2019-08-14)


### Features

* **payment:** INT-1608 Modify Paypal Payments Pro strategy for 3DS ([6e0d6f0](https://github.com/bigcommerce/checkout-sdk-js/commit/6e0d6f0))



<a name="1.33.0"></a>
# [1.33.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.32.1...v1.33.0) (2019-08-13)


### Features

* **payment:** INT-1811 Fix enrolled card Issue ([f2e1ab0](https://github.com/bigcommerce/checkout-sdk-js/commit/f2e1ab0))



<a name="1.32.1"></a>
## [1.32.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.32.0...v1.32.1) (2019-08-12)


### Bug Fixes

* **common:** CHECKOUT-4321 Fix getters not returning previous cloned objects that are nested inside another even when they are unchanged. ([277a8fe](https://github.com/bigcommerce/checkout-sdk-js/commit/277a8fe))



<a name="1.32.0"></a>
# [1.32.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.31.1...v1.32.0) (2019-08-08)


### Features

* **payment:** INT-1736 Add Reference Id value in the jwt to initialize cardinal and update logic to handle the new Cardinal's Payload ([dc8abe1](https://github.com/bigcommerce/checkout-sdk-js/commit/dc8abe1))



<a name="1.31.1"></a>
## [1.31.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.31.0...v1.31.1) (2019-08-07)


### Bug Fixes

* **common:** CHECKOUT-4272 Fix immutable array replacer as it returns original array instead of merged array ([e02f62b](https://github.com/bigcommerce/checkout-sdk-js/commit/e02f62b))
* **common:** CHECKOUT-4272 Fix unsubscribe function not able to unsubscribe ([537e6d6](https://github.com/bigcommerce/checkout-sdk-js/commit/537e6d6))
* **common:** CHECKOUT-4272 Use another data store as projection instead of plain observable so you can still notify subscribers when subscription filters are applied ([397ab34](https://github.com/bigcommerce/checkout-sdk-js/commit/397ab34))


### Performance Improvements

* **checkout:** CHECKOUT-4272 Add function for creating checkout selectors factory ([f7b3ba5](https://github.com/bigcommerce/checkout-sdk-js/commit/f7b3ba5))
* **checkout:** CHECKOUT-4272 Refactor checkout selector to return new getters only when there are changes to relevant data ([cf77c05](https://github.com/bigcommerce/checkout-sdk-js/commit/cf77c05))
* **checkout:** CHECKOUT-4272 Refactor checkout store data selector to return new getters only when there are changes to relevant data ([7a4d7b7](https://github.com/bigcommerce/checkout-sdk-js/commit/7a4d7b7))
* **checkout:** CHECKOUT-4272 Refactor checkout store error selector to return new getters only when there are changes to relevant data ([9dccc3d](https://github.com/bigcommerce/checkout-sdk-js/commit/9dccc3d))
* **checkout:** CHECKOUT-4272 Refactor checkout store status selector to return new getters only when there are changes to relevant data ([4b0391d](https://github.com/bigcommerce/checkout-sdk-js/commit/4b0391d))
* **checkout:** CHECKOUT-4272 Refactor remote checkout selector to return new getters only when there are changes to relevant data ([db65c75](https://github.com/bigcommerce/checkout-sdk-js/commit/db65c75))
* **checkout:** CHECKOUT-4272 Update checkout reducer to transform state only when necessary ([ed5f6a8](https://github.com/bigcommerce/checkout-sdk-js/commit/ed5f6a8))
* **checkout:** CHECKOUT-4272 Update remote checkout reducer to transform state only when necessary ([76c6a61](https://github.com/bigcommerce/checkout-sdk-js/commit/76c6a61))
* **checkout-button:** CHECKOUT-4272 Refactor checkout button selector to return new getters only when there are changes to relevant data ([6b939af](https://github.com/bigcommerce/checkout-sdk-js/commit/6b939af))
* **checkout-button:** CHECKOUT-4272 Update checkout button reducer to transform state only when necessary ([eacc9a1](https://github.com/bigcommerce/checkout-sdk-js/commit/eacc9a1))
* **common:** CHECKOUT-4272 Add function that can clone return value of function if it is different from previous call ([2b4f7e2](https://github.com/bigcommerce/checkout-sdk-js/commit/2b4f7e2))
* **common:** CHECKOUT-4272 Refactor config selector to return new getters only when there are changes to relevant data ([f055ab0](https://github.com/bigcommerce/checkout-sdk-js/commit/f055ab0))
* **common:** CHECKOUT-4272 Refactor country selector to return new getters only when there are changes to relevant data ([83d9ca3](https://github.com/bigcommerce/checkout-sdk-js/commit/83d9ca3))
* **common:** CHECKOUT-4272 Refactor form selector to return new getters only when there are changes to relevant data ([7489058](https://github.com/bigcommerce/checkout-sdk-js/commit/7489058))
* **common:** CHECKOUT-4272 Update config reducer to transform state only when necessary ([74805a6](https://github.com/bigcommerce/checkout-sdk-js/commit/74805a6))
* **common:** CHECKOUT-4272 Update country reducer to transform state only when necessary ([2bdae4c](https://github.com/bigcommerce/checkout-sdk-js/commit/2bdae4c))
* **payment:** CHECKOUT-4272 Refactor instrument selector to return new getters only when there are changes to relevant data ([655d298](https://github.com/bigcommerce/checkout-sdk-js/commit/655d298))
* **payment:** CHECKOUT-4272 Refactor payment method selector to return new getters only when there are changes to relevant data ([f5bddc4](https://github.com/bigcommerce/checkout-sdk-js/commit/f5bddc4))
* **payment:** CHECKOUT-4272 Refactor payment selector to return new getters only when there are changes to relevant data ([c35b0a1](https://github.com/bigcommerce/checkout-sdk-js/commit/c35b0a1))
* **payment:** CHECKOUT-4272 Refactor payment strategy selector to return new getters only when there are changes to relevant data ([1c419e7](https://github.com/bigcommerce/checkout-sdk-js/commit/1c419e7))
* **payment:** CHECKOUT-4272 Update instrument reducer to transform state only when necessary ([6543213](https://github.com/bigcommerce/checkout-sdk-js/commit/6543213))
* **payment:** CHECKOUT-4272 Update payment method reducer to transform state only when necessary ([a6dbba9](https://github.com/bigcommerce/checkout-sdk-js/commit/a6dbba9))
* **payment:** CHECKOUT-4272 Update payment strategy reducer to transform state only when necessary ([dfda886](https://github.com/bigcommerce/checkout-sdk-js/commit/dfda886))
* **shipping:** CHECKOUT-4272 Refactor consignment selector to return new getters only when there are changes to relevant data ([87ad888](https://github.com/bigcommerce/checkout-sdk-js/commit/87ad888))
* **shipping:** CHECKOUT-4272 Refactor shipping address selector to return new getters only when there are changes to relevant data ([c18b8de](https://github.com/bigcommerce/checkout-sdk-js/commit/c18b8de))
* **shipping:** CHECKOUT-4272 Refactor shipping country selector to return new getters only when there are changes to relevant data ([698ee10](https://github.com/bigcommerce/checkout-sdk-js/commit/698ee10))
* **shipping:** CHECKOUT-4272 Refactor shipping strategy selector to return new getters only when there are changes to relevant data ([974972f](https://github.com/bigcommerce/checkout-sdk-js/commit/974972f))
* **shipping:** CHECKOUT-4272 Update consignment reducer to transform state only when necessary ([511311b](https://github.com/bigcommerce/checkout-sdk-js/commit/511311b))
* **shipping:** CHECKOUT-4272 Update shipping country reducer to transform state only when necessary ([4319777](https://github.com/bigcommerce/checkout-sdk-js/commit/4319777))
* **shipping:** CHECKOUT-4272 Update shipping strategy reducer to transform state only when necessary ([a032432](https://github.com/bigcommerce/checkout-sdk-js/commit/a032432))
* **shopper:** CHECKOUT-4272 Refactor customer selector to return new getters only when there are changes to relevant data ([f27f763](https://github.com/bigcommerce/checkout-sdk-js/commit/f27f763))
* **shopper:** CHECKOUT-4272 Refactor customer strategy selector to return new getters only when there are changes to relevant data ([80a24e3](https://github.com/bigcommerce/checkout-sdk-js/commit/80a24e3))
* **shopper:** CHECKOUT-4272 Update customer reducer to transform state only when necessary ([87e0b56](https://github.com/bigcommerce/checkout-sdk-js/commit/87e0b56))
* **shopper:** CHECKOUT-4272 Update customer strategy reducer to transform state only when necessary ([8b86d8a](https://github.com/bigcommerce/checkout-sdk-js/commit/8b86d8a))



<a name="1.31.0"></a>
# [1.31.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.30.0...v1.31.0) (2019-08-04)


### Bug Fixes

* **payment:** CHECKOUT-4273 Fix PayPal Express modal does not load when recaptcha is enabled ([b4f2054](https://github.com/bigcommerce/checkout-sdk-js/commit/b4f2054))


### Features

* **payment:** INT-1768 Payment Intent creation refactor ([ba07314](https://github.com/bigcommerce/checkout-sdk-js/commit/ba07314))


### Performance Improvements

* **billing:** CHECKOUT-4272 Refactor billing selector to return new getters only when there are changes to relevant data ([fe78e6d](https://github.com/bigcommerce/checkout-sdk-js/commit/fe78e6d))
* **billing:** CHECKOUT-4272 Update billing reducer to transform state only when necessary ([8d49c5a](https://github.com/bigcommerce/checkout-sdk-js/commit/8d49c5a))
* **cart:** CHECKOUT-4272 Refactor cart selector to return new getters only when there are changes to relevant data ([5bb0b94](https://github.com/bigcommerce/checkout-sdk-js/commit/5bb0b94))
* **cart:** CHECKOUT-4272 Update cart reducer to transform state only when necessary ([1e9d658](https://github.com/bigcommerce/checkout-sdk-js/commit/1e9d658))
* **checkout:** CHECKOUT-4272 Add function for creating internal checkout selectors factory ([722a09a](https://github.com/bigcommerce/checkout-sdk-js/commit/722a09a))
* **checkout:** CHECKOUT-4272 Refactor coupon selector to return new getters only when there are changes to relevant data ([39b69fc](https://github.com/bigcommerce/checkout-sdk-js/commit/39b69fc))
* **checkout:** CHECKOUT-4272 Refactor gift certificate selector to return new getters only when there are changes to relevant data ([2d53e4d](https://github.com/bigcommerce/checkout-sdk-js/commit/2d53e4d))
* **checkout:** CHECKOUT-4272 Update coupon reducer to transform state only when necessary ([daaa59a](https://github.com/bigcommerce/checkout-sdk-js/commit/daaa59a))
* **checkout:** CHECKOUT-4272 Update gift certificate reducer to transform state only when necessary ([ef9d7c2](https://github.com/bigcommerce/checkout-sdk-js/commit/ef9d7c2))
* **common:** CHECKOUT-4272 Add shallow equal selector creator for creating selectors that does shallow comparison instead of strict comparison ([7a313e1](https://github.com/bigcommerce/checkout-sdk-js/commit/7a313e1))
* **common:** CHECKOUT-4272 Add size limit to cache key resolver ([d6dd84b](https://github.com/bigcommerce/checkout-sdk-js/commit/d6dd84b))
* **common:** CHECKOUT-4272 Add utility functions for transforming data in reducers ([d3a1505](https://github.com/bigcommerce/checkout-sdk-js/commit/d3a1505))
* **common:** CHECKOUT-4272 Avoid doing another round of transformation for subscription filters ([d4fb957](https://github.com/bigcommerce/checkout-sdk-js/commit/d4fb957))
* **order:** CHECKOUT-4272 Refactor order selector to return new getters only when there are changes to relevant data ([6e20543](https://github.com/bigcommerce/checkout-sdk-js/commit/6e20543))
* **order:** CHECKOUT-4272 Update order reducer to transform state only when necessary ([d79afec](https://github.com/bigcommerce/checkout-sdk-js/commit/d79afec))



<a name="1.30.0"></a>
# [1.30.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.29.0...v1.30.0) (2019-07-29)


### Features

* **payment:** INT-1650 Adding IIN field to vaulted instrument strategy ([19ae743](https://github.com/bigcommerce/checkout-sdk-js/commit/19ae743))



<a name="1.29.0"></a>
# [1.29.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.28.0...v1.29.0) (2019-07-25)


### Features

* **common:** CHECKOUT-4272 Bind methods to object instances to allow destructing ([8acd3f9](https://github.com/bigcommerce/checkout-sdk-js/commit/8acd3f9))
* **payment:** INT-1577 Support Stored Credit Card (vaulting) for Stripe V3 ([9bc1657](https://github.com/bigcommerce/checkout-sdk-js/commit/9bc1657))



<a name="1.28.0"></a>
# [1.28.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.27.4...v1.28.0) (2019-07-22)


### Features

* **checkout:** INT-1586 Support Amazon Pay 3DS flow ([#616](https://github.com/bigcommerce/checkout-sdk-js/pull/616))



<a name="1.27.4"></a>
## [1.27.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.27.3...v1.27.4) (2019-07-19)


### Bug Fixes

* **common:** CHECKOUT-4201 Make FormField type easier to consume ([92eaa12](https://github.com/bigcommerce/checkout-sdk-js/commit/92eaa12))



<a name="1.27.3"></a>
## [1.27.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.27.2...v1.27.3) (2019-07-17)


### Bug Fixes

* **common:** CHECKOUT-4201 Match SDK types with API payloads ([be3a59e](https://github.com/bigcommerce/checkout-sdk-js/commit/be3a59e))



<a name="1.27.2"></a>
## [1.27.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.27.1...v1.27.2) (2019-07-16)


### Bug Fixes

* **common:** CHECKOUT-4254 Make sure changes to the public object don't affect the internal copies ([4447212](https://github.com/bigcommerce/checkout-sdk-js/commit/4447212))



<a name="1.27.1"></a>
## [1.27.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.27.0...v1.27.1) (2019-07-10)


### Bug Fixes

* **common:** CHECKOUT-4165 Add names to custom error objects ([c1505d1](https://github.com/bigcommerce/checkout-sdk-js/commit/c1505d1))



<a name="1.27.0"></a>
# [1.27.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.26.0...v1.27.0) (2019-07-08)


### Features

* **order:** CHECKOUT-2530 Add support for invisible recaptcha ([ee9aca5](https://github.com/bigcommerce/checkout-sdk-js/commit/ee9aca5))



<a name="1.26.0"></a>
# [1.26.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.25.2...v1.26.0) (2019-07-04)


### Features

* **payment:** INT-1479 Create CyberSource strategy ([54dc4f3](https://github.com/bigcommerce/checkout-sdk-js/commit/54dc4f3))



<a name="1.25.2"></a>
## [1.25.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.25.1...v1.25.2) (2019-06-26)


### Bug Fixes

* **payment:** CHECKOUT-3954 Use the redirect method instead of display when initialising AfterPay ([665e9f2](https://github.com/bigcommerce/checkout-sdk-js/commit/665e9f2))
* **payment:** CHECKOUT-4209 Throw `OrderFinalizationNotRequiredError` if payment method is no longer available for shopper ([fb2386d](https://github.com/bigcommerce/checkout-sdk-js/commit/fb2386d))



<a name="1.25.1"></a>
## [1.25.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.25.0...v1.25.1) (2019-06-21)


### Bug Fixes

* **shipping:** CHECKOUT-4160 Return new object in reducer ([bac88c1](https://github.com/bigcommerce/checkout-sdk-js/commit/bac88c1))



<a name="1.25.0"></a>
# [1.25.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.23.0...v1.25.0) (2019-06-20)


### Features

* **checkout:** CHECKOUT-3670 adding parentId to LineItem interface ([dfa639e](https://github.com/bigcommerce/checkout-sdk-js/commit/dfa639e))
* **payment:** INT-1450 Add support for Stripe V3 + 3DS using Payment Intents ([#570](https://github.com/bigcommerce/checkout-sdk-js/issues/570)) ([cc9b242](https://github.com/bigcommerce/checkout-sdk-js/commit/cc9b242))



<a name="1.24.0"></a>
# [1.24.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.23.1...v1.24.0) (2019-06-19)


### Features

* **payment:** INT-1450 Add support for Stripe V3 + 3DS using Payment Intents ([#570](https://github.com/bigcommerce/checkout-sdk-js/issues/570)) ([cc9b242](https://github.com/bigcommerce/checkout-sdk-js/commit/cc9b242))



<a name="1.23.1"></a>
## [1.23.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.23.0...v1.23.1) (2019-06-12)



<a name="1.23.0"></a>
# [1.23.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.22.0...v1.23.0) (2019-06-11)


### Features

* **checkout:** INT-1503 Add categories to items for Affirm strategy ([3387459](https://github.com/bigcommerce/checkout-sdk-js/commit/3387459))



<a name="1.22.0"></a>
# [1.22.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.21.0...v1.22.0) (2019-06-05)


### Bug Fixes

* **payment:** INT-1573 [Klarna feedback] Checkout load error ([1c3b5d8](https://github.com/bigcommerce/checkout-sdk-js/commit/1c3b5d8))
* **payment:** PAYMENTS-4228 implement separate session with currency and default to store currency if shopper currency is non-transactional ([bacafee](https://github.com/bigcommerce/checkout-sdk-js/commit/bacafee))
* **payment:** PAYMENTS-4228 removing unused cases of currency code and allowing code to be optional ([6cf0785](https://github.com/bigcommerce/checkout-sdk-js/commit/6cf0785))


### Features

* **checkout:** INT-1520 Pass useStoreCredit flag when initialize payment ([979c59e](https://github.com/bigcommerce/checkout-sdk-js/commit/979c59e))
* **order:** CHECKOUT-2530 Add spam protection for order creation ([69efabc](https://github.com/bigcommerce/checkout-sdk-js/commit/69efabc))
* **payment:** INT-1247 Checkout using Zip, Registration referred ([f9a1da4](https://github.com/bigcommerce/checkout-sdk-js/commit/f9a1da4))
* **payment:** INT-1540 Zip Feedback, declined Handler ([d140b85](https://github.com/bigcommerce/checkout-sdk-js/commit/d140b85))
* **payment:** INT-1562 Add billing and shipping data in auth instead of load call ([967cb12](https://github.com/bigcommerce/checkout-sdk-js/commit/967cb12))
* **payment:** PAYMENTS-4228 include currency code in vaulted instrument functionality ([2438db5](https://github.com/bigcommerce/checkout-sdk-js/commit/2438db5))



<a name="1.21.0"></a>
# [1.21.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.20.2...v1.21.0) (2019-05-23)


### Bug Fixes

* **checkout-button:** CHECKOUT-4137 Include Babel polyfills to UMD bundles so they work in older browsers ([fa5604a](https://github.com/bigcommerce/checkout-sdk-js/commit/fa5604a))
* **common:** CHECKOUT-4137 Bump data-store version to fix issue with object freeze ([3f0245d](https://github.com/bigcommerce/checkout-sdk-js/commit/3f0245d))
* **common:** INT-1500 Fix integer conversion rounding error ([aa3b18b](https://github.com/bigcommerce/checkout-sdk-js/commit/aa3b18b))
* **payment:** INT-1500 Pass all amounts in cents for Affirm and add platform metadata information ([2c5622b](https://github.com/bigcommerce/checkout-sdk-js/commit/2c5622b))


### Features

* **checkout:** INT-1552 Sending klarna the phone number ([804652f](https://github.com/bigcommerce/checkout-sdk-js/commit/804652f))
* **payment:** INT-1464 Port Elavon ng-checkout only implementation to checkout-sdk-js + ng-checkout ([b7ebba5](https://github.com/bigcommerce/checkout-sdk-js/commit/b7ebba5))



<a name="1.20.2"></a>
## [1.20.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.20.1...v1.20.2) (2019-05-08)


### Bug Fixes

* **common:** CHECKOUT-4062 Fix broken dep ([d8937d6](https://github.com/bigcommerce/checkout-sdk-js/commit/d8937d6))



<a name="1.20.1"></a>
## [1.20.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.20.0...v1.20.1) (2019-05-07)


### Bug Fixes

* **payment:** CHECKOUT-4062 Expose missing payment errors ([e8b4987](https://github.com/bigcommerce/checkout-sdk-js/commit/e8b4987))



<a name="1.20.0"></a>
# [1.20.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.19.0...v1.20.0) (2019-04-27)


### Features

* **payment:** INT-1398 Add shipping and billing address before Klarna authorization ([577601e](https://github.com/bigcommerce/checkout-sdk-js/commit/577601e))



<a name="1.19.0"></a>
# [1.19.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.12...v1.19.0) (2019-04-11)


### Features

* **checkout:** INT-1245 Checkout Using Zip ([c13ba54](https://github.com/bigcommerce/checkout-sdk-js/commit/c13ba54))
* **payment:** INT-1293 integrate affirm strategy ([858ad16](https://github.com/bigcommerce/checkout-sdk-js/commit/858ad16))



<a name="1.18.12"></a>
## [1.18.12](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.11...v1.18.12) (2019-04-04)


### Bug Fixes

* **payment:** INT-1412 Fix masterpass submitPayment payload to allow analytics tracking ([04ec083](https://github.com/bigcommerce/checkout-sdk-js/commit/04ec083))



<a name="1.18.11"></a>
## [1.18.11](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.10...v1.18.11) (2019-04-01)


### Bug Fixes

* **common:** CHECKOUT-1289 Fix config and checkout types ([135a239](https://github.com/bigcommerce/checkout-sdk-js/commit/135a239))
* **payment:** PAYMENTS-1253 Pass order amount to Braintree client when going through 3DS flow ([07909fe](https://github.com/bigcommerce/checkout-sdk-js/commit/07909fe))
* **payment:** PAYMENTS-1253 Pass store credit amount to PayPal ([112cda9](https://github.com/bigcommerce/checkout-sdk-js/commit/112cda9))
* **payment:** PAYMENTS-1253 Show overlay when Braintree PayPal modal is open ([9756fdb](https://github.com/bigcommerce/checkout-sdk-js/commit/9756fdb))
* **payment:** PAYMENTS-1253 Throw cancellation error when shopper closes PayPal popup ([6859fd6](https://github.com/bigcommerce/checkout-sdk-js/commit/6859fd6))



<a name="1.18.10"></a>
## [1.18.10](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.9...v1.18.10) (2019-03-28)


### Bug Fixes

* **cart:** CHECKOUT-4012 Use `productId` and `variantId` to sort items in cart ([4e2ab5b](https://github.com/bigcommerce/checkout-sdk-js/commit/4e2ab5b))



<a name="1.18.9"></a>
## [1.18.9](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.8...v1.18.9) (2019-03-25)


### Bug Fixes

* **cart:** CHECKOUT-3844 Ignore order of line items when comparing cart content ([51e4c6e](https://github.com/bigcommerce/checkout-sdk-js/commit/51e4c6e))
* **payment:** CHECKOUT-3844 Don't throw error if no payment data is passed for offsite payment methods ([b0615cb](https://github.com/bigcommerce/checkout-sdk-js/commit/b0615cb))



<a name="1.18.8"></a>
## [1.18.8](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.7...v1.18.8) (2019-03-18)


### Bug Fixes

* **payment:** INT-1360 Bump BigPay client. ([ea7849d](https://github.com/bigcommerce/checkout-sdk-js/commit/ea7849d))



<a name="1.18.7"></a>
## [1.18.7](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.6...v1.18.7) (2019-03-11)


### Bug Fixes

* **common:** CHECKOUT-3967 Round properly when using CurrencyService ([14439bc](https://github.com/bigcommerce/checkout-sdk-js/commit/14439bc))



<a name="1.18.6"></a>
## [1.18.6](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.5...v1.18.6) (2019-03-07)


### Bug Fixes

* **payment:** CHECKOUT-3852 Expose proper error type for Coupon/Gift Certificates ([2dd5713](https://github.com/bigcommerce/checkout-sdk-js/commit/2dd5713))



<a name="1.18.5"></a>
## [1.18.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.4...v1.18.5) (2019-03-06)


### Bug Fixes

* **embedded-checkout:** CHECKOUT-3941 Post `frame_error` without target origin so that parent window can receive it in case the error is due to issue with current cart ([3354334](https://github.com/bigcommerce/checkout-sdk-js/commit/3354334))
* **embedded-checkout:** CHECKOUT-3941 Redirect user to allow third party cookie to be set ([b7137f6](https://github.com/bigcommerce/checkout-sdk-js/commit/b7137f6))



<a name="1.18.4"></a>
## [1.18.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.3...v1.18.4) (2019-02-26)


### Bug Fixes

* **payment:** PAYMENTS-4034 catch error when nonce return 400, squarev2 ([8211bb7](https://github.com/bigcommerce/checkout-sdk-js/commit/8211bb7))



<a name="1.18.3"></a>
## [1.18.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.2...v1.18.3) (2019-02-21)


### Bug Fixes

* **checkout-button:** PAYMENTS-3071 Use the specified endpoint for paypal payment creation ([cffc8be](https://github.com/bigcommerce/checkout-sdk-js/commit/cffc8be))



<a name="1.18.2"></a>
## [1.18.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.1...v1.18.2) (2019-02-15)


### Bug Fixes

* **payment:** CHECKOUT-3843 `ccNumber` and `ccCvv` should be string instead of number ([625aff9](https://github.com/bigcommerce/checkout-sdk-js/commit/625aff9))



<a name="1.18.1"></a>
## [1.18.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.18.0...v1.18.1) (2019-02-15)


### Bug Fixes

* **checkout:** CHECKOUT-3843 Add missing `isTrustedShippingAddressEnabled` field ([b102359](https://github.com/bigcommerce/checkout-sdk-js/commit/b102359))
* **payment:** CHECKOUT-3843 Add missing `ccCustomerCode` field ([72d24c0](https://github.com/bigcommerce/checkout-sdk-js/commit/72d24c0))



<a name="1.18.0"></a>
# [1.18.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.17.3...v1.18.0) (2019-02-05)


### Bug Fixes

* **order:** CHECKOUT-3850 make customItems optional ([bc79317](https://github.com/bigcommerce/checkout-sdk-js/commit/bc79317))
* **payment:** CHECKOUT-3843 Add missing properties to `PaymentMethodConfig` ([f0e96d7](https://github.com/bigcommerce/checkout-sdk-js/commit/f0e96d7))
* **payment:** CHECKOUT-3843 Fix type definition for `VaultedInstrument` ([7f81d37](https://github.com/bigcommerce/checkout-sdk-js/commit/7f81d37))


### Features

* **common:** CHECKOUT-3914 Add isAnalyticsEnabled to checkout settings ([7b597c1](https://github.com/bigcommerce/checkout-sdk-js/commit/7b597c1))



<a name="1.17.3"></a>
## [1.17.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.17.2...v1.17.3) (2019-01-30)


### Bug Fixes

* **shipping:** CHECKOUT-3890 Rehydrate shipping options after applying coupon ([6d7609a](https://github.com/bigcommerce/checkout-sdk-js/commit/6d7609a))



<a name="1.17.2"></a>
## [1.17.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.17.1...v1.17.2) (2019-01-22)


### Bug Fixes

* **payment:** CHECKOUT-3842 Add missing field in `PaymentMethodConfig` interface ([e08a813](https://github.com/bigcommerce/checkout-sdk-js/commit/e08a813))
* **payment:** CHECKOUT-3842 Remove `ccType` from order submission payload ([a3832ef](https://github.com/bigcommerce/checkout-sdk-js/commit/a3832ef))
* **payment:** INT-1079 Transaction rbits are no longer being sent to WePay in the /checkout/create call ([836f4d6](https://github.com/bigcommerce/checkout-sdk-js/commit/836f4d6))
* **payment:** INT-1079 Update unit testing and mocks ([f8b74ee](https://github.com/bigcommerce/checkout-sdk-js/commit/f8b74ee))



<a name="1.17.1"></a>
## [1.17.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.17.0...v1.17.1) (2019-01-14)


### Bug Fixes

* **billing:** CHECKOUT-3790 Return correct type for billing addresses ([e4818db](https://github.com/bigcommerce/checkout-sdk-js/commit/e4818db))



<a name="1.17.0"></a>
# [1.17.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.16.1...v1.17.0) (2019-01-10)


### Features

* **checkout:** CHECKOUT-3798 Add loginLink to the configuration endpoint type definition ([a4c9e33](https://github.com/bigcommerce/checkout-sdk-js/commit/a4c9e33))
* **common:** CHECKOUT-3790 Add ability to clear error state ([6429e56](https://github.com/bigcommerce/checkout-sdk-js/commit/6429e56))
* **common:** CHECKOUT-3798 Throw CheckoutNotAvailable if the response is in the 400 range ([c2d296e](https://github.com/bigcommerce/checkout-sdk-js/commit/c2d296e))



<a name="1.16.1"></a>
## [1.16.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.16.0...v1.16.1) (2018-12-17)


### Bug Fixes

* **checkout-button:** CHECKOUT-3804 Set unique container ID if not provided by client ([4ce80d8](https://github.com/bigcommerce/checkout-sdk-js/commit/4ce80d8))
* **common:** CHECKOUT-3790 Add missing properties to `StoreLinks` object ([dfacf03](https://github.com/bigcommerce/checkout-sdk-js/commit/dfacf03))



<a name="1.16.0"></a>
# [1.16.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.15.1...v1.16.0) (2018-12-11)


### Bug Fixes

* **common:** CHECKOUT-3787 Generate TS definition files for submodules ([b6ff269](https://github.com/bigcommerce/checkout-sdk-js/commit/b6ff269))
* **payment:** CHECKOUT-3797 Surface transaction_declined error message ([0530ada](https://github.com/bigcommerce/checkout-sdk-js/commit/0530ada))


### Features

* **payment:** INT-1051 Masterpass callback url post launch ([5f42772](https://github.com/bigcommerce/checkout-sdk-js/commit/5f42772))
* **payment:** INT-1138 Fix shipping address bug in google pay ([a0924c4](https://github.com/bigcommerce/checkout-sdk-js/commit/a0924c4))



<a name="1.15.1"></a>
## [1.15.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.15.0...v1.15.1) (2018-12-05)


### Bug Fixes

* **common:** CHECKOUT-3135 Upgrade Rx to version 6 to bring in various performance improvements and bug fixes ([56132a9](https://github.com/bigcommerce/checkout-sdk-js/commit/56132a9))
* **common:** CHECKOUT-3768 Surface the error details for RequestErrors ([58361e1](https://github.com/bigcommerce/checkout-sdk-js/commit/58361e1))



<a name="1.15.0"></a>
# [1.15.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.14.0...v1.15.0) (2018-11-29)


### Bug Fixes

* **checkout-button:** CHECKOUT-3747 Post form data to host URL ([c7f12e6](https://github.com/bigcommerce/checkout-sdk-js/commit/c7f12e6))
* **checkout-button:** PAYMENTS-3071 Use the specified host for the paypal payment creation endpoint ([9d2590d](https://github.com/bigcommerce/checkout-sdk-js/commit/9d2590d))
* **common:** CHECKOUT-3462 Bump `[@bigcommerce](https://github.com/bigcommerce)/data-store` version ([e3ac1c2](https://github.com/bigcommerce/checkout-sdk-js/commit/e3ac1c2))
* **common:** CHECKOUT-3777 Upgrade dependencies that may have potential security vulnerabilities ([5faf8e5](https://github.com/bigcommerce/checkout-sdk-js/commit/5faf8e5))
* **embedded-checkout:** CHECKOUT-3481 Allow cross-origin iframe to invoke payment request API ([ed18528](https://github.com/bigcommerce/checkout-sdk-js/commit/ed18528))
* **payment:** INT-1080 Round totalPrice to 2 decimals ([44e5cbb](https://github.com/bigcommerce/checkout-sdk-js/commit/44e5cbb))
* **payment:** INT-1119 Modify approach in Checkout Button Strategies to consume unique ids ([1a5e955](https://github.com/bigcommerce/checkout-sdk-js/commit/1a5e955))


### Features

* **checkout:** INT-1073 Populate shipping info from Masterpass on Stripe ([9a3c561](https://github.com/bigcommerce/checkout-sdk-js/commit/9a3c561))
* **common:** CHECKOUT-2934 Return unified RequestError object ([cae7d23](https://github.com/bigcommerce/checkout-sdk-js/commit/cae7d23))
* **common:** CHECKOUT-3462 Add `cacheAction` decorator for caching asynchronous actions ([f2927fc](https://github.com/bigcommerce/checkout-sdk-js/commit/f2927fc))
* **embedded-checkout:** CHECKOUT-3677 Notify parent frame when customer signs out ([278be01](https://github.com/bigcommerce/checkout-sdk-js/commit/278be01))
* **embedded-checkout:** CHECKOUT-3703 Notify client if unable to sign in shopper using token ([f87f2d6](https://github.com/bigcommerce/checkout-sdk-js/commit/f87f2d6))
* **embedded-checkout:** CHECKOUT-3706 Switch to different height calculation method if `contentId` is provided. ([6fbc88e](https://github.com/bigcommerce/checkout-sdk-js/commit/6fbc88e))
* **payment:** CHECKOUT-3481 Opt into redirect flow for PayPal Express ([3406112](https://github.com/bigcommerce/checkout-sdk-js/commit/3406112))
* **payment:** INT-1092 Update map variables of Braintree in GooglePay ([a38edee](https://github.com/bigcommerce/checkout-sdk-js/commit/a38edee))
* **payment:** PAYMENTS-3663 enable default instrument property ([9a14c2c](https://github.com/bigcommerce/checkout-sdk-js/commit/9a14c2c))


### Performance Improvements

* **checkout-button:** CHECKOUT-3462 Allow checkout buttons with different container ID to initialize in parallel ([4be6a94](https://github.com/bigcommerce/checkout-sdk-js/commit/4be6a94))
* **common:** CHECKOUT-3462 Apply `cacheAction` decorator to certain actions ([3920168](https://github.com/bigcommerce/checkout-sdk-js/commit/3920168))



<a name="1.14.0"></a>
# [1.14.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.13.0...v1.14.0) (2018-11-04)


### Features

* **checkout-button:** INT-856 Add checkout button to support GooglePay provided by Stripe ([32f241c](https://github.com/bigcommerce/checkout-sdk-js/commit/32f241c))



<a name="1.13.0"></a>
# [1.13.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.12.0...v1.13.0) (2018-11-02)


### Features

* **payment:** PAYMENTS-3071 Support the Paypal checkout button strategy for smart buttons ([6f4d31d](https://github.com/bigcommerce/checkout-sdk-js/commit/6f4d31d))



<a name="1.12.0"></a>
# [1.12.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.11.0...v1.12.0) (2018-11-01)


### Features

* **checkout:** CP-4020 Added Product Category to cart & checkout process. ([6ed6799](https://github.com/bigcommerce/checkout-sdk-js/commit/6ed6799))



<a name="1.11.0"></a>
# [1.11.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.10.1...v1.11.0) (2018-10-31)


### Bug Fixes

* **embedded-checkout:** CHECKOUT-3695 Ignore trailing slash and other irrelevant information when comparing event origin ([#448](https://github.com/bigcommerce/checkout-sdk-js/issues/448)) ([c9b80b3](https://github.com/bigcommerce/checkout-sdk-js/commit/c9b80b3))


### Features

* **checkout-button:** INT-836 Add checkout button to support GooglePay provided by Braintree ([95e3732](https://github.com/bigcommerce/checkout-sdk-js/commit/95e3732))
* **checkout-button:** PAYMENTS-3073 Support credit buttons by implementing funding sources ([5dff675](https://github.com/bigcommerce/checkout-sdk-js/commit/5dff675))



<a name="1.10.1"></a>
## [1.10.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.10.0...v1.10.1) (2018-10-25)


### Bug Fixes

* **common:** CHECKOUT-3688 Prevent Lodash from leaking to global scope ([#444](https://github.com/bigcommerce/checkout-sdk-js/issues/444)) ([ac5238b](https://github.com/bigcommerce/checkout-sdk-js/commit/ac5238b))



<a name="1.10.0"></a>
# [1.10.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.9.0...v1.10.0) (2018-10-25)


### Features

* **checkout:** INT-951 Implement Masterpass button in cart and quick cart ([724eff5](https://github.com/bigcommerce/checkout-sdk-js/commit/724eff5))

### Bug Fixes

* **checkout-button:** CHECKOUT-3584 Allow rendering checkout buttons more than once (#443) ([8c479c8](https://github.com/bigcommerce/checkout-sdk-js/commit/8c479c87cb06e9c8919bcc8b0b930d3a2c00fa2d)).

 :warning: **Important:** Includes breaking changes in checkout buttons options (alpha stage).


<a name="1.9.0"></a>
# [1.9.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.8.0...v1.9.0) (2018-10-23)


### Bug Fixes

* **common:** CHECKOUT-1739 Fix mocks linting issues ([990a2c6](https://github.com/bigcommerce/checkout-sdk-js/commit/990a2c6))


### Features

* **cart:** CHECKOUT-1739 Add custom items types to cart type ([7821329](https://github.com/bigcommerce/checkout-sdk-js/commit/7821329))
* **embedded-checkout:** CHECKOUT-3475 Add ability to embed checkout form as iframe ([#441](https://github.com/bigcommerce/checkout-sdk-js/issues/441)) ([0215fe9](https://github.com/bigcommerce/checkout-sdk-js/commit/0215fe9))



<a name="1.8.0"></a>
# [1.8.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.7.0...v1.8.0) (2018-10-19)


### Features

* **cart:** CP-4013 Add `brand` property to `LineItem` interface ([#409](https://github.com/bigcommerce/checkout-sdk-js/issues/409)) ([fd43113](https://github.com/bigcommerce/checkout-sdk-js/commit/fd43113))
* **payment:** INT-774 Add stripe strategy ([b7af881](https://github.com/bigcommerce/checkout-sdk-js/commit/b7af881))
* **payment:** INT-835 Add Google Pay + Braintree support ([201f0ae](https://github.com/bigcommerce/checkout-sdk-js/commit/201f0ae))
* **shipping:** CHECKOUT-3589 Allow unassigning items from consignments ([445d5af](https://github.com/bigcommerce/checkout-sdk-js/commit/445d5af))



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
