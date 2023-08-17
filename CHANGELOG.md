# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.427.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.426.1...v1.427.0) (2023-08-17)


### Features

* **payment:** PAYPAL-2854 updated braintree sdk with new alpha version ([#2119](https://github.com/bigcommerce/checkout-sdk-js/issues/2119)) ([48ee142](https://github.com/bigcommerce/checkout-sdk-js/commit/48ee14270625e911e3d0eb2cea25d3b548486ed7))


### Code Refactoring

* **payment:** PAYPAL-2852 removed implementation that stores customers data to local storage BT AXO ([#2123](https://github.com/bigcommerce/checkout-sdk-js/issues/2123)) ([f73cd25](https://github.com/bigcommerce/checkout-sdk-js/commit/f73cd25c2e0a43bd4df8abd04c5587d46ceda5db))

### [1.426.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.426.0...v1.426.1) (2023-08-16)


### Bug Fixes

* **payment:** PAYPAL-000 fixed backup payment method loading for braintree accelerated checkout strategies ([#2118](https://github.com/bigcommerce/checkout-sdk-js/issues/2118)) ([94d3297](https://github.com/bigcommerce/checkout-sdk-js/commit/94d32973d50b55116672374a5115cae0818f85ce))

## [1.426.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.425.0...v1.426.0) (2023-08-16)


### Features

* **checkout:** PI-286 added bigpayToken to the loadPaymentMethod params ([497920e](https://github.com/bigcommerce/checkout-sdk-js/commit/497920e0edcd91fe4434b15b9e09ee13dabc6de4))
* **checkout:** PI-286 bluesnapdirect 3ds for stored cards without hosted fields ([2999e44](https://github.com/bigcommerce/checkout-sdk-js/commit/2999e442ccbddb6582c4b0af3f1b8c500f39243d))

## [1.425.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.424.0...v1.425.0) (2023-08-16)


### Features

* **payment:** PAYPAL-2758 PayLater Messages ([#2076](https://github.com/bigcommerce/checkout-sdk-js/issues/2076)) ([bddff2f](https://github.com/bigcommerce/checkout-sdk-js/commit/bddff2f3914740e7584d51ebe1af6d3e908a7627))


### Code Refactoring

* **payment:** PAYPAL-2855 updated core and braintree packages with braintree sdk version from braintree-utils package ([#2117](https://github.com/bigcommerce/checkout-sdk-js/issues/2117)) ([c469cb8](https://github.com/bigcommerce/checkout-sdk-js/commit/c469cb8b288c675d92983b57029b6d983a62cc6f))

## [1.424.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.423.0...v1.424.0) (2023-08-15)


### Features

* **payment:** PAYPAL-2827 add a condition to check when to run PayPal Connect authentication flow in BT customer strategy (A/B testing coverage) ([#2108](https://github.com/bigcommerce/checkout-sdk-js/issues/2108)) ([e46bfa6](https://github.com/bigcommerce/checkout-sdk-js/commit/e46bfa69cd2a3678746cda5f6a55e43c6e1a4edf))

## [1.423.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.422.0...v1.423.0) (2023-08-14)


### Features

* **payment:** PAYPAL-2847 created braintree-utils package ([#2114](https://github.com/bigcommerce/checkout-sdk-js/issues/2114)) ([6d481b6](https://github.com/bigcommerce/checkout-sdk-js/commit/6d481b6976331792cd704b1029fe9f9ca87400db))

## [1.422.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.421.1...v1.422.0) (2023-08-14)


### Features

* **payment:** PAYPAL-2828 added shipping and billing address selected with PayPal AXO address after OTP ([#2112](https://github.com/bigcommerce/checkout-sdk-js/issues/2112)) ([2363a3e](https://github.com/bigcommerce/checkout-sdk-js/commit/2363a3efd6f8f198733585ca3319f153a95b0091))

### [1.421.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.421.0...v1.421.1) (2023-08-10)

## [1.421.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.420.0...v1.421.0) (2023-08-09)


### Features

* **payment:** PAYPAL-000 updated paypal connect address mapper to receive CustomerAddress instead of Address ([#2101](https://github.com/bigcommerce/checkout-sdk-js/issues/2101)) ([bb01b20](https://github.com/bigcommerce/checkout-sdk-js/commit/bb01b201d84abe0d6ee9d088b916bf074dab4744))

## [1.420.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.419.0...v1.420.0) (2023-08-08)


### Features

* **payment:** PAYPAL-2692 removed this.paypalSdk ([f2b56f3](https://github.com/bigcommerce/checkout-sdk-js/commit/f2b56f3c636ca3e43083945b6d24aed64aeea254))

## [1.419.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.418.1...v1.419.0) (2023-08-08)


### Features

* **payment:** PAYPAL-2737 updated Braintree AXO strategy with vaulted instruments implementation ([#2098](https://github.com/bigcommerce/checkout-sdk-js/issues/2098)) ([4b98c9e](https://github.com/bigcommerce/checkout-sdk-js/commit/4b98c9e617ca55a696d3c204915595a8019cc42e))

### [1.418.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.418.0...v1.418.1) (2023-08-08)

## [1.418.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.417.0...v1.418.0) (2023-08-07)


### Features

* **extension:** CHECKOUT-7611 Notify extension when consignment changes ([61c0626](https://github.com/bigcommerce/checkout-sdk-js/commit/61c0626a5408a8edaed6832b16c1fd6a115fe65e))
* **extension:** CHECKOUT-7611 Notify extension when shipping country changes ([cf181b2](https://github.com/bigcommerce/checkout-sdk-js/commit/cf181b2533c62b9ca6dd089e3112b29fbc058456))


### Code Refactoring

* **extension:** CHECKOUT-7611 Pass public selectors to state change subscribers ([8128e92](https://github.com/bigcommerce/checkout-sdk-js/commit/8128e927a040d62892e99c295733515a9f05368d))
* **extension:** CHECKOUT-7611 Remove shipping country change event ([d170b3a](https://github.com/bigcommerce/checkout-sdk-js/commit/d170b3a6a7cd31743e247544b837049dcf6c2cd9))
* **payment:** PAYPAL-2813 created BraintreeAcceleratedCheckoutUtils class ([#2096](https://github.com/bigcommerce/checkout-sdk-js/issues/2096)) ([b7b053b](https://github.com/bigcommerce/checkout-sdk-js/commit/b7b053bbaa0e86c1f4f5de83566c159871efe29e))

## [1.417.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.416.0...v1.417.0) (2023-08-03)


### Features

* **payment:** PAYPAL-2797 pass customers data to local storage after authentication (Braintree AXO) ([#2092](https://github.com/bigcommerce/checkout-sdk-js/issues/2092)) ([1d2f287](https://github.com/bigcommerce/checkout-sdk-js/commit/1d2f287997b3808b2ac04c36bf38c0b6447172fa))

## [1.416.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.415.1...v1.416.0) (2023-08-03)


### Features

* **payment:** PAYPAL-2804 added country to each PayPal Connect customer address to use it on client side for BT AXO ([#2094](https://github.com/bigcommerce/checkout-sdk-js/issues/2094)) ([c695c5a](https://github.com/bigcommerce/checkout-sdk-js/commit/c695c5a4ba23adf6c3571c02ac262008617cccdc))

### [1.415.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.415.0...v1.415.1) (2023-08-03)


### Code Refactoring

* **checkout:** CHECKOUT-7634 Improvements for extension ([#2085](https://github.com/bigcommerce/checkout-sdk-js/issues/2085)) ([ba44288](https://github.com/bigcommerce/checkout-sdk-js/commit/ba44288e9a0fa9c9ac8869a66c8a6b1b20866c4c))

## [1.415.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.414.0...v1.415.0) (2023-08-02)


### Features

* **payment:** PAYPAL-2803 made an ability to use getCountries method in integration packages ([#2093](https://github.com/bigcommerce/checkout-sdk-js/issues/2093)) ([ce1419f](https://github.com/bigcommerce/checkout-sdk-js/commit/ce1419fa5d380da9aca8de803374fc01508413f3))

## [1.414.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.413.0...v1.414.0) (2023-08-02)


### Features

* **payment:** PAYPAL-1545 added paypalcommerce ratepay payment strategy ([#2040](https://github.com/bigcommerce/checkout-sdk-js/issues/2040)) ([47387ac](https://github.com/bigcommerce/checkout-sdk-js/commit/47387aca1c5de298e5ef6e3e85666a87f934631c))

## [1.413.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.412.0...v1.413.0) (2023-08-02)


### Features

* **payment:** PAYPAL-000 add an ability to use getPaymentProviderCustomer method on the client side ([#2090](https://github.com/bigcommerce/checkout-sdk-js/issues/2090)) ([8be3788](https://github.com/bigcommerce/checkout-sdk-js/commit/8be3788a3ba55c0531d7b99340416f05045bbb57))

## [1.412.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.411.0...v1.412.0) (2023-08-01)


### Features

* **payment:** PAYPAL-000 created storage package ([#2086](https://github.com/bigcommerce/checkout-sdk-js/issues/2086)) ([c818675](https://github.com/bigcommerce/checkout-sdk-js/commit/c818675b5a98d438654f35195c51d2c138c9369d))
* **payment:** PAYPAL-2727 added Braintree Accelerated Checkout customer strategy ([#2078](https://github.com/bigcommerce/checkout-sdk-js/issues/2078)) ([475633a](https://github.com/bigcommerce/checkout-sdk-js/commit/475633a56cccb13a80275be735131f602c16aa36))
* **payment:** PAYPAL-2727 added Braintree Accelerated Checkout customer strategy ([#2087](https://github.com/bigcommerce/checkout-sdk-js/issues/2087)) ([913aa28](https://github.com/bigcommerce/checkout-sdk-js/commit/913aa282393187eae2d8cd73976a094f1014586f))

## [1.411.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.410.0...v1.411.0) (2023-07-31)


### Features

* **payment:** PAYPAL-2731 added PaymentProviderCustomer state ([#2075](https://github.com/bigcommerce/checkout-sdk-js/issues/2075)) ([83ae13d](https://github.com/bigcommerce/checkout-sdk-js/commit/83ae13d873730dd613edf157ac44b2784681a878))

## [1.410.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.409.0...v1.410.0) (2023-07-31)


### Features

* **payment:** PAYPAL-2725 updated braintree sdk to newest alpha version ([#2082](https://github.com/bigcommerce/checkout-sdk-js/issues/2082)) ([7e630bb](https://github.com/bigcommerce/checkout-sdk-js/commit/7e630bb7e493507001ff710a468b615b017e65f7))
* **payment:** PAYPAL-2725 updated braintree sdk to newest alpha version (core part) ([#2083](https://github.com/bigcommerce/checkout-sdk-js/issues/2083)) ([b8a9061](https://github.com/bigcommerce/checkout-sdk-js/commit/b8a9061f01cceb29884a76bdd3594d560f87bef6))

## [1.409.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.408.0...v1.409.0) (2023-07-27)


### Features

* **payment:** PI-585 Make an ability to use loadCurrentOrder action from core package in integration checkout-sdk packages ([#2077](https://github.com/bigcommerce/checkout-sdk-js/issues/2077)) ([56daa7a](https://github.com/bigcommerce/checkout-sdk-js/commit/56daa7a6d4ff02ec4d30b02da4be35fe088c8e7c))

## [1.408.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.407.0...v1.408.0) (2023-07-26)


### Features

* **checkout:** CHECKOUT-000 Update client side interfaces ([#2079](https://github.com/bigcommerce/checkout-sdk-js/issues/2079)) ([0ce1123](https://github.com/bigcommerce/checkout-sdk-js/commit/0ce11237a51a1f071177b3252491fd9b817f7206))

## [1.407.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.406.1...v1.407.0) (2023-07-25)


### Features

* **payment:** PAYPAL-2744 fixed cart amout for order for BT LPM ([#2080](https://github.com/bigcommerce/checkout-sdk-js/issues/2080)) ([ae738f3](https://github.com/bigcommerce/checkout-sdk-js/commit/ae738f3fd6afab902afdd8429c08a6fde50a9b71))

### [1.406.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.406.0...v1.406.1) (2023-07-25)


### Bug Fixes

* **payment:** PAYPAL-2634 removed redundant code, added updateShouldThrowInvalidError ([9ecf5fb](https://github.com/bigcommerce/checkout-sdk-js/commit/9ecf5fbee50c87996ec32b998c5ccc71dacb556a))

## [1.406.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.405.2...v1.406.0) (2023-07-24)


### Features

* **payment:** PAYPAL-2726 added BraintreeAcceleratedCheckout payment strategy ([#2068](https://github.com/bigcommerce/checkout-sdk-js/issues/2068)) ([0a07d3c](https://github.com/bigcommerce/checkout-sdk-js/commit/0a07d3c5867839717358043313e85b771667d57b))

### [1.405.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.405.1...v1.405.2) (2023-07-20)


### Code Refactoring

* **checkout:** CHECKOUT-7624 Update extension-related naming ([#2069](https://github.com/bigcommerce/checkout-sdk-js/issues/2069)) ([41af8df](https://github.com/bigcommerce/checkout-sdk-js/commit/41af8df893c19183ea5feb31a4afd4229803220c))

### [1.405.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.405.0...v1.405.1) (2023-07-20)

## [1.405.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.404.0...v1.405.0) (2023-07-20)


### Features

* **payment:** PAYPAL-2725 added an ability to switch braintree sdk version (core part) ([#2065](https://github.com/bigcommerce/checkout-sdk-js/issues/2065)) ([29d5451](https://github.com/bigcommerce/checkout-sdk-js/commit/29d54510ef69590bfd697b580594784ed487b5f7))
* **payment:** PAYPAL-2725 added an ability to switch braintree sdk version to alpha due to the settings in cp ([#2063](https://github.com/bigcommerce/checkout-sdk-js/issues/2063)) ([94a4ce3](https://github.com/bigcommerce/checkout-sdk-js/commit/94a4ce3093b770fdfc6a21d96b6ee2908255adc5))

## [1.404.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.403.0...v1.404.0) (2023-07-19)


### Features

* **checkout:** CHECKOUT-7595 Add client extension service ([#2056](https://github.com/bigcommerce/checkout-sdk-js/issues/2056)) ([c04106a](https://github.com/bigcommerce/checkout-sdk-js/commit/c04106afba0c341b9a76d4341cc98542d32dc7a7))

## [1.403.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.402.1...v1.403.0) (2023-07-19)


### Features

* **order:** ORDERS-5715 add OrderFee interface, add fees field to Order interface ([#2066](https://github.com/bigcommerce/checkout-sdk-js/issues/2066)) ([9b09886](https://github.com/bigcommerce/checkout-sdk-js/commit/9b0988619bca9c690f853ab9089d64c74643f885))

### [1.402.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.402.0...v1.402.1) (2023-07-17)


### Bug Fixes

* **payment:** PAYPAL-2719 fix amazon pay button ([de1cb81](https://github.com/bigcommerce/checkout-sdk-js/commit/de1cb81bd278fbb81782d4dfb32db6b1370291c8))

## [1.402.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.401.0...v1.402.0) (2023-07-17)


### Features

* **payment:** PAYPAL-2720 Fixed BT LPM cart amount ([#2058](https://github.com/bigcommerce/checkout-sdk-js/issues/2058)) ([5fb2488](https://github.com/bigcommerce/checkout-sdk-js/commit/5fb2488bf386a56d9249130051f066240ba93e4a))

## [1.401.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.400.0...v1.401.0) (2023-07-16)


### Features

* **checkout:** CHECKOUT-7538 Introduce extension messenger and command handler ([#2050](https://github.com/bigcommerce/checkout-sdk-js/issues/2050)) ([b43adec](https://github.com/bigcommerce/checkout-sdk-js/commit/b43adecf32105a6a7bf9451e4c80fd0beb77eae2))

## [1.400.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.399.2...v1.400.0) (2023-07-13)


### Features

* **payment:** PI-502 Fortis package ([8032101](https://github.com/bigcommerce/checkout-sdk-js/commit/80321015800e869b8d98d0fa95fb77580db8f25a))

### [1.399.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.399.1...v1.399.2) (2023-07-13)


### Bug Fixes

* **payment:** PAYPAL-2502 bump braintree sdk version ([33970f0](https://github.com/bigcommerce/checkout-sdk-js/commit/33970f05d41175cb163a1a18c8c5129d4e732036))

### [1.399.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.399.0...v1.399.1) (2023-07-13)


### Bug Fixes

* upgrade yup from 1.1.1 to 1.2.0 ([#2049](https://github.com/bigcommerce/checkout-sdk-js/issues/2049)) ([259d88c](https://github.com/bigcommerce/checkout-sdk-js/commit/259d88c27a1bb20bfdb7a4eb9d9836e3211ef3f4))

## [1.399.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.398.2...v1.399.0) (2023-07-10)


### Features

* **payment:** PAYPAL-2476 added TS interface for updateOrder method in PPCP request sender ([#2033](https://github.com/bigcommerce/checkout-sdk-js/issues/2033)) ([10c2e8f](https://github.com/bigcommerce/checkout-sdk-js/commit/10c2e8faeb397cee1e9cc3104f1a5cb939c38356))

### [1.398.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.398.1...v1.398.2) (2023-07-06)


### Bug Fixes

* **checkout:** PI-00 fix pending promise for bluesnapdirect APMs iframe ([9acdde7](https://github.com/bigcommerce/checkout-sdk-js/commit/9acdde7c9ce1bd11f3c81d07e87c72c7454de2eb))

### [1.398.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.398.0...v1.398.1) (2023-07-05)

## [1.398.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.397.0...v1.398.0) (2023-07-05)


### Features

* **payment:** PAYPAL-2690 added braintree ach vaulting instrument confirmation feature ([#2044](https://github.com/bigcommerce/checkout-sdk-js/issues/2044)) ([f15657d](https://github.com/bigcommerce/checkout-sdk-js/commit/f15657d0c0648f8d1749fa1f4e0d2b5e5c257074))

## [1.397.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.396.1...v1.397.0) (2023-07-04)


### Features

* **checkout:** PI-168 bluesnapdirect APMs ([9e2dd90](https://github.com/bigcommerce/checkout-sdk-js/commit/9e2dd903f05716065a9716f4378292743cbb967e))

### [1.396.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.396.0...v1.396.1) (2023-07-04)


### Bug Fixes

* **order:** DATA-11056 Populate category names for BODL purchase event ([#2042](https://github.com/bigcommerce/checkout-sdk-js/issues/2042)) ([0715960](https://github.com/bigcommerce/checkout-sdk-js/commit/0715960f6b9aa7b87886dbe0e343b3ad1aa079cd)), closes [#2032](https://github.com/bigcommerce/checkout-sdk-js/issues/2032) [#2038](https://github.com/bigcommerce/checkout-sdk-js/issues/2038)

## [1.396.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.395.4...v1.396.0) (2023-07-04)


### Features

* **checkout:** CHECKOUT-7534 Add fees field ([e19484a](https://github.com/bigcommerce/checkout-sdk-js/commit/e19484a8b7a751e5fa8bb8df065752d91367d13d))
* **checkout:** CHECKOUT-7534 removed optional ([783e498](https://github.com/bigcommerce/checkout-sdk-js/commit/783e4983e9553842988b9b3f507b9da4524e5cae))

### [1.395.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.395.3...v1.395.4) (2023-07-03)


### Bug Fixes

* **payment:** PAYPAL-2634 fixed issue when teardown is called twice ([61792c7](https://github.com/bigcommerce/checkout-sdk-js/commit/61792c7db01f983bee5beb0b7a8f87e4716832e0))

### [1.395.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.395.2...v1.395.3) (2023-06-30)

### [1.395.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.395.1...v1.395.2) (2023-06-29)

### [1.395.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.395.0...v1.395.1) (2023-06-28)


### Bug Fixes

* **order:** DATA-11056 Populate category names for BODL purchase event ([#2032](https://github.com/bigcommerce/checkout-sdk-js/issues/2032)) ([3afd61a](https://github.com/bigcommerce/checkout-sdk-js/commit/3afd61a3228760f1aa3ae84e9074a58ecd210194))

## [1.395.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.394.1...v1.395.0) (2023-06-28)


### Features

* **checkout:** CHECKOUT-7537 Render extensions ([#2028](https://github.com/bigcommerce/checkout-sdk-js/issues/2028)) ([c52e6cd](https://github.com/bigcommerce/checkout-sdk-js/commit/c52e6cdb3c0c93dc8d7a2fe51bf2680fa9b31126))

### [1.394.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.394.0...v1.394.1) (2023-06-27)


### Bug Fixes

* **payment:** PAYPAL-2502 revert braintree sdk bump version ([#2031](https://github.com/bigcommerce/checkout-sdk-js/issues/2031)) ([753aaed](https://github.com/bigcommerce/checkout-sdk-js/commit/753aaedab5f046e71eb8504d21eb0a992083e44d))

## [1.394.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.393.2...v1.394.0) (2023-06-22)


### Features

* **payment:** PI-34 [AmazonPay] Update Amazon Pay to use the latest button design ([#1997](https://github.com/bigcommerce/checkout-sdk-js/issues/1997)) ([105a353](https://github.com/bigcommerce/checkout-sdk-js/commit/105a35380792fde9f0063b232ed972e5dbb62500))

### [1.393.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.393.1...v1.393.2) (2023-06-22)


### Bug Fixes

* **payment:** PAYPAL-2634 fixed issue when teardown is called twice ([bd46bf2](https://github.com/bigcommerce/checkout-sdk-js/commit/bd46bf2417f17d0780b98859865d9a7a783560c7))

### [1.393.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.393.0...v1.393.1) (2023-06-22)

## [1.393.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.392.0...v1.393.0) (2023-06-22)


### Features

* **checkout:** CHECKOUT-7536 Load extensions ([#2020](https://github.com/bigcommerce/checkout-sdk-js/issues/2020)) ([54c93a6](https://github.com/bigcommerce/checkout-sdk-js/commit/54c93a69ec1b4bf065e21fb93eda43cdd6529177))

## [1.392.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.391.0...v1.392.0) (2023-06-21)


### Features

* **payment:** PAYPAL-2645 fixed submit button for braintree lpm ([#2022](https://github.com/bigcommerce/checkout-sdk-js/issues/2022)) ([579b34e](https://github.com/bigcommerce/checkout-sdk-js/commit/579b34e92d45cb42082624a3769c6b8c6c124cae))

## [1.391.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.390.0...v1.391.0) (2023-06-21)


### Features

* **checkout:** DATA-10908 DATA-10928 Add shipping and payment detailsprovided events for BODL ([#2019](https://github.com/bigcommerce/checkout-sdk-js/issues/2019)) ([e7040f9](https://github.com/bigcommerce/checkout-sdk-js/commit/e7040f9a5eeec564b4ab6514960c786ee6dc3749))
* **payment:** CHECKOUT-7504 Enable recaptcha for apple pay ([#2011](https://github.com/bigcommerce/checkout-sdk-js/issues/2011)) ([5c2cc35](https://github.com/bigcommerce/checkout-sdk-js/commit/5c2cc352ee7eb49b904080836ad0a9838ef24dd2))


### Bug Fixes

* **checkout:** DATA-10908 Fix failing bodl unit tests ([#2024](https://github.com/bigcommerce/checkout-sdk-js/issues/2024)) ([4ace117](https://github.com/bigcommerce/checkout-sdk-js/commit/4ace117bb7946609bf67ea18ad80e18800efdb41))

## [1.390.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.389.0...v1.390.0) (2023-06-20)


### Features

* **payment:** PI-120 Autofilling of holderName to be configurable ([a6ae531](https://github.com/bigcommerce/checkout-sdk-js/commit/a6ae5315d003d748b539371af19835a38c56e3ef))

## [1.389.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.388.2...v1.389.0) (2023-06-20)


### Features

* **payment:** PAYPAL-2502 bump Braintree sdk version ([8ee7c0f](https://github.com/bigcommerce/checkout-sdk-js/commit/8ee7c0fbd18f9f367a56d8d32332259a3c1a94ef))

### [1.388.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.388.1...v1.388.2) (2023-06-14)


### Bug Fixes

* **checkout:** PI-294 adyen v3 stored card pay fix, after adding klarna pay widget ([58c7936](https://github.com/bigcommerce/checkout-sdk-js/commit/58c79366059947f5aa9dcb52bdcf3b24f3fb1364))

### [1.388.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.388.0...v1.388.1) (2023-06-14)


### Bug Fixes

* **payment:** PAYPAL-2602 changed getting the billing address ([2bf81ed](https://github.com/bigcommerce/checkout-sdk-js/commit/2bf81ed5cff0f2aacb4f65039bbfc3b0b15bfe1f))
* **payment:** PAYPAL-2618 updated payment payload ([46e375b](https://github.com/bigcommerce/checkout-sdk-js/commit/46e375b02e034d805774a85d92cd78f3ddf1247a))

## [1.388.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.387.0...v1.388.0) (2023-06-13)


### Features

* **checkout:** PI-42 bluesnap direct credit card vaulting ([8c4de76](https://github.com/bigcommerce/checkout-sdk-js/commit/8c4de76df61dcc0e72365629ae5dbad15ce24031))

## [1.387.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.386.1...v1.387.0) (2023-06-13)


### Features

* **payment:** PAYPAL-2449 fixed preloader ([#2015](https://github.com/bigcommerce/checkout-sdk-js/issues/2015)) ([8b1d202](https://github.com/bigcommerce/checkout-sdk-js/commit/8b1d202b9753728ad9dd5de5e82ddb6b735aac20))

### [1.386.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.386.0...v1.386.1) (2023-06-12)


### Bug Fixes

* **payment:** INT-7650 retrieve payment intent if an error is caught at the time of confirming the payment ([c0bd053](https://github.com/bigcommerce/checkout-sdk-js/commit/c0bd0538a5ec22d6a46b64149700caa6b89acb21))

## [1.386.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.385.0...v1.386.0) (2023-06-07)


### Features

* **payment:** PAYPAL-2451 ACH vaulting ([#1990](https://github.com/bigcommerce/checkout-sdk-js/issues/1990)) ([7dc4660](https://github.com/bigcommerce/checkout-sdk-js/commit/7dc4660f77b71dd22221c5fc5d427920b488e3ad))

## [1.385.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.384.1...v1.385.0) (2023-06-07)


### Features

* **payment:** PI-88 [Adyen] Klarna widget update ([898c88e](https://github.com/bigcommerce/checkout-sdk-js/commit/898c88ecc3e84faead6102c22e8c41515fb3bb7b))

### [1.384.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.384.0...v1.384.1) (2023-06-07)

## [1.384.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.383.2...v1.384.0) (2023-06-07)


### Features

* **payment:** PAYPAL-2449 added braintree-local-methods payment startegy ([#2006](https://github.com/bigcommerce/checkout-sdk-js/issues/2006)) ([4f67f0b](https://github.com/bigcommerce/checkout-sdk-js/commit/4f67f0bbea9956cbd04660ea8a33f83223235c02))

### [1.383.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.383.1...v1.383.2) (2023-06-06)


### Bug Fixes

* **payment:** CHECKOUT-7498 Update registry key as a combination ([#2005](https://github.com/bigcommerce/checkout-sdk-js/issues/2005)) ([b4d203e](https://github.com/bigcommerce/checkout-sdk-js/commit/b4d203e704c4dac4e91bdd5c7989c42a32319eaa))

### [1.383.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.383.0...v1.383.1) (2023-06-02)


### Bug Fixes

* **payment:** PAYPAL-2575 fixed the issue with PayPalCommerceVenmo button eligibility ([#2007](https://github.com/bigcommerce/checkout-sdk-js/issues/2007)) ([9c135ea](https://github.com/bigcommerce/checkout-sdk-js/commit/9c135eae74882ab61fa4ab1882bde6e9937f1da8))

## [1.383.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.382.1...v1.383.0) (2023-06-02)


### Features

* **payment:** PAYPAL-2560 internalLabel ([ef99560](https://github.com/bigcommerce/checkout-sdk-js/commit/ef99560b92775783b3a2379c28f71a4c232fce43))


### Bug Fixes

* **payment:** PAYPAL-2552 removed unnecessary code ([a733414](https://github.com/bigcommerce/checkout-sdk-js/commit/a733414b4c3df998b9af303d95166e58d21c2522))

### [1.382.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.382.0...v1.382.1) (2023-05-31)


### Bug Fixes

* **payment:** PAYPAL-2451 renaming ([57a1c60](https://github.com/bigcommerce/checkout-sdk-js/commit/57a1c603da722e5a0f99d7d7e3e6a25908ced566))

## [1.382.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.381.4...v1.382.0) (2023-05-29)


### Features

* **payment:** PAYPAL-2451 fixed an instrument ([10ae303](https://github.com/bigcommerce/checkout-sdk-js/commit/10ae30323f3efc5e946e5ca8c1164fa6c2e6e355))

### [1.381.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.381.3...v1.381.4) (2023-05-24)


### Bug Fixes

* **checkout:** PI-101 3ds2 redirect flow for the adyen v3 ([6615f3a](https://github.com/bigcommerce/checkout-sdk-js/commit/6615f3ac539521f624418db77a98c64e8489fbe8))

### [1.381.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.381.2...v1.381.3) (2023-05-22)


### Bug Fixes

* **payment:** PAYPAL-2451 braintree ach instrument ([7ba679e](https://github.com/bigcommerce/checkout-sdk-js/commit/7ba679ea18c4a05f5899b0bc8518ec6c03855854))

### [1.381.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.381.1...v1.381.2) (2023-05-22)


### Bug Fixes

* **payment:** PAYPAL-0000 fixed the issue with PPCP APMs interfaces generation by updating names of the interfaces ([#1985](https://github.com/bigcommerce/checkout-sdk-js/issues/1985)) ([17854d4](https://github.com/bigcommerce/checkout-sdk-js/commit/17854d47200282eecfdf64fc891578841e658fec))

### [1.381.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.381.0...v1.381.1) (2023-05-18)


### Bug Fixes

* **payment:** BOLT-577 Bolt initialization error on customer step ([0be07d0](https://github.com/bigcommerce/checkout-sdk-js/commit/0be07d0eda509d15199fad5aa1a30f13e5f6361d))

## [1.381.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.380.1...v1.381.0) (2023-05-16)


### Features

* **payment:** INT-7573 Create Access Worldpay GooglePay strategy ([#1966](https://github.com/bigcommerce/checkout-sdk-js/issues/1966)) ([e5134f4](https://github.com/bigcommerce/checkout-sdk-js/commit/e5134f48df85706fa7c7e56f6297c23d803356ef))


### Bug Fixes

* **payment:** BOLT-577 Bolt initialization error on customer step ([404bde5](https://github.com/bigcommerce/checkout-sdk-js/commit/404bde535861fd7d4d6945591e2b07208194d182))


### Code Refactoring

* **payment:** PAYPAL-2414 added PayPalCommerceIntegrationService method creation ([#1970](https://github.com/bigcommerce/checkout-sdk-js/issues/1970)) ([2130c3e](https://github.com/bigcommerce/checkout-sdk-js/commit/2130c3e474210c4b580a8ea808d38bea55348cec))

### [1.380.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.380.0...v1.380.1) (2023-05-12)


### Bug Fixes

* **payment:** PAYPAL-2370 updated incoming parameters for ACH ([#1973](https://github.com/bigcommerce/checkout-sdk-js/issues/1973)) ([74d17be](https://github.com/bigcommerce/checkout-sdk-js/commit/74d17be3cb24e197a5d1aeedb19add98041ccc19))

## [1.380.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.379.0...v1.380.0) (2023-05-11)


### Features

* **payment:** INT-7516 SquareV2: Throw a `PaymentExecuteError` if tokenization fails ([#1971](https://github.com/bigcommerce/checkout-sdk-js/issues/1971)) ([663f8b7](https://github.com/bigcommerce/checkout-sdk-js/commit/663f8b7bad8d9b7497af5e38853fee44960154e5))

## [1.379.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.378.0...v1.379.0) (2023-05-08)


### Features

* **payment:** PAYPAL-1713 braintree ach strategy ([#1891](https://github.com/bigcommerce/checkout-sdk-js/issues/1891)) ([9f262be](https://github.com/bigcommerce/checkout-sdk-js/commit/9f262bef7290709c6f522465ab7bca54f9bfe2c8))

## [1.378.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.377.0...v1.378.0) (2023-05-08)


### Features

* **payment:** BOLT-484 Add styling for Bolt Button on PDP ([7837d94](https://github.com/bigcommerce/checkout-sdk-js/commit/7837d9435dac0c7e0d4d075b7fb0b67477f3027f))
* **payment:** BOLT-484 Add styling for Bolt Button on PDP ([6ead002](https://github.com/bigcommerce/checkout-sdk-js/commit/6ead002167a27552502ca3001df5437ab6222542))

## [1.377.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.376.1...v1.377.0) (2023-05-02)


### Features

* **payment:** INT-7173 BlueSnapDirect: Create payment strategy for ACH/ECP ([756a4c6](https://github.com/bigcommerce/checkout-sdk-js/commit/756a4c6956aac9586e82a0a3bb7c07930c35e44b))
* **payment:** PAYPAL-2013 added enable-funding to properly display paylater button ([#1958](https://github.com/bigcommerce/checkout-sdk-js/issues/1958)) ([ad4d9ee](https://github.com/bigcommerce/checkout-sdk-js/commit/ad4d9ee939bfa72068b9e018435fecfa6a940d56))


### Bug Fixes

* **payment:** INT-7173 BlueSnapDirect: Revert [#1917](https://github.com/bigcommerce/checkout-sdk-js/issues/1917) ([b9dd694](https://github.com/bigcommerce/checkout-sdk-js/commit/b9dd6947e899d5a5d563279795450f6969750bb9))

### [1.376.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.376.0...v1.376.1) (2023-04-27)


### Bug Fixes

* **payment:** PAYPAL-2036 added shippingAddressEditable option to Braintree payment configuration ([#1962](https://github.com/bigcommerce/checkout-sdk-js/issues/1962)) ([98c189a](https://github.com/bigcommerce/checkout-sdk-js/commit/98c189a05d1802dd02a75e6751f92bda1a644d57))

## [1.376.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.375.0...v1.376.0) (2023-04-26)


### Features

* **payment:** BOLT-458 Move Bolt customer strategy to new Bolt package ([f8508d9](https://github.com/bigcommerce/checkout-sdk-js/commit/f8508d9366714d1b1bc7078335f78d1b4254b0fe))

## [1.375.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.8...v1.375.0) (2023-04-26)


### Features

* **payment:** INT-7557 BlueSnapDirect: Implement 3DS 2 ([#1925](https://github.com/bigcommerce/checkout-sdk-js/issues/1925)) ([6574134](https://github.com/bigcommerce/checkout-sdk-js/commit/6574134019c07124191633adf469859f987a521e))

### [1.374.8](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.7...v1.374.8) (2023-04-25)


### Code Refactoring

* **payment:** PAYPAL-1895 removed paypal commerce code from core package ([#1960](https://github.com/bigcommerce/checkout-sdk-js/issues/1960)) ([87cfdc4](https://github.com/bigcommerce/checkout-sdk-js/commit/87cfdc4754be9e52fdf06afc7257e3601c3cf664))

### [1.374.7](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.6...v1.374.7) (2023-04-25)


### Code Refactoring

* **payment:** PAYPAL-2365 added PayPalCommerceVenmo payment strategy to paypal-commerce-integration package ([#1955](https://github.com/bigcommerce/checkout-sdk-js/issues/1955)) ([abf339a](https://github.com/bigcommerce/checkout-sdk-js/commit/abf339a619b137a4e34e32f1e164bde9d05c48d1))

### [1.374.6](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.5...v1.374.6) (2023-04-24)


### Code Refactoring

* **payment:** PAYPAL-000 updated PayPalCommercePaymentInitializeOptions.md file due to last changes ([#1954](https://github.com/bigcommerce/checkout-sdk-js/issues/1954)) ([d0a59bf](https://github.com/bigcommerce/checkout-sdk-js/commit/d0a59bf99e6a2395543e4bc0d20f74cb72383f29))

### [1.374.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.4...v1.374.5) (2023-04-24)


### Code Refactoring

* **payment:** PAYPAL-2366 added PayPalCommerceCredit payment strategy to paypal-commerce-integration package ([#1953](https://github.com/bigcommerce/checkout-sdk-js/issues/1953)) ([7729bd8](https://github.com/bigcommerce/checkout-sdk-js/commit/7729bd8aa9ea655a16f6e9b3e9195c434e3bc301))

### [1.374.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.3...v1.374.4) (2023-04-24)


### Code Refactoring

* **payment:** PAYPAL-2367 added PayPalCommercePaymentStrategy to paypal-commerce-integration package ([#1947](https://github.com/bigcommerce/checkout-sdk-js/issues/1947)) ([50644be](https://github.com/bigcommerce/checkout-sdk-js/commit/50644beb0a8b115dfb543528a747ce6e93de389b))

### [1.374.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.2...v1.374.3) (2023-04-24)


### Code Refactoring

* **payment:** PAYPAL-1894 added PayPalCommerceAlternativeMethodsPaymentStrategy to paypal-commerce-integration package ([#1941](https://github.com/bigcommerce/checkout-sdk-js/issues/1941)) ([b242527](https://github.com/bigcommerce/checkout-sdk-js/commit/b2425270818cc011e53868b5b4f331f931888e7a))

### [1.374.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.1...v1.374.2) (2023-04-18)


### Bug Fixes

* **common:** CHECKOUT-7381 Update resolver mechanism ([#1946](https://github.com/bigcommerce/checkout-sdk-js/issues/1946)) ([3e65f82](https://github.com/bigcommerce/checkout-sdk-js/commit/3e65f824585ee50d8298d079a6898c5b39c12419))

### [1.374.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.374.0...v1.374.1) (2023-04-14)


### Code Refactoring

* **payment:** PAYPAL-0000 added export for getBillingAddress method in payment-integration-test-utils ([#1949](https://github.com/bigcommerce/checkout-sdk-js/issues/1949)) ([5d3c189](https://github.com/bigcommerce/checkout-sdk-js/commit/5d3c1893c4d12b1644e75ac2ba1a828ce7daaac2))

## [1.374.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.373.0...v1.374.0) (2023-04-13)


### Features

* **payment:** PAYPAL-2050 fixed google pay button for safari and mozilla ([#1928](https://github.com/bigcommerce/checkout-sdk-js/issues/1928)) ([94ea76e](https://github.com/bigcommerce/checkout-sdk-js/commit/94ea76e9abcfd04e29aa31e7004018830177155d))

## [1.373.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.372.0...v1.373.0) (2023-04-13)


### Features

* **checkout:** ADYEN-775 update of intialization interface for Adyenv3 ([aff778f](https://github.com/bigcommerce/checkout-sdk-js/commit/aff778fa6afc3ea99ac7247470c71906b71dc5c1))

## [1.372.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.371.5...v1.372.0) (2023-04-13)


### Features

* **payment:** PAYPAL-2195 added buttonClassName ([#1943](https://github.com/bigcommerce/checkout-sdk-js/issues/1943)) ([f04c277](https://github.com/bigcommerce/checkout-sdk-js/commit/f04c277b29d21968313232edce2631d438cb319c))

### [1.371.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.371.4...v1.371.5) (2023-04-11)


### Code Refactoring

* **payment:** PAYPAL-000 added billing address mock to payment-integrations-test-utils package ([#1945](https://github.com/bigcommerce/checkout-sdk-js/issues/1945)) ([734b348](https://github.com/bigcommerce/checkout-sdk-js/commit/734b34846bb434737e8a11eadc294b39b562a71d))
* **payment:** PAYPAL-000 added timeout error to payment-integration-api package ([#1942](https://github.com/bigcommerce/checkout-sdk-js/issues/1942)) ([6c2f1dd](https://github.com/bigcommerce/checkout-sdk-js/commit/6c2f1ddd9f946e61e65b4c80c139d071e7ba9188))

### [1.371.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.371.3...v1.371.4) (2023-04-04)

### [1.371.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.371.2...v1.371.3) (2023-04-04)

### [1.371.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.371.1...v1.371.2) (2023-03-30)


### Code Refactoring

* **payment:** PAYPAL-000 added paypal commerce integration service mock to simplify test files ([#1926](https://github.com/bigcommerce/checkout-sdk-js/issues/1926)) ([b9265af](https://github.com/bigcommerce/checkout-sdk-js/commit/b9265af8e6b2efd16c8b8022fba63c09cb54eeeb))

### [1.371.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.371.0...v1.371.1) (2023-03-28)


### Code Refactoring

* **payment:** PAYPAL-2078 removed PayPalCommerceInlineCheckoutButtonStrategy ([#1922](https://github.com/bigcommerce/checkout-sdk-js/issues/1922)) ([7d586db](https://github.com/bigcommerce/checkout-sdk-js/commit/7d586db8f65cba45419cb7c29350084fc3963a15))

## [1.371.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.370.0...v1.371.0) (2023-03-27)


### Features

* **payment:** PAYPAL-2004 added ability to change style for amazonpay button ([#1914](https://github.com/bigcommerce/checkout-sdk-js/issues/1914)) ([3019104](https://github.com/bigcommerce/checkout-sdk-js/commit/30191047cbc9719664680a375ce026123ab18328))

## [1.370.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.369.2...v1.370.0) (2023-03-27)


### Features

* **payment:** BOLT-483 Create Bolt button strategy ([ace611f](https://github.com/bigcommerce/checkout-sdk-js/commit/ace611fb0370b555d4a8deb428f1309bd8120cbb))

### [1.369.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.369.1...v1.369.2) (2023-03-23)


### Code Refactoring

* **payment:** PAYPAL-000 removed useless utils method from paypal-commerce-integration package ([#1911](https://github.com/bigcommerce/checkout-sdk-js/issues/1911)) ([7159071](https://github.com/bigcommerce/checkout-sdk-js/commit/7159071fc3d998a21ceae25970c7136a9ac86f59))
* **payment:** PAYPAL-1893 removed PayPalCommerceCreditCards related code from core package ([#1910](https://github.com/bigcommerce/checkout-sdk-js/issues/1910)) ([a3fb70e](https://github.com/bigcommerce/checkout-sdk-js/commit/a3fb70e11dec18b498c7239b0d64003effae4601))

### [1.369.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.369.0...v1.369.1) (2023-03-23)


### Code Refactoring

* **payment:** PAYPAL-1893 added PayPalCommerceCreditCardsPaymentStrategy to paypal-commerce-integration package ([#1887](https://github.com/bigcommerce/checkout-sdk-js/issues/1887)) ([329676f](https://github.com/bigcommerce/checkout-sdk-js/commit/329676f996de5b3784f8fce5a70386319878a37b))

## [1.369.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.368.0...v1.369.0) (2023-03-22)


### Features

* **payment:** PAYPAL-000 added isCreditCardFormFields typeguard instead of isStoredCreditCardFormFields ([#1909](https://github.com/bigcommerce/checkout-sdk-js/issues/1909)) ([d30187d](https://github.com/bigcommerce/checkout-sdk-js/commit/d30187d2deb3eb9dc5c62386751a956035e57308))

## [1.368.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.367.2...v1.368.0) (2023-03-21)


### Features

* **checkout:** CHECKOUT-7250 Add floatingLabelEnabled UXsetting ([#1912](https://github.com/bigcommerce/checkout-sdk-js/issues/1912)) ([120253b](https://github.com/bigcommerce/checkout-sdk-js/commit/120253ba17f4fda5b95f12d8334f8ced25878a5d))

### [1.367.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.367.1...v1.367.2) (2023-03-21)


### Bug Fixes

* **payment:** INT-7044 BlueSnapDirect: Change identifier for credit card ([#1917](https://github.com/bigcommerce/checkout-sdk-js/issues/1917)) ([214928f](https://github.com/bigcommerce/checkout-sdk-js/commit/214928f846012000ab6bc11e425ab17d6807d2bf))

### [1.367.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.367.0...v1.367.1) (2023-03-21)


### Bug Fixes

* **payment:** ADYEN-733 fix ideal validation issue for adyenv2/v3 ([6458a84](https://github.com/bigcommerce/checkout-sdk-js/commit/6458a840ce66aa4574576b6d3a34400af714ddfc))

## [1.367.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.366.0...v1.367.0) (2023-03-20)


### Features

* **payment:** PAYPAL-2006 Created paypal-express-integration Checkout sdk package ([#1882](https://github.com/bigcommerce/checkout-sdk-js/issues/1882)) ([e850965](https://github.com/bigcommerce/checkout-sdk-js/commit/e8509657f7e61f46c7eedd9db3aca50c0c10e6ba))

## [1.366.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.365.1...v1.366.0) (2023-03-20)


### Features

* **payment:** PAYPAL-1906 Create braintree checkout-sdk package ([0d523df](https://github.com/bigcommerce/checkout-sdk-js/commit/0d523df55949cf666b400ef0d54fbfca69de1cef))

### [1.365.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.365.0...v1.365.1) (2023-03-20)


### Code Refactoring

* **payment:** BOLT-000 add generic type for getPaymentMethod ([e9b03e2](https://github.com/bigcommerce/checkout-sdk-js/commit/e9b03e2af6bf13b3901f10c7b93f1e1a01d0c405))

## [1.365.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.364.2...v1.365.0) (2023-03-20)


### Features

* **payment:** INT-7044 BlueSnapDirect: Add payment strategy for credit card ([#1811](https://github.com/bigcommerce/checkout-sdk-js/issues/1811)) ([90fbd9f](https://github.com/bigcommerce/checkout-sdk-js/commit/90fbd9fb2ead83ddf592ad91540dac62f56c8d5c))

### [1.364.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.364.1...v1.364.2) (2023-03-15)


### Bug Fixes

* **payment:** CHECKOUT-000 Fix exported type ([#1904](https://github.com/bigcommerce/checkout-sdk-js/issues/1904)) ([05e6ff1](https://github.com/bigcommerce/checkout-sdk-js/commit/05e6ff1b8679e0e2e122d77e7b32e304963082ca))

### [1.364.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.364.0...v1.364.1) (2023-03-15)


### Bug Fixes

* **payment:** CHECKOUT-000 Expose hosted form error to exported typings ([#1903](https://github.com/bigcommerce/checkout-sdk-js/issues/1903)) ([4c691c6](https://github.com/bigcommerce/checkout-sdk-js/commit/4c691c6e7fee04390912e8a2fda2782479707a1b))

## [1.364.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.363.0...v1.364.0) (2023-03-14)


### Features

* **payment:** PAYPAL-000 added isStoredCreditCardFormFields typeguard to payment-integration-api package ([#1894](https://github.com/bigcommerce/checkout-sdk-js/issues/1894)) ([7f4bb36](https://github.com/bigcommerce/checkout-sdk-js/commit/7f4bb36e9ff53a681c9dacbf02903ce9916f03d0))
* **payment:** PAYPAL-000 added objectWithKebabKeys utility function to payment-integration-api package ([#1893](https://github.com/bigcommerce/checkout-sdk-js/issues/1893)) ([1b76f0b](https://github.com/bigcommerce/checkout-sdk-js/commit/1b76f0bfe8fe4c2055d26cdf78b5029b6bec0083))
* **payment:** PAYPAL-1962 fixed paypal venmo button ([#1899](https://github.com/bigcommerce/checkout-sdk-js/issues/1899)) ([c9f2886](https://github.com/bigcommerce/checkout-sdk-js/commit/c9f28861e01631b73f5bab6ef7d30754ae22df5c))

## [1.363.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.362.0...v1.363.0) (2023-03-13)


### Features

* **payment:** BOLT-409 Create Bolt package in checkout-sdk-js ([ceead0b](https://github.com/bigcommerce/checkout-sdk-js/commit/ceead0b8df66c84f132c109514cf209e9e13f8fd))

## [1.362.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.361.1...v1.362.0) (2023-03-10)


### Features

* **payment:** PAYPAL-000 added HostedForm exports to payment-integration-api index file ([#1892](https://github.com/bigcommerce/checkout-sdk-js/issues/1892)) ([aa1ca1d](https://github.com/bigcommerce/checkout-sdk-js/commit/aa1ca1da41c7ef972745ee6ad019b74b0d2ea0aa))

### [1.361.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.361.0...v1.361.1) (2023-03-09)


### Bug Fixes

* **payment:** INT-7463 Fixed problem with cards vaulted with 3ds in the hosted form flow ([7a82aeb](https://github.com/bigcommerce/checkout-sdk-js/commit/7a82aebda22b3d8776b4d121cf48fbd90da1d465))

## [1.361.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.360.0...v1.361.0) (2023-03-07)


### Features

* **checkout:** CHECKOUT-7313 Introduce wallet button support selectors ([#1886](https://github.com/bigcommerce/checkout-sdk-js/issues/1886)) ([086298c](https://github.com/bigcommerce/checkout-sdk-js/commit/086298c345280bca532d3f1ec8258bb8a9c1792f))

## [1.360.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.359.0...v1.360.0) (2023-03-06)


### Features

* **payment:** PAYMENTS-8527 expose interface for real time host form filed validation for braintree ([44f8012](https://github.com/bigcommerce/checkout-sdk-js/commit/44f8012afd85a81e0066aad3c9898724a867439e))


### Code Refactoring

* **common:** PAYMENTS-8527 add braintree error data interface based on pr comment ([5950a8f](https://github.com/bigcommerce/checkout-sdk-js/commit/5950a8ffe30d0af7d1d89185122c486a8ee0afff))

## [1.359.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.358.1...v1.359.0) (2023-02-28)


### Features

* **payment:** PAYPAL-1985 added loadDefaultCheckout onCanclel to avoid potential errors ([#1873](https://github.com/bigcommerce/checkout-sdk-js/issues/1873)) ([3902e74](https://github.com/bigcommerce/checkout-sdk-js/commit/3902e74f8f1db6df5309cb4e3523eea7f6a521d5))

### [1.358.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.358.0...v1.358.1) (2023-02-27)


### Bug Fixes

* **shipping:** STRIPE-202 Split name input into First and Last name ([#1675](https://github.com/bigcommerce/checkout-sdk-js/issues/1675)) ([1b920a1](https://github.com/bigcommerce/checkout-sdk-js/commit/1b920a18cc816ccca318611e7e968a5281664560))

## [1.358.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.357.1...v1.358.0) (2023-02-27)


### Features

* **payment:** INT-6312 klarnav2 increase code coverage ([0ce8c7f](https://github.com/bigcommerce/checkout-sdk-js/commit/0ce8c7fa99ae14a51e28d81be2588da57b163e58))


### Code Refactoring

* **checkout:** CHECKOUT-7304 Change PayPal wallet buttons height ([#1878](https://github.com/bigcommerce/checkout-sdk-js/issues/1878)) ([4089b00](https://github.com/bigcommerce/checkout-sdk-js/commit/4089b0088bb34d452866febc9f2d91f5a3a9bd8e))

### [1.357.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.357.0...v1.357.1) (2023-02-23)


### Bug Fixes

* **payment:** PAYPAL-1991 fixed GooglePay for adyenV2 and adyenV3 ([#1863](https://github.com/bigcommerce/checkout-sdk-js/issues/1863)) ([c89471d](https://github.com/bigcommerce/checkout-sdk-js/commit/c89471d858ae2e4025913a83689bc28e76141df8))
* **payment:** PAYPAL-1992 fixed GooglePay for BNZ ([#1864](https://github.com/bigcommerce/checkout-sdk-js/issues/1864)) ([f6d87f3](https://github.com/bigcommerce/checkout-sdk-js/commit/f6d87f3b86ee244720a51ef01d3a7f700c373bf4))
* **payment:** PAYPAL-1995 fixed GooglePay for Authorize Net ([afdfb09](https://github.com/bigcommerce/checkout-sdk-js/commit/afdfb09aa40c3df91ace416b6f292f2bc1d73ad1))
* **payment:** PAYPAL-1996 fixed GooglePay for CheckoutCom ([f978dfb](https://github.com/bigcommerce/checkout-sdk-js/commit/f978dfba00c519cbcf7660e384f910ad16c1b11e))

## [1.357.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.356.0...v1.357.0) (2023-02-23)


### Features

* **payment:** BOLT-469 move AnalyticsTrackerWindow to analytics package ([3cccf14](https://github.com/bigcommerce/checkout-sdk-js/commit/3cccf14eaa451c34bd328c2753a30120566f27ed))
* **payment:** BOLT-469 move AnalyticsTrackerWindow to analytics package ([cba87f8](https://github.com/bigcommerce/checkout-sdk-js/commit/cba87f808fbc605d4c4b97ea32ea7b957876546b))

## [1.356.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.355.0...v1.356.0) (2023-02-23)


### Features

* **payment:** PAYPAL-1999 make Stripe Google Pay compatible with BuyNow cart ([#1870](https://github.com/bigcommerce/checkout-sdk-js/issues/1870)) ([043bc85](https://github.com/bigcommerce/checkout-sdk-js/commit/043bc85d9ab635f19ec430cd34ac5f2173a0bb43))

## [1.355.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.354.0...v1.355.0) (2023-02-23)


### Features

* **payment:** PAYPAL-1998 make Orbital Google Pay compatible with Buy Now cart ([#1867](https://github.com/bigcommerce/checkout-sdk-js/issues/1867)) ([f66b3cd](https://github.com/bigcommerce/checkout-sdk-js/commit/f66b3cd6bb76b0f4f8d6ec963f5e7325d254cd16))

## [1.354.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.353.1...v1.354.0) (2023-02-23)


### Features

* **payment:** PAYPAL-1997 make CyberSourceV2 Google Pay compatible with Buy Now cart ([#1862](https://github.com/bigcommerce/checkout-sdk-js/issues/1862)) ([b4e33e9](https://github.com/bigcommerce/checkout-sdk-js/commit/b4e33e966b1b260e5f68bed23df2ee0c03ff36a4))

### [1.353.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.353.0...v1.353.1) (2023-02-23)


### Bug Fixes

* **payment:** PAYPAL-1993 make StripeUPE  Google Pay compatible with Buy Now cart ([#1869](https://github.com/bigcommerce/checkout-sdk-js/issues/1869)) ([bc55b0a](https://github.com/bigcommerce/checkout-sdk-js/commit/bc55b0ab8389041567c3aad605873667f25437a5))

## [1.353.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.352.0...v1.353.0) (2023-02-22)


### Features

* **payment:** BOLT-470 move LegacyAddress to payment-integration-package package ([d1677dc](https://github.com/bigcommerce/checkout-sdk-js/commit/d1677dce5d548fd876a2d507e58f35da8a07daaf))
* **payment:** BOLT-470 move LegacyAddress to payment-integration-package package ([f92f5fe](https://github.com/bigcommerce/checkout-sdk-js/commit/f92f5fe3a697e91e2ba6fab56c0b4b7ea90743e3))

## [1.352.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.351.0...v1.352.0) (2023-02-21)


### Features

* **payment:** BOLT-465 move AnalyticsExtraItemsManager to payment-integration-api package ([65450ad](https://github.com/bigcommerce/checkout-sdk-js/commit/65450ad814979e791a1761d94652f92d96c010d1))

## [1.351.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.350.1...v1.351.0) (2023-02-20)


### Features

* **payment:** PAYMENTS-8493 add untrusted shipping address card verification mode to card instrument ([1990998](https://github.com/bigcommerce/checkout-sdk-js/commit/199099807c49640fa6ab5cf6f90cd8ae0a92530e))

### [1.350.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.350.0...v1.350.1) (2023-02-20)


### Code Refactoring

* **payment:** PAYPAL-1971 removed initializesOnCheckout page property from PayPalCommerce initialize button options ([#1859](https://github.com/bigcommerce/checkout-sdk-js/issues/1859)) ([bdcf195](https://github.com/bigcommerce/checkout-sdk-js/commit/bdcf1952d194b261447e46cfbcf09b1b824c615f))
* **payment:** PAYPAL-1983 removed layout and tagline styles property from PayPalCommerceButtons config ([#1858](https://github.com/bigcommerce/checkout-sdk-js/issues/1858)) ([5a1a2fd](https://github.com/bigcommerce/checkout-sdk-js/commit/5a1a2fdb5515e5a8dc1c34015b04e5c36dc72d48))

## [1.350.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.349.0...v1.350.0) (2023-02-20)


### Features

* **payment:** BOLT-463 add applyStoreCredit to PaymentIntegrationService ([52ece0e](https://github.com/bigcommerce/checkout-sdk-js/commit/52ece0e42ad669af2667cd467d59bb77e1e79962))

## [1.349.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.348.6...v1.349.0) (2023-02-20)


### Features

* **payment:** BOLT-462 move PaymentMethodInvalidError to paymant-integration-api package ([cde7a55](https://github.com/bigcommerce/checkout-sdk-js/commit/cde7a55c171149504e71d0c8177308cf9b7d446a))

### [1.348.6](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.348.5...v1.348.6) (2023-02-17)


### Code Refactoring

* **payment:** PAYPAL-1979 updated PayPalCommerceCreditButtonStrategy with PayPalCommerceIntegrationService ([#1856](https://github.com/bigcommerce/checkout-sdk-js/issues/1856)) ([694d2c2](https://github.com/bigcommerce/checkout-sdk-js/commit/694d2c214f99a65b4f0a41dcb24c31736d90b2f8))

### [1.348.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.348.4...v1.348.5) (2023-02-17)


### Code Refactoring

* **payment:** PAYPAL-1980 updated PayPalCommerceCreditCustomer strategy with PayPalCommerceIntegrationService ([#1855](https://github.com/bigcommerce/checkout-sdk-js/issues/1855)) ([35fccff](https://github.com/bigcommerce/checkout-sdk-js/commit/35fccff3e4567278013f9648cdafcdf98e861695))

### [1.348.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.348.3...v1.348.4) (2023-02-16)


### Bug Fixes

* **checkout:** ADYEN-588 update payment data request on wallet button click googlepay ([7e1b0af](https://github.com/bigcommerce/checkout-sdk-js/commit/7e1b0af92e448b9d439a15fc1c0a1b3a759f41b8))


### Code Refactoring

* **payment:** PAYPAL-1981 updated PayPalCommerceVenmoButtonStrategy with PayPalCommerceIntegrationService ([#1851](https://github.com/bigcommerce/checkout-sdk-js/issues/1851)) ([af741dc](https://github.com/bigcommerce/checkout-sdk-js/commit/af741dc3b87b06b952b93f3a1ec551527088d675))

### [1.348.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.348.2...v1.348.3) (2023-02-16)


### Code Refactoring

* **payment:** PAYPAL-1982 updated PayPalCommerceVenmoCustomerStrategy with PayPalCommerceIntegrationService ([#1850](https://github.com/bigcommerce/checkout-sdk-js/issues/1850)) ([27797cb](https://github.com/bigcommerce/checkout-sdk-js/commit/27797cb9fa994f648754f4f0b1cb40e6197274dd))

### [1.348.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.348.1...v1.348.2) (2023-02-16)


### Code Refactoring

* **payment:** PAYPAL-1978 updated PayPalCommerceAlternativeMethodsButtonStrategy with PayPalCommerceIntegrationService ([#1849](https://github.com/bigcommerce/checkout-sdk-js/issues/1849)) ([48aaa1d](https://github.com/bigcommerce/checkout-sdk-js/commit/48aaa1df4cdae9e2a0cf9be45a9aa84c57fc10d6))

### [1.348.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.348.0...v1.348.1) (2023-02-16)


### Code Refactoring

* **payment:** PAYPAL-1973 updated PayPalCommerceCustomerStrategy with PayPalCommerceIntegrationService ([#1845](https://github.com/bigcommerce/checkout-sdk-js/issues/1845)) ([13d526b](https://github.com/bigcommerce/checkout-sdk-js/commit/13d526b82450ba7e089c024fd5f5cedf471d55b0))

## [1.348.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.347.0...v1.348.0) (2023-02-15)


### Features

* **payment:** BOLT-459 move ErrorResponseBody to paymant-integration-api package ([de7fbd7](https://github.com/bigcommerce/checkout-sdk-js/commit/de7fbd71e9df0d6cfa02fe1c7e41dd3f3010abbc))

## [1.347.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.346.0...v1.347.0) (2023-02-15)


### Features

* **payment:** PAYPAL-1919 added PayPalCommerceCommon class with utils methods inside for paypal-commerce-integration package ([#1838](https://github.com/bigcommerce/checkout-sdk-js/issues/1838)) ([964b0c3](https://github.com/bigcommerce/checkout-sdk-js/commit/964b0c37b2fa2af13e0b1b6b1273012e37f665b3))


### Code Refactoring

* **payment:** PAYPAL-1919 replaced PayPalCommerceCommon name with PayPalCommerceIntegrationService ([#1842](https://github.com/bigcommerce/checkout-sdk-js/issues/1842)) ([b9e5a0f](https://github.com/bigcommerce/checkout-sdk-js/commit/b9e5a0f6a5f6a370dff42e0e1ffdb0791805941a))

## [1.346.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.345.1...v1.346.0) (2023-02-14)


### Features

* **payment:** STRIPE-200 add stripe phone field ([#1681](https://github.com/bigcommerce/checkout-sdk-js/issues/1681)) ([eabb2f3](https://github.com/bigcommerce/checkout-sdk-js/commit/eabb2f3faa02be36dc9beac5f4df3ee6bbedbca2))

### [1.345.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.345.0...v1.345.1) (2023-02-13)


### Code Refactoring

* **checkout:** CHECKOUT-0000 Remove ApplePay button style ([#1836](https://github.com/bigcommerce/checkout-sdk-js/issues/1836)) ([185b35a](https://github.com/bigcommerce/checkout-sdk-js/commit/185b35a9d8a92d40a40affac9796cb572be50f65))

## [1.345.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.344.0...v1.345.0) (2023-02-13)


### Features

* **payment:** PAYPAL-1837 Create paypalcommercecredit customer button strategy ([db2d919](https://github.com/bigcommerce/checkout-sdk-js/commit/db2d919fec2b73505bb797db9951a13522ee4f1b))

## [1.344.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.343.0...v1.344.0) (2023-02-13)


### Features

* **payment:** PAYPAL-1838 Create paypalcommercevenmo customer button strategy ([f170b1c](https://github.com/bigcommerce/checkout-sdk-js/commit/f170b1c7d5aefd318ef82b5e63b6cfde4bb29ebd))
* **payment:** PAYPAL-1838 Create paypalcommercevenmo customer button strategy ([7c7eec7](https://github.com/bigcommerce/checkout-sdk-js/commit/7c7eec75576ce419e2f594b1d2a4366d4dce44b0))

## [1.343.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.342.0...v1.343.0) (2023-02-10)


### Features

* **checkout:** CHECKOUT-7231 Add getUserExperienceSettings selector ([#1834](https://github.com/bigcommerce/checkout-sdk-js/issues/1834)) ([c204427](https://github.com/bigcommerce/checkout-sdk-js/commit/c204427487409b4cb0848da7b228d2749bed6fd5))

## [1.342.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.341.0...v1.342.0) (2023-02-09)


### Features

* **payment:** INT-7044 BlueSnapDirect: Pass options to `loadPaymentMethod` ([#1810](https://github.com/bigcommerce/checkout-sdk-js/issues/1810)) ([4bf09ff](https://github.com/bigcommerce/checkout-sdk-js/commit/4bf09ffa34003283678fc4e80d27648976547e67))

## [1.341.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.340.0...v1.341.0) (2023-02-09)


### Features

* **payment:** PAYPAL-1634 added ability for applepay spb to work with buyNowCart on PDP ([#1809](https://github.com/bigcommerce/checkout-sdk-js/issues/1809)) ([0490606](https://github.com/bigcommerce/checkout-sdk-js/commit/049060659cb6bcf380177343697420b85767abf6))

## [1.340.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.339.0...v1.340.0) (2023-02-09)


### Features

* **checkout:** CHECKOUT-7231 Update checkoutUserExperienceSettings ([#1831](https://github.com/bigcommerce/checkout-sdk-js/issues/1831)) ([24d6f87](https://github.com/bigcommerce/checkout-sdk-js/commit/24d6f87a6bfe64eaefbf7384eb5009dc71399b5c))

## [1.339.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.338.0...v1.339.0) (2023-02-09)


### Features

* **checkout:** CHECKOUT-7231 Add checkoutUXSettings to interface ([#1825](https://github.com/bigcommerce/checkout-sdk-js/issues/1825)) ([5191b61](https://github.com/bigcommerce/checkout-sdk-js/commit/5191b61d7aa8d0e8dbe10f28fa190c39f5a3a5cd))

## [1.338.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.337.0...v1.338.0) (2023-02-08)


### Features

* **payment:** PAYPAL-1930 added intent param to Braintree sdk and to the paypal order creation config ([#1826](https://github.com/bigcommerce/checkout-sdk-js/issues/1826)) ([5166212](https://github.com/bigcommerce/checkout-sdk-js/commit/51662123f0fc567aff9dcfabcdadfc41bde2eb42))

## [1.337.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.336.2...v1.337.0) (2023-02-07)


### Features

* **payment:** PAYPAL-1959 provided buyer-country to the paypal sdk config for dev mode ([#1823](https://github.com/bigcommerce/checkout-sdk-js/issues/1823)) ([556089d](https://github.com/bigcommerce/checkout-sdk-js/commit/556089dd9c1b4e64a10709cbdf511b853615fd49))
* **payment:** PAYPAL-1959 provided buyer-country to the paypal sdk config for dev mode ([#1823](https://github.com/bigcommerce/checkout-sdk-js/issues/1823)) ([c74a729](https://github.com/bigcommerce/checkout-sdk-js/commit/c74a7294b4d9d79af700f9294d80dbd2bde94f04))

### [1.336.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.336.1...v1.336.2) (2023-02-07)


### Bug Fixes

* **payment:** PAYPAL-1926 added extra shipping option selection if there is no recommended options available ([#1822](https://github.com/bigcommerce/checkout-sdk-js/issues/1822)) ([aa90493](https://github.com/bigcommerce/checkout-sdk-js/commit/aa904939d07c3247d5fd9923abb47e5aff6ff96d))

### [1.336.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.336.0...v1.336.1) (2023-02-07)


### Code Refactoring

* **payment:** PAYPAL-1921 removed unnecessary PayPalCommerceAlternativeMethods v2 transformation in payment request transformer file ([#1821](https://github.com/bigcommerce/checkout-sdk-js/issues/1821)) ([9c5caf6](https://github.com/bigcommerce/checkout-sdk-js/commit/9c5caf6b9de821397ba1ea900462ff0bbd467a12))

## [1.336.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.335.2...v1.336.0) (2023-02-06)


### Features

* **payment:** PAYPAL-1888 added PayPalCommerceButtonStrategy to paypal-commerce-integration package ([#1801](https://github.com/bigcommerce/checkout-sdk-js/issues/1801)) ([08d8555](https://github.com/bigcommerce/checkout-sdk-js/commit/08d855529eaae5290935aaad7df3a025a6af4d3d))
* **payment:** PAYPAL-1892 added PayPalCommerceAlternativeMethodsButtonStrategy to paypal-commerce-integration ([#1817](https://github.com/bigcommerce/checkout-sdk-js/issues/1817)) ([4c4b51b](https://github.com/bigcommerce/checkout-sdk-js/commit/4c4b51b152d22e9965777eb882d6af8a4a03b28f))


### Bug Fixes

* **payment:** PAYPAL-000 updated paypal commerce tests to fix some issues with CI build in other pr ([#1820](https://github.com/bigcommerce/checkout-sdk-js/issues/1820)) ([8074a16](https://github.com/bigcommerce/checkout-sdk-js/commit/8074a165abbc46d7ddb5d6f385f992139861959d))


### Code Refactoring

* **payment:** PAYPAL-000 removed paypal commerce checkout button strategies from core package ([#1818](https://github.com/bigcommerce/checkout-sdk-js/issues/1818)) ([615766e](https://github.com/bigcommerce/checkout-sdk-js/commit/615766e1c104e65ec35d19e00dbc068b60aa9bdf))
* **payment:** PAYPAL-1889 added PayPalCommerceCreditButtonStrategy to paypal-commerce-integration package ([#1815](https://github.com/bigcommerce/checkout-sdk-js/issues/1815)) ([8855fe4](https://github.com/bigcommerce/checkout-sdk-js/commit/8855fe4bbe8529352eb32620351dce5d72e4aaf3))
* **payment:** PAYPAL-1891 added PayPalCommerceVenmoButtonStrategy to paypal commerce integration package ([#1813](https://github.com/bigcommerce/checkout-sdk-js/issues/1813)) ([a805af7](https://github.com/bigcommerce/checkout-sdk-js/commit/a805af7940d84bc26b878d6ad20af91bea492b54))

### [1.335.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.335.1...v1.335.2) (2023-02-02)

### [1.335.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.335.0...v1.335.1) (2023-02-02)


### Bug Fixes

* **payment:** STRIPE-287 Fixed error when using vaulted card L2/L3 field appear as null on dashboard ([#1779](https://github.com/bigcommerce/checkout-sdk-js/issues/1779)) ([be221e5](https://github.com/bigcommerce/checkout-sdk-js/commit/be221e58e0ad17f9651008e47f41d4ead31fed45))

## [1.335.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.334.0...v1.335.0) (2023-02-01)


### Features

* **payment:** PAYPAL-1913 Create braintreevenmo payment strategy ([d8a57e3](https://github.com/bigcommerce/checkout-sdk-js/commit/d8a57e310167013a80ce3a25c89f25907a09cd53))
* **payment:** PAYPAL-1913 fix build issue with error import ([#1814](https://github.com/bigcommerce/checkout-sdk-js/issues/1814)) ([77f5d0a](https://github.com/bigcommerce/checkout-sdk-js/commit/77f5d0ae0a49ff4cee7b587dfa780ffb7bf63912))

## [1.334.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.333.1...v1.334.0) (2023-02-01)


### Features

* **payment:** STRIPE-289 Loading Submit button after card loads ([#1763](https://github.com/bigcommerce/checkout-sdk-js/issues/1763)) ([3053eed](https://github.com/bigcommerce/checkout-sdk-js/commit/3053eed02804e2b113f13c007ca4ec34dab3186d))

### [1.333.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.333.0...v1.333.1) (2023-02-01)


### Bug Fixes

* **checkout:** CHECKOUT-0000 Add skip-nx-cache build command ([#1812](https://github.com/bigcommerce/checkout-sdk-js/issues/1812)) ([c4ae24e](https://github.com/bigcommerce/checkout-sdk-js/commit/c4ae24eb6a3b70e7d4ca8a4b494fb664282cb12b))

## [1.333.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.332.2...v1.333.0) (2023-01-31)


### Features

* **payment:** PAYPAL-1935 move CancellablePromise to integration package ([6bab047](https://github.com/bigcommerce/checkout-sdk-js/commit/6bab0477a545bcafcc75647b429dc7de5b645705))

### [1.332.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.332.1...v1.332.2) (2023-01-31)


### Bug Fixes

* **payment:** PAYMENTS-8239 addresses feedback ([8e816a6](https://github.com/bigcommerce/checkout-sdk-js/commit/8e816a69716c4a3457e641a9e6d60e58b73f9429))
* **payment:** PAYMENTS-8239 sorts recommended option first for applepay ([814564b](https://github.com/bigcommerce/checkout-sdk-js/commit/814564bc497781a519e687b07d30f9c59658e47c))

### [1.332.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.332.0...v1.332.1) (2023-01-30)


### Bug Fixes

* **payment:** PAYPAL-1929 added PayPalButtonStyleOptions interface to the docs files ([#1802](https://github.com/bigcommerce/checkout-sdk-js/issues/1802)) ([fa15dd8](https://github.com/bigcommerce/checkout-sdk-js/commit/fa15dd806b0746921e4089e78ae86a07a9e35e4a))

## [1.332.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.331.0...v1.332.0) (2023-01-30)


### Features

* **payment:** PAYPAL-1934 move PaymentMethodFailedError to integration package ([a9d1546](https://github.com/bigcommerce/checkout-sdk-js/commit/a9d15463989a98f211ddec6c37e47721afe983fb))

## [1.331.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.330.1...v1.331.0) (2023-01-30)


### Features

* **payment:** PAYPAL-000 added an ability to loadCheckout by provided id in payments-integration-api ([#1803](https://github.com/bigcommerce/checkout-sdk-js/issues/1803)) ([a0e3e02](https://github.com/bigcommerce/checkout-sdk-js/commit/a0e3e02c454e92e06002ba9bf8f43aef28a723d6))
* **payment:** PAYPAL-000 added an ability to use BuyNowCartCreationError from payment-integration-api ([#1804](https://github.com/bigcommerce/checkout-sdk-js/issues/1804)) ([0c7edca](https://github.com/bigcommerce/checkout-sdk-js/commit/0c7edca2a83ad462d185830928efe3f3003ccf7c))


### Bug Fixes

* **payment:** PAYPAL-000 updated amazon pay specs with CartSource to fix the issue with failed build ([#1806](https://github.com/bigcommerce/checkout-sdk-js/issues/1806)) ([7fa0ccd](https://github.com/bigcommerce/checkout-sdk-js/commit/7fa0ccd8aa3c9fcc04e27a37bd6cd660e3def123))
* **payment:** PAYPAL-1635 Buy Now feature for amazon pay ([562ab38](https://github.com/bigcommerce/checkout-sdk-js/commit/562ab380046cec191067d5c68e8f2dde221aab5c))
* **payment:** PAYPAL-1635 fix after review ([34cc8ee](https://github.com/bigcommerce/checkout-sdk-js/commit/34cc8eebfe25e2df5505c7e941550e29342ed826))
* **payment:** PAYPAL-1635 update after review ([4696290](https://github.com/bigcommerce/checkout-sdk-js/commit/469629041125b5b200e87576ad655c2cce7cafb4))
* **payment:** PAYPAL-1635 update after review ([0ce178e](https://github.com/bigcommerce/checkout-sdk-js/commit/0ce178e6a6d3d443e9781a7f2932e23c50f6430a))
* **payment:** PAYPAL-1635 update after review ([e16ec75](https://github.com/bigcommerce/checkout-sdk-js/commit/e16ec75b31e19eff21bae8b700b8c729e1e84ee8))
* **payment:** PAYPAL-1635 update after review ([651bc1f](https://github.com/bigcommerce/checkout-sdk-js/commit/651bc1fafbf5de7ed2445012b175ac4ac6edaa56))
* **payment:** PAYPAL-1763 fixed an issue when we could not proceed checkout after trying to place order with an empty CVV for stored card ([4aea399](https://github.com/bigcommerce/checkout-sdk-js/commit/4aea399b9e483e3862f339da17d1561ac7764341))
* **payment:** PAYPAL-1929 renamed several PayPal Commerce interfaces to fix the issue with doc files ([#1799](https://github.com/bigcommerce/checkout-sdk-js/issues/1799)) ([05df1e4](https://github.com/bigcommerce/checkout-sdk-js/commit/05df1e4437189b57f6dd05e46fcb6f6eb35d1dec))

### [1.330.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.330.0...v1.330.1) (2023-01-27)


### Bug Fixes

* **payment:** PAYPAL-1923 fixed the issue with wrong paypal sdk configuration ([#1794](https://github.com/bigcommerce/checkout-sdk-js/issues/1794)) ([dec683d](https://github.com/bigcommerce/checkout-sdk-js/commit/dec683d258c7cf4d0e562815eb114dfe440ec19d))

## [1.330.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.329.0...v1.330.0) (2023-01-25)


### Features

* **payment:** PAYPAL-1882 sending PPC APM V2 gateway instead of PPC APM ([#1782](https://github.com/bigcommerce/checkout-sdk-js/issues/1782)) ([27393bc](https://github.com/bigcommerce/checkout-sdk-js/commit/27393bc09f9a2ae8d4de27fcd7cab15288d8141f))
* **payment:** PAYPAL-1898 added CartRequestSender to payment integration api package ([#1791](https://github.com/bigcommerce/checkout-sdk-js/issues/1791)) ([84c146c](https://github.com/bigcommerce/checkout-sdk-js/commit/84c146cb993bdb2ec07f095a591f40ab100a94a0))


### Code Refactoring

* **payment:** PAYPAL-1918 moved LoadingIndicator from core to ui package ([#1784](https://github.com/bigcommerce/checkout-sdk-js/issues/1784)) ([926265c](https://github.com/bigcommerce/checkout-sdk-js/commit/926265ca604682d461c9b8d283ffbd50c3bacb20))

## [1.329.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.328.0...v1.329.0) (2023-01-25)


### Features

* **payment:** PAYPAL-1840 Create braintreepaypalcredit customer button strategy ([97bcb1b](https://github.com/bigcommerce/checkout-sdk-js/commit/97bcb1b22b84d613d2dec129f4720e8a3e99294e))


### Bug Fixes

* **checkout:** ADYEN-502 hide wrong placeholder text for the vaulted validation fields ([1c93745](https://github.com/bigcommerce/checkout-sdk-js/commit/1c93745a068e38bab3b882c65d88cfe1315ff1e3))

## [1.328.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.327.0...v1.328.0) (2023-01-25)


### Features

* **payment:** STRIPE-216 delete consignments to recover auto-step flow when reloads page for stripe link ([#1731](https://github.com/bigcommerce/checkout-sdk-js/issues/1731)) ([1e56b66](https://github.com/bigcommerce/checkout-sdk-js/commit/1e56b6627a20fb1078ffd7c2cf67b480ad4782bb))

## [1.327.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.326.4...v1.327.0) (2023-01-24)


### Features

* **payment:** STRIPE-194 keep Shipping Address Information If Shopper Logs Out Of Link ([#1760](https://github.com/bigcommerce/checkout-sdk-js/issues/1760)) ([9a661a3](https://github.com/bigcommerce/checkout-sdk-js/commit/9a661a3b3f6abbbe716f6f9227c9e6e68aad65df))

### [1.326.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.326.3...v1.326.4) (2023-01-23)


### Code Refactoring

* **payment:** PAYPAL-1917 removed PayPalCommerceInlineCheckoutButtonStrategy from core package ([#1783](https://github.com/bigcommerce/checkout-sdk-js/issues/1783)) ([0921359](https://github.com/bigcommerce/checkout-sdk-js/commit/0921359bd2a1f9df68476a077baea0ea0c7ba8f1))

### [1.326.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.326.2...v1.326.3) (2023-01-20)


### Bug Fixes

* **payment:** CHECKOUT-000 Fix issue with offsite payment completion ([#1786](https://github.com/bigcommerce/checkout-sdk-js/issues/1786)) ([c1d5b79](https://github.com/bigcommerce/checkout-sdk-js/commit/c1d5b79efd17da26c553ad515f5d9ab78ee152a8))

### [1.326.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.326.1...v1.326.2) (2023-01-19)


### Code Refactoring

* **payment:** INT-6964 AmazonPayV1: Remove all related files ([f24e5f8](https://github.com/bigcommerce/checkout-sdk-js/commit/f24e5f8b8911eb26476aaa681e04695f6f13ea87))
* **payment:** INT-6964 Rename `AMAZONPAYV2` to `AMAZONPAY` ([4eb2688](https://github.com/bigcommerce/checkout-sdk-js/commit/4eb2688d1c7b6c2b9c44be45ed2121942898276f))

### [1.326.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.326.0...v1.326.1) (2023-01-19)


### Bug Fixes

* **billing:** CHECKOUT-7214 Merge billing address as compared to replace ([#1774](https://github.com/bigcommerce/checkout-sdk-js/issues/1774)) ([5cde3c3](https://github.com/bigcommerce/checkout-sdk-js/commit/5cde3c3c557b0a6591992b3443f02ebb8fef0ea2))

## [1.326.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.325.0...v1.326.0) (2023-01-19)


### Features

* **payment:** PAYPAL-1890 added PayPalCommerceInlineButton strategy to paypal-commerce integration package ([#1776](https://github.com/bigcommerce/checkout-sdk-js/issues/1776)) ([a4eca90](https://github.com/bigcommerce/checkout-sdk-js/commit/a4eca909e77cf2b0fb55b3d9bf11590bce40ba23))

## [1.325.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.324.3...v1.325.0) (2023-01-18)


### Features

* **payment:** PAYPAL-1908 Make an ability to use Overlay from core package in integration checkout-sdk packages ([fcd5e0a](https://github.com/bigcommerce/checkout-sdk-js/commit/fcd5e0a883a6f236501627b254e71e2aa5b8ee0e))

### [1.324.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.324.2...v1.324.3) (2023-01-18)


### Bug Fixes

* **payment:** PAYPAL-000 updated kyiv-payments-team codeowners data ([#1778](https://github.com/bigcommerce/checkout-sdk-js/issues/1778)) ([060cc64](https://github.com/bigcommerce/checkout-sdk-js/commit/060cc641d01bc8b32d0346416c52b0e2d8c431c6))

### [1.324.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.324.1...v1.324.2) (2023-01-17)


### Bug Fixes

* **payment:** INT-7103 SquareV2: Assume that `postalCode` is valid unless it changes ([#1765](https://github.com/bigcommerce/checkout-sdk-js/issues/1765)) ([8526331](https://github.com/bigcommerce/checkout-sdk-js/commit/85263312ac4eb9dfb4d45aef19ed6f0b47e7b7e5))

### [1.324.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.324.0...v1.324.1) (2023-01-16)


### Bug Fixes

* **checkout:** ADYEN-688 fixed 3ds2 redirect for vaulted cards ([ea27e60](https://github.com/bigcommerce/checkout-sdk-js/commit/ea27e607783b805f6b049ac596defa15cec6a38c))

## [1.324.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.323.1...v1.324.0) (2023-01-16)


### Features

* **payment:** PAYPAL-1839 Create braintreepaypal customer button strategy ([afe6c27](https://github.com/bigcommerce/checkout-sdk-js/commit/afe6c278e5e356db0e2812bac1b1853ec64f72f4))

### [1.323.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.323.0...v1.323.1) (2023-01-12)

## [1.323.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.322.0...v1.323.0) (2023-01-12)


### Features

* **payment:** PAYPAL-1633 added Buy Now feature for googlepaybraintree ([875acac](https://github.com/bigcommerce/checkout-sdk-js/commit/875acac29cf4518fccdaf815371f26727d55ff24))


### Bug Fixes

* **payment:** PAYPAL-1633 additional parameter ([51218e0](https://github.com/bigcommerce/checkout-sdk-js/commit/51218e066e0ae57b72c289d4c80d3a1238d04ea9))
* **payment:** PAYPAL-1633 update after review ([d13800a](https://github.com/bigcommerce/checkout-sdk-js/commit/d13800a2cb62eead6f595da1cd8fe29669afc0c5))
* **payment:** PAYPAL-1635 fix after review ([d849dd0](https://github.com/bigcommerce/checkout-sdk-js/commit/d849dd00acf9e7a9e107fdc19c88ae30406397c1))
* **payment:** PAYPAL-1635 fix after review ([827a149](https://github.com/bigcommerce/checkout-sdk-js/commit/827a149ecf8ad0a8a8ab47d83f96e911e938a01b))
* **payment:** PAYPAL-1635 lint ([64a49ba](https://github.com/bigcommerce/checkout-sdk-js/commit/64a49baa61fcc5714f76daafe9e25d79133537c2))


### Code Refactoring

* **payment:** PAYPAL-1633 fix after review ([b5ab80f](https://github.com/bigcommerce/checkout-sdk-js/commit/b5ab80fbc807136ef84212f2a49e89fce3421dc6))
* **payment:** PAYPAL-1633 fix after review ([9430894](https://github.com/bigcommerce/checkout-sdk-js/commit/9430894212c6125f09cbc1ee095191172fc2f03a))

## [1.322.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.321.0...v1.322.0) (2023-01-11)


### Features

* **payment:** PAYPAL-1864 created paypal commerce package ([#1751](https://github.com/bigcommerce/checkout-sdk-js/issues/1751)) ([9ba7826](https://github.com/bigcommerce/checkout-sdk-js/commit/9ba7826f19110e09c0be847dfb67a8f16229e48d))

## [1.321.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.320.1...v1.321.0) (2023-01-10)


### Features

* **payment:** BOLT-437 Modify analytics event for Bolt suggestion on customer step ([e1a2e9e](https://github.com/bigcommerce/checkout-sdk-js/commit/e1a2e9efa89bb706f4e29ee275b7d04bda93d103))

### [1.320.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.320.0...v1.320.1) (2023-01-10)


### Bug Fixes

* **payment:** BOLT-362 fix Bolt track.js error in console ([ccf5144](https://github.com/bigcommerce/checkout-sdk-js/commit/ccf5144f817a476349a020976f6d1f5f44a802d6))

## [1.320.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.319.1...v1.320.0) (2023-01-10)


### Features

* **payment:** PAYMENTS-8378 Send multiple addresses to trusted_shipping_address endpoint in case of multi-shipping ([#1745](https://github.com/bigcommerce/checkout-sdk-js/issues/1745)) ([902016b](https://github.com/bigcommerce/checkout-sdk-js/commit/902016b98423f22dc91648ca71baa8a9caf71b9d))
* **payment:** PAYMENTS-8378 Update bigpay-client-js version to 5.21.0 ([#1764](https://github.com/bigcommerce/checkout-sdk-js/issues/1764)) ([410f40d](https://github.com/bigcommerce/checkout-sdk-js/commit/410f40d6af6f3b8c1ab18bef43f2402fd81d5a7f))

### [1.319.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.319.0...v1.319.1) (2023-01-09)

## [1.319.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.318.0...v1.319.0) (2023-01-08)


### Features

* **checkout:** CHECKOUT-7148 Throw `CartConsistencyError` when server detects inconsistent projection data ([654be3e](https://github.com/bigcommerce/checkout-sdk-js/commit/654be3e89efc6f02ebaa8ea27e20093fe79d397c))

## [1.318.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.317.1...v1.318.0) (2023-01-04)


### Features

* **payment:** INT-6729 add Klarna support for Czech Republic ([375c759](https://github.com/bigcommerce/checkout-sdk-js/commit/375c75900d6b232a60b2550087a11c16bdfadbc3))

### [1.317.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.317.0...v1.317.1) (2023-01-04)

## [1.317.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.316.4...v1.317.0) (2023-01-03)


### Features

* **payment:** PAYPAL-1808 passing vaulting data to order creation request for PayPal Commerce CC ([#1734](https://github.com/bigcommerce/checkout-sdk-js/issues/1734)) ([a1c1c1f](https://github.com/bigcommerce/checkout-sdk-js/commit/a1c1c1fbe14372f4043a59040437f6b90309b288))


### Bug Fixes

* **payment:** PAYPAL-000 fixed the issue with checkout-sdk build after last pr merge ([#1753](https://github.com/bigcommerce/checkout-sdk-js/issues/1753)) ([fe61144](https://github.com/bigcommerce/checkout-sdk-js/commit/fe6114464f5f4b07059197dc3ff4723b52b80171))

### [1.316.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.316.3...v1.316.4) (2023-01-03)


### Bug Fixes

* **common:** CHECKOUT-000 Upgrade @types/lodash from 4.14.184 to 4.14.185 ([#1640](https://github.com/bigcommerce/checkout-sdk-js/issues/1640)) ([e97127f](https://github.com/bigcommerce/checkout-sdk-js/commit/e97127f9faa4d6264225d8fc5a3285339bc1893b))
* **common:** CHECKOUT-000 upgrade core-js from 3.25.0 to 3.25.2 ([#1639](https://github.com/bigcommerce/checkout-sdk-js/issues/1639)) ([6fdf3bb](https://github.com/bigcommerce/checkout-sdk-js/commit/6fdf3bb99c64393fded63f5de18e46bf48a7f6d5))
* **common:** CHECKOUT-000 upgrade reselect from 4.1.6 to 4.1.7 ([#1709](https://github.com/bigcommerce/checkout-sdk-js/issues/1709)) ([b30ffbc](https://github.com/bigcommerce/checkout-sdk-js/commit/b30ffbcf46459a537648d9a72ca55111172f8263))

### [1.316.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.316.2...v1.316.3) (2023-01-02)

### [1.316.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.316.1...v1.316.2) (2022-12-30)


### Bug Fixes

* **payment:** STRIPE-281 Fixed error when making purchases with only digital products ([#1747](https://github.com/bigcommerce/checkout-sdk-js/issues/1747)) ([d9cfce4](https://github.com/bigcommerce/checkout-sdk-js/commit/d9cfce4064903cae7dd4d8066e92bc4148a49ab3))

### [1.316.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.316.0...v1.316.1) (2022-12-29)


### Bug Fixes

* **payment:** CHECKOUT-000 Fix offsite payment strategy ([#1749](https://github.com/bigcommerce/checkout-sdk-js/issues/1749)) ([00c380a](https://github.com/bigcommerce/checkout-sdk-js/commit/00c380acbe4692ef499b1f6b1a70b0fa08405266))

## [1.316.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.315.0...v1.316.0) (2022-12-27)


### Features

* **payment:** PAYPAL-1836 added PayPalCommerceCustomer strategy ([#1730](https://github.com/bigcommerce/checkout-sdk-js/issues/1730)) ([4692299](https://github.com/bigcommerce/checkout-sdk-js/commit/469229953a4fd70c3a4fbaba9a47174c1f7a8ca4))

## [1.315.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.314.2...v1.315.0) (2022-12-22)


### Features

* **payment:** INT-6957 Sezzle - Use window.location.replace to redirect ([#1696](https://github.com/bigcommerce/checkout-sdk-js/issues/1696)) ([ef7962c](https://github.com/bigcommerce/checkout-sdk-js/commit/ef7962c3b51118813a96808390bac54048c02d7d))

### [1.314.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.314.1...v1.314.2) (2022-12-21)

### [1.314.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.314.0...v1.314.1) (2022-12-21)


### Bug Fixes

* **payment:** BOLT-268 Bolt payment fields with store credits ([8a38daf](https://github.com/bigcommerce/checkout-sdk-js/commit/8a38daf56c2dac805a6ae2e5801877272828e1df))

## [1.314.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.313.2...v1.314.0) (2022-12-21)


### Features

* **checkout:** CHECKOUT-0000 Enforce RegistryV2 for SquareV2 ([#1737](https://github.com/bigcommerce/checkout-sdk-js/issues/1737)) ([9af5b64](https://github.com/bigcommerce/checkout-sdk-js/commit/9af5b64a7271fddc772afd61bfd524abcf864922))

### [1.313.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.313.1...v1.313.2) (2022-12-20)

### [1.313.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.313.0...v1.313.1) (2022-12-19)

## [1.313.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.312.1...v1.313.0) (2022-12-18)


### Features

* **payment:** STRIPE-178 Loading Submit button after card loads ([c983b92](https://github.com/bigcommerce/checkout-sdk-js/commit/c983b921cb6a41221fbb74180cb7c6a4db11986f))

### [1.312.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.312.0...v1.312.1) (2022-12-16)


### Bug Fixes

* **checkout:** CHECKOUT-6406 Fix payload for offline payment method ([#1735](https://github.com/bigcommerce/checkout-sdk-js/issues/1735)) ([9465d7d](https://github.com/bigcommerce/checkout-sdk-js/commit/9465d7d9f532c65d50d15f7e42839be70befebb1))
* **payment:** ADYEN-629 added adyen credit card es translation fix ([85e9cbf](https://github.com/bigcommerce/checkout-sdk-js/commit/85e9cbfa52d90a9a711519daf6cd1e608c8582b8))

## [1.312.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.311.2...v1.312.0) (2022-12-15)


### Features

* **payment:** BOLT-408 Add BODL event for customer suggestion init ([fecf8c9](https://github.com/bigcommerce/checkout-sdk-js/commit/fecf8c9155e2ce691407713b32b30f364b4fea90))

### [1.311.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.311.1...v1.311.2) (2022-12-14)

### [1.311.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.311.0...v1.311.1) (2022-12-14)

## [1.311.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.310.3...v1.311.0) (2022-12-14)


### Features

* **payment:** STRIPE-165 V3 Initialize payment for vaulted cards ([#1641](https://github.com/bigcommerce/checkout-sdk-js/issues/1641)) ([1c07aad](https://github.com/bigcommerce/checkout-sdk-js/commit/1c07aadfd41ae21b265db9ee2fda400cbcb16c06))

### [1.310.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.310.2...v1.310.3) (2022-12-13)


### Code Refactoring

* **checkout:** CHECKOUT-6406 Refactor offline payment method ([#1724](https://github.com/bigcommerce/checkout-sdk-js/issues/1724)) ([18fa217](https://github.com/bigcommerce/checkout-sdk-js/commit/18fa2176b800e648b1ba26ed424b4ced8d964a52))

### [1.310.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.310.1...v1.310.2) (2022-12-13)


### Code Refactoring

* **checkout:** CHECKOUT-6394 Refactor credit card payment method ([#1710](https://github.com/bigcommerce/checkout-sdk-js/issues/1710)) ([7eb83cd](https://github.com/bigcommerce/checkout-sdk-js/commit/7eb83cd6db9bcd2280c92f6609902e0aa95e9e18))

### [1.310.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.310.0...v1.310.1) (2022-12-09)

## [1.310.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.309.6...v1.310.0) (2022-12-09)


### Features

* **payment:** INT-6727 add Klarna support for greece ([#1688](https://github.com/bigcommerce/checkout-sdk-js/issues/1688)) ([7a039ba](https://github.com/bigcommerce/checkout-sdk-js/commit/7a039ba34671492f1633ca6fc9ebed12ab142ceb))


### Bug Fixes

* **payment:** INT-6928 [Mollie] No Ability To Use A Different Card To Pay ([#1702](https://github.com/bigcommerce/checkout-sdk-js/issues/1702)) ([5555568](https://github.com/bigcommerce/checkout-sdk-js/commit/555556811a82c728f691c90a303342a388cb0858))

### [1.309.6](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.309.5...v1.309.6) (2022-12-08)

### [1.309.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.309.4...v1.309.5) (2022-12-07)


### Code Refactoring

* **checkout:** CHECKOUT-6405 Refactor no payment data required method ([#1717](https://github.com/bigcommerce/checkout-sdk-js/issues/1717)) ([5e627c6](https://github.com/bigcommerce/checkout-sdk-js/commit/5e627c64f77da6480b3bc0aaca702740ea58327c))

### [1.309.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.309.3...v1.309.4) (2022-12-07)


### Code Refactoring

* **checkout:** CHECKOUT-7107 hosted-form clean-up ([#1713](https://github.com/bigcommerce/checkout-sdk-js/issues/1713)) ([5c19c4e](https://github.com/bigcommerce/checkout-sdk-js/commit/5c19c4ea319e5a84eea42f9f81883d91b20f5770))

### [1.309.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.309.2...v1.309.3) (2022-12-06)

### [1.309.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.309.1...v1.309.2) (2022-12-05)


### Bug Fixes

* **payment:** STRIPE-160 Fixed no order created for successful Stripe payment ([#1690](https://github.com/bigcommerce/checkout-sdk-js/issues/1690)) ([0d74194](https://github.com/bigcommerce/checkout-sdk-js/commit/0d74194ae55715767ced60fa4c1749ab3426e8ee))

### [1.309.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.309.0...v1.309.1) (2022-11-28)


### Code Refactoring

* **checkout:** CHECKOUT-7107 Refactor `hosted-form` ([#1707](https://github.com/bigcommerce/checkout-sdk-js/issues/1707)) ([d28eb54](https://github.com/bigcommerce/checkout-sdk-js/commit/d28eb543ce84c0f379454bdb0fdc14be0ad16b22))

## [1.309.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.308.4...v1.309.0) (2022-11-28)


### Features

* **payment:** INT-6716 SquareV2: Add payment strategy ([#1642](https://github.com/bigcommerce/checkout-sdk-js/issues/1642)) ([6af5062](https://github.com/bigcommerce/checkout-sdk-js/commit/6af5062c53392e825e937b4fccc4bc47e9b72cda))

### [1.308.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.308.3...v1.308.4) (2022-11-24)

### [1.308.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.308.2...v1.308.3) (2022-11-24)


### Bug Fixes

* **payment:** STRIPE-167 Adding Postal Code to stripe card element if not obtained in billing ([c5558cd](https://github.com/bigcommerce/checkout-sdk-js/commit/c5558cd75dc221752823d2cc39e95dbc36cb9e66))
* **payment:** STRIPE-167 update documentation links for stripeupe ([b25fb3c](https://github.com/bigcommerce/checkout-sdk-js/commit/b25fb3c6b87a1ab8ea056daa637dad0f78b9977f))

### [1.308.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.308.1...v1.308.2) (2022-11-22)


### Code Refactoring

* **checkout:** CHECKOUT-6397 Refactor external payment method ([#1697](https://github.com/bigcommerce/checkout-sdk-js/issues/1697)) ([5cc2346](https://github.com/bigcommerce/checkout-sdk-js/commit/5cc23465b741a5b8cc3c9666033d49597009a99f))

### [1.308.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.308.0...v1.308.1) (2022-11-22)

## [1.308.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.307.1...v1.308.0) (2022-11-14)


### Features

* **payment:** PAYPAL-1723 added skip checkout functionality to PDP paypalcredit ([#1678](https://github.com/bigcommerce/checkout-sdk-js/issues/1678)) ([d2bb5ac](https://github.com/bigcommerce/checkout-sdk-js/commit/d2bb5acccf19a670d28ad9ab52a228e1a8d42070))

### [1.307.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.307.0...v1.307.1) (2022-11-10)

## [1.307.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.306.0...v1.307.0) (2022-11-10)


### Features

* **payment:** INT-6443 Hide payPal onDigital River behind an experiment ([2ad1c42](https://github.com/bigcommerce/checkout-sdk-js/commit/2ad1c42d330a58e9b4b0e25c3f8b614ab26ba8d3))
* **payment:** INT-6443 reviewed change by Animesh ([3f0292b](https://github.com/bigcommerce/checkout-sdk-js/commit/3f0292b055abef210c7eefb4e3248468b9f7c148))
* **payment:** INT-6443 reviewed change by Peng Zhou ([c756ee3](https://github.com/bigcommerce/checkout-sdk-js/commit/c756ee3ae10e9b872c431d0b5b5984b6968fe61c))


### Bug Fixes

* **payment:** STRIPE-167 Adding Postal Code to stripe card elemnt if not obtained in billing ([d3f6aa8](https://github.com/bigcommerce/checkout-sdk-js/commit/d3f6aa8309fc5a5f6c31f622e789203d234e2e94))

## [1.306.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.305.1...v1.306.0) (2022-11-09)


### Features

* **payment:** PAYPAL-1723 added skip checkout functionality to PDP paypalcommerce ([#1667](https://github.com/bigcommerce/checkout-sdk-js/issues/1667)) ([0fe4ae2](https://github.com/bigcommerce/checkout-sdk-js/commit/0fe4ae2a29bdcf5f06dd7f09dae661c119f2af44))

### [1.305.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.305.0...v1.305.1) (2022-11-08)


### Code Refactoring

* **payment:** PAYPAL-1773 removed unnecessary business logic from PayPalCommerceInlineCheckoutButton strategy ([#1672](https://github.com/bigcommerce/checkout-sdk-js/issues/1672)) ([66597b0](https://github.com/bigcommerce/checkout-sdk-js/commit/66597b01d7487c5e3d2c7fbeaf70bf4050249f31))

## [1.305.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.304.0...v1.305.0) (2022-11-08)


### Features

* **payment:** BOLT-386 Add BODL analytics tracking events ([4cf875c](https://github.com/bigcommerce/checkout-sdk-js/commit/4cf875cd629136293dea5245416593bedcedf047))

## [1.304.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.303.0...v1.304.0) (2022-11-07)


### Features

* **checkout:** STRF-10153 Data Layer Updates - Field Additions and Changes ([#1670](https://github.com/bigcommerce/checkout-sdk-js/issues/1670)) ([8184573](https://github.com/bigcommerce/checkout-sdk-js/commit/81845738236a49c41e959f57b5626c35bd6707a1))


### Code Refactoring

* **payment:** PAYPAL-1756 removed 'Fake' data implementation from paypal commerce button strategy ([#1659](https://github.com/bigcommerce/checkout-sdk-js/issues/1659)) ([b2f3795](https://github.com/bigcommerce/checkout-sdk-js/commit/b2f37955a7be937608a56e51e3f56ce3ae2d31c9))
* **payment:** PAYPAL-1757 removed 'Fake' data implementation from paypal commerce credit button strategy ([#1674](https://github.com/bigcommerce/checkout-sdk-js/issues/1674)) ([27a68c1](https://github.com/bigcommerce/checkout-sdk-js/commit/27a68c1a47da3e92d4bc4b8fa802bd8f725bf931))

## [1.303.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.302.0...v1.303.0) (2022-11-07)


### Features

* **checkout:** ADYEN-585 moved Adyen from core to the separate package ([bc6d639](https://github.com/bigcommerce/checkout-sdk-js/commit/bc6d639a2b52e52cc689f5ce50abdc0a48bac36d))

## [1.302.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.301.1...v1.302.0) (2022-11-07)


### Features

* **payment:** STRIPE-183 persisting stripe components when reloads the page ([#1649](https://github.com/bigcommerce/checkout-sdk-js/issues/1649)) ([289b5bd](https://github.com/bigcommerce/checkout-sdk-js/commit/289b5bda6ddb0caaa586d2e21efcbf30e14e0d4d))

### [1.301.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.301.0...v1.301.1) (2022-11-04)


### Bug Fixes

* **payment:** INT-6890 AmazonPayV2: Change `isReadyToPay` logic ([#1669](https://github.com/bigcommerce/checkout-sdk-js/issues/1669)) ([632f598](https://github.com/bigcommerce/checkout-sdk-js/commit/632f598f3c6d7692c0f6046c0c820debf6246883))

## [1.301.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.300.1...v1.301.0) (2022-11-03)


### Features

* **payment:** INT-5953 Force to use Payment Strategy V1 when Mollie and Apple pay ([#1671](https://github.com/bigcommerce/checkout-sdk-js/issues/1671)) ([1d6d4ee](https://github.com/bigcommerce/checkout-sdk-js/commit/1d6d4ee1e0e3423d33d2e714aeccee381153b72e))

### [1.300.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.300.0...v1.300.1) (2022-11-03)


### Bug Fixes

* **payment:** INT-6848 AmazonPayV2: Render the button in a container created programmatically ([#1655](https://github.com/bigcommerce/checkout-sdk-js/issues/1655)) ([ce21d9f](https://github.com/bigcommerce/checkout-sdk-js/commit/ce21d9f6e58215ebe15237666958cf297e421b19))

## [1.300.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.299.1...v1.300.0) (2022-11-02)


### Features

* **payment:** INT-6675 [Digital River] Comment resolved ([da798ad](https://github.com/bigcommerce/checkout-sdk-js/commit/da798ad262bacb4e8f0a1e8e75d493af1aeb1ace))
* **payment:** INT-6675 [Digital River] improve function ([7a00933](https://github.com/bigcommerce/checkout-sdk-js/commit/7a009333f590023216617513d45e58c84d4615b0))
* **payment:** INT-6675 [Digital River] Small fix ([6a6f675](https://github.com/bigcommerce/checkout-sdk-js/commit/6a6f675de0f99c227a9335e0aa6d940b3dc22715))
* **payment:** INT-6675 [Digital River] unit testing ([f84f108](https://github.com/bigcommerce/checkout-sdk-js/commit/f84f1089390c14f11aad5a463e957a7faa3b3af7))
* **payment:** INT-6675 [Digital River] Update billingAddress from paypal response ([3d9269c](https://github.com/bigcommerce/checkout-sdk-js/commit/3d9269c1a3c25fa054a95a46a8665ce96f4156b1))
* **payment:** PAYPAL-1737 added currencyCode param to loadPaymentMethod request ([#1665](https://github.com/bigcommerce/checkout-sdk-js/issues/1665)) ([d5763b6](https://github.com/bigcommerce/checkout-sdk-js/commit/d5763b6413fea3c331f8a1df3d4112e8d99fd3e0))


### Bug Fixes

* **payment:** PAYPAL-1758 added condition to submit payment in onComplete method for auth&capture transaction only for PayPalInlineCheckoutButton ([#1664](https://github.com/bigcommerce/checkout-sdk-js/issues/1664)) ([8746fdb](https://github.com/bigcommerce/checkout-sdk-js/commit/8746fdbd67da049154a8c5d223901a6604bb18b3))

### [1.299.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.299.0...v1.299.1) (2022-10-27)


### Bug Fixes

* **payment:** INT-6772 Worldpay supported in firefox ([#1647](https://github.com/bigcommerce/checkout-sdk-js/issues/1647)) ([4fdad98](https://github.com/bigcommerce/checkout-sdk-js/commit/4fdad98f7381f58314b69ceb5338c8c1ca9bd7c3))

## [1.299.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.298.3...v1.299.0) (2022-10-25)


### Features

* **payment:** PAYPAL-1629 BraintreeVenmo on PDP ([085e98a](https://github.com/bigcommerce/checkout-sdk-js/commit/085e98a51f59fef6443b0a810b90e1eb913a9b99))
* **payment:** PAYPAL-1629 BraintreeVenmo on PDP ([94f14dd](https://github.com/bigcommerce/checkout-sdk-js/commit/94f14ddf843e87ed1027c1e566ee8f9c733db529))
* **payment:** PAYPAL-1630 BraintreePayPal on PDP ([b9f024d](https://github.com/bigcommerce/checkout-sdk-js/commit/b9f024d8b3943210f28820d2924980a10ea4f7e5))

### [1.298.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.298.2...v1.298.3) (2022-10-25)


### Code Refactoring

* **payment:** PAYPAL-1742 removed Fake data implementation due to BE changes ([#1653](https://github.com/bigcommerce/checkout-sdk-js/issues/1653)) ([a07ddbd](https://github.com/bigcommerce/checkout-sdk-js/commit/a07ddbd5a48bbe34ae854fac7c64443113f8667c))

### [1.298.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.298.1...v1.298.2) (2022-10-20)


### Bug Fixes

* **payment:** PAYPAL-1725 fixed the issue with passing fake data as customer address from last session in PayPalCommerceInlineCheckoutButtonStrategy ([#1648](https://github.com/bigcommerce/checkout-sdk-js/issues/1648)) ([f27cd84](https://github.com/bigcommerce/checkout-sdk-js/commit/f27cd848f1fd3bad3132dcf7963728c4c6b4d741))
* **payment:** PAYPAL-1730 fixed the issue with passing onComplete method for non hosted paypal flows ([#1645](https://github.com/bigcommerce/checkout-sdk-js/issues/1645)) ([b8b695f](https://github.com/bigcommerce/checkout-sdk-js/commit/b8b695f0958397788df138128473b664dbc15011))

### [1.298.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.298.0...v1.298.1) (2022-10-20)


### Bug Fixes

* **payment:** INT-6539 GooglePay: Pass `hostname` as param when loading googlepay ([#1611](https://github.com/bigcommerce/checkout-sdk-js/issues/1611)) ([328fd82](https://github.com/bigcommerce/checkout-sdk-js/commit/328fd826fb5a04e41c4e9a67b288a36529182755))

## [1.298.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.297.0...v1.298.0) (2022-10-18)


### Features

* **payment:** STRIPE-99 Add flag to validate unmount ([ad8c627](https://github.com/bigcommerce/checkout-sdk-js/commit/ad8c6274f26260936f52389b484bd0c88745966c))
* **payment:** STRIPE-99 Add flag to validate unmount ([8981bea](https://github.com/bigcommerce/checkout-sdk-js/commit/8981bea6091b200961787a99cc156a3343538489))
* **payment:** STRIPE-99 Add Stripe UPE fix ([4b4ed77](https://github.com/bigcommerce/checkout-sdk-js/commit/4b4ed77f747ebe5d081f5fd5cffaae0c1b93f8a2))
* **payment:** STRIPE-99 Fix flag for validation ([419c37c](https://github.com/bigcommerce/checkout-sdk-js/commit/419c37c268b1501697071dec9b8aaa345932ba1a))
* **payment:** STRIPE-99 Fix name of variables ([127412d](https://github.com/bigcommerce/checkout-sdk-js/commit/127412dffaf2e2b1b4a4c84acdf5a43e25ab5be5))


### Bug Fixes

* **payment:** INT-6478 SquareV2 - Fail Gracefully when payment provider unavailable ([bc136cc](https://github.com/bigcommerce/checkout-sdk-js/commit/bc136ccfcbcdbc2ce361055e7991d0c66d7697e3))

## [1.297.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.296.2...v1.297.0) (2022-10-17)


### Features

* **payment:** PAYPAL-1606 Added Shipping options for paypal and updated paypal callbacks ([#1607](https://github.com/bigcommerce/checkout-sdk-js/issues/1607)) ([4520f94](https://github.com/bigcommerce/checkout-sdk-js/commit/4520f94b282cc2c4a1d0066e485a8ca3955621e9))
* **payment:** PAYPAL-1607 added shipping Options for paypal credit and updated paypal callbacks ([#1610](https://github.com/bigcommerce/checkout-sdk-js/issues/1610)) ([6a03314](https://github.com/bigcommerce/checkout-sdk-js/commit/6a03314c48b00a9a7c89b10834112d6ceb6cb0de))

### [1.296.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.296.1...v1.296.2) (2022-10-13)

### [1.296.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.296.0...v1.296.1) (2022-10-13)


### Bug Fixes

* **common:** CHECKOUT-000 upgrade @types/lodash from 4.14.182 to 4.14.184 ([#1592](https://github.com/bigcommerce/checkout-sdk-js/issues/1592)) ([8873f50](https://github.com/bigcommerce/checkout-sdk-js/commit/8873f5065ce07b322711488de827e243da7fad21))
* **common:** CHECKOUT-000 upgrade core-js from 3.24.1 to 3.25.0 ([#1601](https://github.com/bigcommerce/checkout-sdk-js/issues/1601)) ([ed31162](https://github.com/bigcommerce/checkout-sdk-js/commit/ed31162c981d52ea518ba0e0ac2fe4f498bde4ad))

## [1.296.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.295.0...v1.296.0) (2022-10-05)


### Features

* **payment:** INT-6092 AmazonPayV2: Add an additional payment button… ([#1605](https://github.com/bigcommerce/checkout-sdk-js/issues/1605)) ([a4c24cd](https://github.com/bigcommerce/checkout-sdk-js/commit/a4c24cd2542604dbee615fbbd8cfa9a1bd0505e3))

## [1.295.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.294.0...v1.295.0) (2022-10-05)


### Features

* **payment:** PAYPAL-1627 added Buy Now implementation for PayPalCommerceVenmo button streategy ([#1622](https://github.com/bigcommerce/checkout-sdk-js/issues/1622)) ([876a240](https://github.com/bigcommerce/checkout-sdk-js/commit/876a2406464e1de28dd61b837a51a5928f217a97))
* **payment:** PAYPAL-1628 added Buy Now implementation for PayPalCommerce alternative methods button strategy ([#1624](https://github.com/bigcommerce/checkout-sdk-js/issues/1624)) ([bb6b242](https://github.com/bigcommerce/checkout-sdk-js/commit/bb6b2429287b1f1fc5c9ad02893a6c6a307aedfc))

## [1.294.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.293.0...v1.294.0) (2022-10-04)


### Features

* **payment:** PAYPAL-1626 made PayPalCommerceCredit competible with Buy Now ([#1620](https://github.com/bigcommerce/checkout-sdk-js/issues/1620)) ([1b523f4](https://github.com/bigcommerce/checkout-sdk-js/commit/1b523f429e589f5de49126053d24e3bc351cf2c3))

## [1.293.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.292.1...v1.293.0) (2022-10-03)


### Features

* **payment:** INT-6297 BNZ Googlepay ([#1598](https://github.com/bigcommerce/checkout-sdk-js/issues/1598)) ([066e9da](https://github.com/bigcommerce/checkout-sdk-js/commit/066e9da58531be9ae65d07ce53b39a07ec28a051))

### [1.292.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.292.0...v1.292.1) (2022-09-30)


### Code Refactoring

* **checkout:** STRF-10042 Incapsulate BODL event names into public methods ([#1625](https://github.com/bigcommerce/checkout-sdk-js/issues/1625)) ([93bfa5c](https://github.com/bigcommerce/checkout-sdk-js/commit/93bfa5c411bd20b014559fe6d1014c029f738048))

## [1.292.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.291.1...v1.292.0) (2022-09-29)


### Features

* **payment:** STRIPE-25 Stripe Link State ([#1616](https://github.com/bigcommerce/checkout-sdk-js/issues/1616)) ([ebefc2a](https://github.com/bigcommerce/checkout-sdk-js/commit/ebefc2a2aa8ef5715ef60b370eb83c6cc7f4da4b))

### [1.291.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.291.0...v1.291.1) (2022-09-29)


### Bug Fixes

* **payment:** CHECKOUT-000 Update get params to get registeries ([#1623](https://github.com/bigcommerce/checkout-sdk-js/issues/1623)) ([f626b5d](https://github.com/bigcommerce/checkout-sdk-js/commit/f626b5d7fd935aac13309a425bd748723dd82f12))

## [1.291.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.290.0...v1.291.0) (2022-09-29)


### Features

* **payment:** PAYPAL-1690 added default height value for PayPal buttons if height is not provided ([#1621](https://github.com/bigcommerce/checkout-sdk-js/issues/1621)) ([ffd363e](https://github.com/bigcommerce/checkout-sdk-js/commit/ffd363ea900c7fce93477ff73d6e600d235346f3))

## [1.290.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.289.0...v1.290.0) (2022-09-27)


### Features

* **payment:** BOLT-282 fixed analytics feature for Bolt Checkout ([fdc975e](https://github.com/bigcommerce/checkout-sdk-js/commit/fdc975efc5042fa09762055548a624e7dd908020))

## [1.289.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.288.1...v1.289.0) (2022-09-27)


### Features

* **payment:** PAYPAL-1625 added Buy Now implementation for PayPalCommerceButtonStrategy ([#1604](https://github.com/bigcommerce/checkout-sdk-js/issues/1604)) ([02bb2db](https://github.com/bigcommerce/checkout-sdk-js/commit/02bb2db89fb74decfed2c47f57da9c703b046686))

### [1.288.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.288.0...v1.288.1) (2022-09-26)


### Bug Fixes

* **payment:** STRIPE-131 Added a catch in case an exception occurs when confirming the payment using 3DS2 ([#1586](https://github.com/bigcommerce/checkout-sdk-js/issues/1586)) ([f046e7d](https://github.com/bigcommerce/checkout-sdk-js/commit/f046e7d3d482d10d5161afd13b219cf3556c442f))

## [1.288.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.287.1...v1.288.0) (2022-09-26)


### Features

* **payment:** INT-6554 Worldpay Access - Increase code coverage ([#1588](https://github.com/bigcommerce/checkout-sdk-js/issues/1588)) ([643734d](https://github.com/bigcommerce/checkout-sdk-js/commit/643734de5ecf0ebe3faee29b53f04c19f685827e))

### [1.287.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.287.0...v1.287.1) (2022-09-21)


### Bug Fixes

* **payment:** ADYEN-545 bumped adyen-web version ([a2e1a19](https://github.com/bigcommerce/checkout-sdk-js/commit/a2e1a19a2109793717e51e138e9d32a155f4895e))

## [1.287.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.286.0...v1.287.0) (2022-09-20)


### Features

* **payment:** PAYPAL-1673 updated 'experience' button option in PayPalCommerceInlineCheckoutButtonStrategy ([#1606](https://github.com/bigcommerce/checkout-sdk-js/issues/1606)) ([85c7384](https://github.com/bigcommerce/checkout-sdk-js/commit/85c73848d8427aad02fbf4197c75eda7968760b3))

## [1.286.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.285.2...v1.286.0) (2022-09-20)


### Features

* **checkout:** CHECKOUT-6860 Use numeric keypad ([#1595](https://github.com/bigcommerce/checkout-sdk-js/issues/1595)) ([4a96115](https://github.com/bigcommerce/checkout-sdk-js/commit/4a96115e42a35c5b096249f4c76b34417a0798e3))

### [1.285.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.285.1...v1.285.2) (2022-09-15)


### Code Refactoring

* **payment:** PAYPAL-1541 remove unnecessaru paypal commerce button strategy code ([#1599](https://github.com/bigcommerce/checkout-sdk-js/issues/1599)) ([a6dab41](https://github.com/bigcommerce/checkout-sdk-js/commit/a6dab41b1bbe2444c723e4c744521cf69ccc0f49))

### [1.285.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.285.0...v1.285.1) (2022-09-15)


### Bug Fixes

* **payment:** STRIPE-106 Added a catch in case an exception occurs when confirming the payment using 3DS2 ([#1576](https://github.com/bigcommerce/checkout-sdk-js/issues/1576)) ([c60f7af](https://github.com/bigcommerce/checkout-sdk-js/commit/c60f7affc6f7506d785178051c1fa294f1b6b153))

## [1.285.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.284.2...v1.285.0) (2022-09-15)


### Features

* **payment:** INT-5494 Worldpayaccess - Support vaulting ([#1584](https://github.com/bigcommerce/checkout-sdk-js/issues/1584)) ([c441bd8](https://github.com/bigcommerce/checkout-sdk-js/commit/c441bd8967f5becf33c3bf5faa956470c8f44e9c))

### [1.284.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.284.1...v1.284.2) (2022-09-13)


### Bug Fixes

* **payment:** ADYEN-540 fixed adyen 3ds2 challenge on googlepay ([3b2bec4](https://github.com/bigcommerce/checkout-sdk-js/commit/3b2bec451615fbaecdeab92ea6f1381b02707c78))

### [1.284.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.284.0...v1.284.1) (2022-09-12)


### Code Refactoring

* **payment:** PAYPAL-1538 switched PayPalCommerce common button strategy with V2 and removed old implementation ([#1570](https://github.com/bigcommerce/checkout-sdk-js/issues/1570)) ([2b033fd](https://github.com/bigcommerce/checkout-sdk-js/commit/2b033fdd4b95c913824e9d4a2df682814fb2a759))

## [1.284.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.283.1...v1.284.0) (2022-09-09)


### Features

* **checkout:** STRF-9858 Bodl Service: Checkout Begin and Order Purchased ([#1587](https://github.com/bigcommerce/checkout-sdk-js/issues/1587)) ([1e7e054](https://github.com/bigcommerce/checkout-sdk-js/commit/1e7e0546d2f24e7f1fb37a0fd42b84d59f40cf57))

### [1.283.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.283.0...v1.283.1) (2022-09-08)


### Bug Fixes

* **common:** CHECKOUT-000 Remove token strings from test files ([#1589](https://github.com/bigcommerce/checkout-sdk-js/issues/1589)) ([164bbaa](https://github.com/bigcommerce/checkout-sdk-js/commit/164bbaa961ca306a3c59719fc986d747a8b0334a))

## [1.283.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.282.0...v1.283.0) (2022-09-08)


### Features

* **payment:** PAYPAL-1474 added PayPalCommerceInlineCheckoutButtonStrategy ([#1494](https://github.com/bigcommerce/checkout-sdk-js/issues/1494)) ([d5003d3](https://github.com/bigcommerce/checkout-sdk-js/commit/d5003d36a3b6103b65979e1eaec2171ea55eb227))

## [1.282.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.281.2...v1.282.0) (2022-09-07)


### Features

* **payment:** INT-6310 added bank of new zealand strategy ([#1530](https://github.com/bigcommerce/checkout-sdk-js/issues/1530)) ([c696a22](https://github.com/bigcommerce/checkout-sdk-js/commit/c696a22411e8443526a7a3d144a039a775ec6989))

### [1.281.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.281.1...v1.281.2) (2022-09-07)

### [1.281.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.281.0...v1.281.1) (2022-09-05)


### Bug Fixes

* **payment:** INT-6328 Bluesnap open a new tab insted of using iframe to complete order ([#1578](https://github.com/bigcommerce/checkout-sdk-js/issues/1578)) ([701d09b](https://github.com/bigcommerce/checkout-sdk-js/commit/701d09bdf388128aab900160f26f69df74085305))

## [1.281.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.280.4...v1.281.0) (2022-09-05)


### Features

* **payment:** INT-6407 AmazonPayV2: Add the new `estimatedOrderAmount` parameter ([#1555](https://github.com/bigcommerce/checkout-sdk-js/issues/1555)) ([8defc3b](https://github.com/bigcommerce/checkout-sdk-js/commit/8defc3bcf099a3caac9ebb26a97716a6f2a73e07))


### Bug Fixes

* **payment:** INT-6115 Payment with hosted credit card ([#1583](https://github.com/bigcommerce/checkout-sdk-js/issues/1583)) ([a491acf](https://github.com/bigcommerce/checkout-sdk-js/commit/a491acf699e86fd52e1ee45e4125e463c002e451))

### [1.280.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.280.3...v1.280.4) (2022-08-30)


### Bug Fixes

* **payment:** STRIPE-130 Stripe UPE making postal code not always required to make purchase ([#1565](https://github.com/bigcommerce/checkout-sdk-js/issues/1565)) ([6e0bb16](https://github.com/bigcommerce/checkout-sdk-js/commit/6e0bb1676647600da55b776b832d1bb3626f4079))

### [1.280.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.280.2...v1.280.3) (2022-08-26)


### Bug Fixes

* **common:** CHECKOUT-000 upgrade @braintree/browser-detection from 1.12.1 to 1.14.0 ([#1571](https://github.com/bigcommerce/checkout-sdk-js/issues/1571)) ([108c44d](https://github.com/bigcommerce/checkout-sdk-js/commit/108c44da2e66c792c46b88b37f88acd1e96746ac))
* **common:** CHECKOUT-000 upgrade core-js from 3.23.4 to 3.24.0 ([#1572](https://github.com/bigcommerce/checkout-sdk-js/issues/1572)) ([c820f3d](https://github.com/bigcommerce/checkout-sdk-js/commit/c820f3dfb8681e5950d3542fb1d7225160e35ddf))
* **common:** CHECKOUT-000 upgrade local-storage-fallback from 4.1.1 to 4.1.2 ([#1574](https://github.com/bigcommerce/checkout-sdk-js/issues/1574)) ([24b72c5](https://github.com/bigcommerce/checkout-sdk-js/commit/24b72c5f7409b2bd7ce8c8a94cf4f3f2389f9b3b))
* **common:** CHECKOUT-000 upgrade reselect from 4.1.5 to 4.1.6 ([#1573](https://github.com/bigcommerce/checkout-sdk-js/issues/1573)) ([c7c49e8](https://github.com/bigcommerce/checkout-sdk-js/commit/c7c49e8cb3ab88f7b5736bb5e084b0efffd90f5b))
* **payment:** PAYPAL-1639 fixed paypal commerce zoid issue ([#1577](https://github.com/bigcommerce/checkout-sdk-js/issues/1577)) ([2e993d3](https://github.com/bigcommerce/checkout-sdk-js/commit/2e993d3158c038cf07bb1a1b0969588d67b3a640))

### [1.280.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.280.1...v1.280.2) (2022-08-24)


### Bug Fixes

* **payment:** INT-6392 [Mollie] Klarna shopper are able to place orders with digital items through klarna pay later and slice it when them are added via coupon ([#1558](https://github.com/bigcommerce/checkout-sdk-js/issues/1558)) ([5cb129c](https://github.com/bigcommerce/checkout-sdk-js/commit/5cb129c76fe58a572659da96d32ac37ed5a62e1f))

### [1.280.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.280.0...v1.280.1) (2022-08-22)


### Bug Fixes

* **payment:** PAYPAL-0000 updated paypal button rendering implementation in PayPalCommerceCreditButtonStrategy ([#1575](https://github.com/bigcommerce/checkout-sdk-js/issues/1575)) ([dee1b67](https://github.com/bigcommerce/checkout-sdk-js/commit/dee1b67f2a0005fdd8d61a5978ab5b6de57f7e44))

## [1.280.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.279.3...v1.280.0) (2022-08-18)


### Features

* **payment:** PAYPAL-1386 added PayPalCommerceCredit checkout button strategy ([#1557](https://github.com/bigcommerce/checkout-sdk-js/issues/1557)) ([14275b6](https://github.com/bigcommerce/checkout-sdk-js/commit/14275b662cf9a30b588dd17b1ab0366f43accba6))
* **payment:** PAYPAL-1537 added PayPalCommerceV2ButtonStrategy ([#1562](https://github.com/bigcommerce/checkout-sdk-js/issues/1562)) ([69914e4](https://github.com/bigcommerce/checkout-sdk-js/commit/69914e489c315bf435c41d55ccfbbb8b4dc70c0b))

### [1.279.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.279.2...v1.279.3) (2022-08-18)


### Bug Fixes

* **common:** CHECKOUT-000 upgrade @bigcommerce/script-loader from 2.2.1 to 2.2.2 ([#1546](https://github.com/bigcommerce/checkout-sdk-js/issues/1546)) ([7b45285](https://github.com/bigcommerce/checkout-sdk-js/commit/7b45285b96de690bee7cd5e143df7a051a94a888))
* **common:** CHECKOUT-000 upgrade @braintree/browser-detection from 1.11.0 to 1.12.1 ([#1543](https://github.com/bigcommerce/checkout-sdk-js/issues/1543)) ([cefcb92](https://github.com/bigcommerce/checkout-sdk-js/commit/cefcb92a7c19c708f1f824d0a172dd7569ee8a48))
* **common:** CHECKOUT-000 upgrade @types/iframe-resizer from 3.5.6 to 3.5.9 ([#1544](https://github.com/bigcommerce/checkout-sdk-js/issues/1544)) ([fdaef89](https://github.com/bigcommerce/checkout-sdk-js/commit/fdaef89e875935690480d85ad832f4888e8d4174))
* **common:** CHECKOUT-000 upgrade core-js from 3.20.1 to 3.23.4 ([#1542](https://github.com/bigcommerce/checkout-sdk-js/issues/1542)) ([6082419](https://github.com/bigcommerce/checkout-sdk-js/commit/6082419fcfb1665323794163371aa27c58f1bc9d))
* **common:** CHECKOUT-000 upgrade query-string from 7.0.1 to 7.1.1 ([#1545](https://github.com/bigcommerce/checkout-sdk-js/issues/1545)) ([7a1fa61](https://github.com/bigcommerce/checkout-sdk-js/commit/7a1fa616712e3ca9429e4cc69dcda004817ba026))

### [1.279.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.279.1...v1.279.2) (2022-08-16)


### Code Refactoring

* **payment:** PAYPAL-1611 removed PAYPAL-1149.braintree-new-card-below-totals-banner-placement experiment ([#1564](https://github.com/bigcommerce/checkout-sdk-js/issues/1564)) ([52ca958](https://github.com/bigcommerce/checkout-sdk-js/commit/52ca9583bd641fc1ad8b25b9b864f4ca8d8bdd19))

### [1.279.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.279.0...v1.279.1) (2022-08-16)


### Bug Fixes

* **payment:** STRIPE-53 Give more information on payment authentication with 3ds failure error message ([#1488](https://github.com/bigcommerce/checkout-sdk-js/issues/1488)) ([80d6f4a](https://github.com/bigcommerce/checkout-sdk-js/commit/80d6f4acd9ed6a39f0190fe608d36ffe01fb683c))

## [1.279.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.278.1...v1.279.0) (2022-08-16)


### Features

* **payment:** INT-6342 fix klarna issue adding klarna v1 payment_method ([#1522](https://github.com/bigcommerce/checkout-sdk-js/issues/1522)) ([b2097c9](https://github.com/bigcommerce/checkout-sdk-js/commit/b2097c9402d3f13fea5ff52039035a49967ca46a))

### [1.278.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.278.0...v1.278.1) (2022-08-13)

## [1.278.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.277.0...v1.278.0) (2022-08-12)


### Features

* **payment:** INT-6115 Worldpay - Allow to pay ([a185678](https://github.com/bigcommerce/checkout-sdk-js/commit/a185678c830f5f07ba1271e03c063abd237db30c))
* **payment:** INT-6115 Worldpay - animesh1987 | Comments ([f453fef](https://github.com/bigcommerce/checkout-sdk-js/commit/f453fef0611358eb49c985e444959059439c2cfd))

## [1.277.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.276.2...v1.277.0) (2022-08-12)


### Features

* **checkout-button:** INT-6023 Resize VCO button for Discover cards ([#1489](https://github.com/bigcommerce/checkout-sdk-js/issues/1489)) ([24e78e6](https://github.com/bigcommerce/checkout-sdk-js/commit/24e78e6d40944037611aaf7fe83b6059da574c8b))

### [1.276.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.276.1...v1.276.2) (2022-08-12)


### Bug Fixes

* **payment:** INT-5854 [Mollie] Klarna is not available if cart contains digital products ([#1510](https://github.com/bigcommerce/checkout-sdk-js/issues/1510)) ([9077b3e](https://github.com/bigcommerce/checkout-sdk-js/commit/9077b3e05d4eda9e01ae7f855a07e3caee90ee1e))

### [1.276.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.276.0...v1.276.1) (2022-08-10)

## [1.276.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.275.1...v1.276.0) (2022-08-10)


### Features

* **checkout:** STRF-9829 Add hidePriceFromGuests to StoreConfig interface ([#1521](https://github.com/bigcommerce/checkout-sdk-js/issues/1521)) ([b31963b](https://github.com/bigcommerce/checkout-sdk-js/commit/b31963bdeaa8cadca8acec9113417b188989203c))


### Bug Fixes

* **order:** CHECKOUT-000 update order consignments interface ([#1552](https://github.com/bigcommerce/checkout-sdk-js/issues/1552)) ([4644e37](https://github.com/bigcommerce/checkout-sdk-js/commit/4644e3784f6be26a476ddd0850c713382421cb1e))

### [1.275.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.275.0...v1.275.1) (2022-08-09)

## [1.275.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.274.0...v1.275.0) (2022-08-09)


### Features

* **payment:** INT-6128 AmazonPayV2: Introduce the new API V2 config ([#1502](https://github.com/bigcommerce/checkout-sdk-js/issues/1502)) ([11bbe8b](https://github.com/bigcommerce/checkout-sdk-js/commit/11bbe8b4ec82d063cc13d9fdf3d8f59c282b7109))

## [1.274.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.273.0...v1.274.0) (2022-08-08)


### Features

* **checkout:** CHECKOUT-6781 Point to interfaces extracted from integration packages ([d12f024](https://github.com/bigcommerce/checkout-sdk-js/commit/d12f024a3dc53db847900f8e3d87d8c4b88ee031))


### Bug Fixes

* **payment:** STRIPE-51 set a stored card as default during checkout ([#1498](https://github.com/bigcommerce/checkout-sdk-js/issues/1498)) ([d929a2d](https://github.com/bigcommerce/checkout-sdk-js/commit/d929a2d20cd424a4a88430a8571b7ab5e3dfff3d))

## [1.273.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.272.3...v1.273.0) (2022-08-03)


### Features

* **payment:** ADYEN-539 added vaulting card validation ([32d846b](https://github.com/bigcommerce/checkout-sdk-js/commit/32d846b684e9e240900f6dbf05dc6e1c2f2d5f5a))

### [1.272.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.272.2...v1.272.3) (2022-08-03)


### Bug Fixes

* **common:** CHECKOUT-0000 upgrade @babel/polyfill from 7.4.4 to 7.12.1 ([#1516](https://github.com/bigcommerce/checkout-sdk-js/issues/1516)) ([e3eb94b](https://github.com/bigcommerce/checkout-sdk-js/commit/e3eb94b8163e669fc92e48a750f01a8ac0212094))
* **common:** CHECKOUT-0000 upgrade @bigcommerce/request-sender from 1.0.3 to 1.2.1 ([#1533](https://github.com/bigcommerce/checkout-sdk-js/issues/1533)) ([59aeeeb](https://github.com/bigcommerce/checkout-sdk-js/commit/59aeeebbbf4552479dbfbef58feb96349d3fe771))
* **common:** CHECKOUT-0000 upgrade @types/lodash from 4.14.178 to 4.14.182 ([#1531](https://github.com/bigcommerce/checkout-sdk-js/issues/1531)) ([23e09e6](https://github.com/bigcommerce/checkout-sdk-js/commit/23e09e63280e25cfc38a82d5ab58305a90175ad6))
* **common:** CHECKOUT-0000 upgrade iframe-resizer from 3.6.2 to 3.6.6 ([#1532](https://github.com/bigcommerce/checkout-sdk-js/issues/1532)) ([2935623](https://github.com/bigcommerce/checkout-sdk-js/commit/29356236ae5be2b8a38a086bdae9caef8104a416))

### [1.272.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.272.1...v1.272.2) (2022-08-03)


### Bug Fixes

* **common:** CHECKOUT-0000 upgrade rxjs from 6.5.3 to 6.6.7 ([#1515](https://github.com/bigcommerce/checkout-sdk-js/issues/1515)) ([4969178](https://github.com/bigcommerce/checkout-sdk-js/commit/4969178f89c597c710aaf1a4a1f55d693700c95e))

### [1.272.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.272.0...v1.272.1) (2022-08-02)


### Bug Fixes

* **payment:** PAYMENTS-8045 Fix form fields parameter name for PPSDK redirect ([003ab9e](https://github.com/bigcommerce/checkout-sdk-js/commit/003ab9e145c99234666e5a3c48f2f1e69e7777bd))

## [1.272.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.271.3...v1.272.0) (2022-08-02)


### Features

* **checkout:** CHECKOUT-6781 Generate new enum from existing enums ([779f3f5](https://github.com/bigcommerce/checkout-sdk-js/commit/779f3f5f891b55a05b0d3550f456cde1aa075098))


### Code Refactoring

* **payment:** CHECKOUT-6781 Remove unnecessary exports ([40990c2](https://github.com/bigcommerce/checkout-sdk-js/commit/40990c205559327155dfec4ca9d6aa0e72005587))

### [1.271.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.271.2...v1.271.3) (2022-07-28)

### [1.271.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.271.1...v1.271.2) (2022-07-28)


### Bug Fixes

* **checkout:** CHECKOUT-6781 Revert type exports ([#1526](https://github.com/bigcommerce/checkout-sdk-js/issues/1526)) ([6ea0c76](https://github.com/bigcommerce/checkout-sdk-js/commit/6ea0c7663ed4cf821d7a56963d522fef4facbd05))

### [1.271.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.271.0...v1.271.1) (2022-07-28)


### Bug Fixes

* **checkout:** CHECKOUT-6781 Add missing exports ([3e9bec0](https://github.com/bigcommerce/checkout-sdk-js/commit/3e9bec04acc8819b7dade69e176f6b0f5fb2b1e2))
* **checkout:** CHECKOUT-6781 Fix incorrect file path ([3718554](https://github.com/bigcommerce/checkout-sdk-js/commit/37185542ff8b04002ad29c14c2f0477f17cad0e1))
* **checkout:** CHECKOUT-6781 Fix member pattern for button strategies ([fcc22bc](https://github.com/bigcommerce/checkout-sdk-js/commit/fcc22bc1534bbcb54ffdb0fccc19b91a3ae519db))


### Code Refactoring

* **common:** CHECKOUT-6781 Remove redundant logs ([0fc2cf5](https://github.com/bigcommerce/checkout-sdk-js/commit/0fc2cf5807496accc23970ebebf53a4a131a9f12))

## [1.271.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.270.0...v1.271.0) (2022-07-26)


### Features

* **checkout:** CHECKOUT-6780 Use Nx plugin to generate source files so that payment integration packages can be automatically registered ([9c8298a](https://github.com/bigcommerce/checkout-sdk-js/commit/9c8298abce327f6a78725370aca8a552bf59c0d9))

## [1.270.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.269.0...v1.270.0) (2022-07-20)


### Features

* **checkout:** CHECKOUT-6780 Add Nx plugin for generating source files ([3ed6e31](https://github.com/bigcommerce/checkout-sdk-js/commit/3ed6e31b598ffbb55fbb881f4b6d63ff2b77998f))

## [1.269.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.268.0...v1.269.0) (2022-07-20)


### Features

* **checkout:** CHECKOUT-6277 add eslint config to nx ([40d317d](https://github.com/bigcommerce/checkout-sdk-js/commit/40d317dbceb6829d29c44e01a7e0c2dbb73453cc))


### Code Refactoring

* **payment:** PAYPAL-1567 removed unnecessary method and class variable in PayPalCommerceVenmoButtonStrategy ([#1509](https://github.com/bigcommerce/checkout-sdk-js/issues/1509)) ([e50dee7](https://github.com/bigcommerce/checkout-sdk-js/commit/e50dee76eb1b1fc4b779f72f3f342e77271fa5a7))

## [1.268.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.267.0...v1.268.0) (2022-07-19)


### Features

* **payment:** PAYPAL-1532 added PayPalCommerceAlternativeMethods checkout button strategy ([#1505](https://github.com/bigcommerce/checkout-sdk-js/issues/1505)) ([edf237f](https://github.com/bigcommerce/checkout-sdk-js/commit/edf237f23533b7ff8cb192e5860a987f63bc92b9))

## [1.267.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.266.2...v1.267.0) (2022-07-18)


### Features

* **payment:** BOLT-255 remove experiment for last four digits type ([a8da3d7](https://github.com/bigcommerce/checkout-sdk-js/commit/a8da3d78855032498ac5892801dfb2e1aee3f50a))

### [1.266.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.266.1...v1.266.2) (2022-07-15)


### Bug Fixes

* **payment:** PAYPAL-0000 removed paypal commerce apms visibility on cart ([#1504](https://github.com/bigcommerce/checkout-sdk-js/issues/1504)) ([3cd204e](https://github.com/bigcommerce/checkout-sdk-js/commit/3cd204e1879d917f352c331d7b7e5649aa545ce6))

### [1.266.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.266.0...v1.266.1) (2022-07-13)


### Bug Fixes

* **payment:** PAYPAL-0000 fixed an issue with enable funding store configuration ([#1500](https://github.com/bigcommerce/checkout-sdk-js/issues/1500)) ([85281e1](https://github.com/bigcommerce/checkout-sdk-js/commit/85281e1b54c9f1aa7dfc9a1afd1184894ea25fa3))

## [1.266.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.265.0...v1.266.0) (2022-07-13)


### Features

* **payment:** PAYPAL-1549 added script options configuration method for PayPalCommerce ([#1496](https://github.com/bigcommerce/checkout-sdk-js/issues/1496)) ([c59a76e](https://github.com/bigcommerce/checkout-sdk-js/commit/c59a76e3cf56fbb84d8563b84991390cab671479))

## [1.265.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.264.2...v1.265.0) (2022-07-11)


### Features

* **payment:** INT-6276 Dispatch the thunk action to retrieve the payment method ([290e2fc](https://github.com/bigcommerce/checkout-sdk-js/commit/290e2fcaeef4a8beb5a937c30fb0c219fbee235a))

### [1.264.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.264.1...v1.264.2) (2022-07-11)

### [1.264.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.264.0...v1.264.1) (2022-07-06)

## [1.264.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.263.0...v1.264.0) (2022-07-05)


### Features

* **payment:** INT-3926 StripeV3: Google Pay: Add BOPIS support ([#1483](https://github.com/bigcommerce/checkout-sdk-js/issues/1483)) ([ccde9b2](https://github.com/bigcommerce/checkout-sdk-js/commit/ccde9b27d86fa83c9bc8db59be695d386d4c545c))

## [1.263.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.262.4...v1.263.0) (2022-07-05)


### Features

* **payment:** PAYPAL-1383 added PayPalCommerce Venmo button strategy ([#1485](https://github.com/bigcommerce/checkout-sdk-js/issues/1485)) ([6fb289f](https://github.com/bigcommerce/checkout-sdk-js/commit/6fb289fa252b5a21cdc0958dfa88a1121e200775))

### [1.262.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.262.3...v1.262.4) (2022-07-05)

### [1.262.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.262.2...v1.262.3) (2022-07-01)

### [1.262.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.262.1...v1.262.2) (2022-06-30)


### Code Refactoring

* **payment:** PAYPAL-1534 removed Braintree v2 button strategies names ([#1484](https://github.com/bigcommerce/checkout-sdk-js/issues/1484)) ([5533d96](https://github.com/bigcommerce/checkout-sdk-js/commit/5533d96002a119a5eaff92872b2cc9b21e38e6db))

### [1.262.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.262.0...v1.262.1) (2022-06-30)


### Bug Fixes

* **payment:** CHECKOUT-6790 Fix phone number with apple pay ([#1481](https://github.com/bigcommerce/checkout-sdk-js/issues/1481)) ([3ca3720](https://github.com/bigcommerce/checkout-sdk-js/commit/3ca3720d7fbc8cdbeedb61538b9fe81214a99955))

## [1.262.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.261.0...v1.262.0) (2022-06-30)


### Features

* **checkout:** CHECKOUT-6722 pass cart Id to SF/payments API endpoint ([91a6872](https://github.com/bigcommerce/checkout-sdk-js/commit/91a68729fbdd316755284ec542742d0505e0743a))

## [1.261.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.260.0...v1.261.0) (2022-06-28)


### Features

* **payment:** INT-3925 StripeV3: BOPIS ([#1423](https://github.com/bigcommerce/checkout-sdk-js/issues/1423)) ([1c5fbf0](https://github.com/bigcommerce/checkout-sdk-js/commit/1c5fbf02f042125b64a839e4f32730ad4b16b8e0))

## [1.260.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.259.0...v1.260.0) (2022-06-27)


### Features

* **payment:** PAYPAL-1505 removed BraintreePayPalV1Button strategy ([#1475](https://github.com/bigcommerce/checkout-sdk-js/issues/1475)) ([23978e0](https://github.com/bigcommerce/checkout-sdk-js/commit/23978e04a4d57c4761cc2f88391e45128aba4a0b))


### Code Refactoring

* **payment:** PAYPAL-1530 removed Progressive Onboarding feature from PayPalCommerce ([#1478](https://github.com/bigcommerce/checkout-sdk-js/issues/1478)) ([5ece6a8](https://github.com/bigcommerce/checkout-sdk-js/commit/5ece6a8afa8ab7c951a3b30e251acb1589f08253))

## [1.259.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.258.1...v1.259.0) (2022-06-21)


### Features

* **checkout:** CHECKOUT-6765 Update checkout SDK to pass checkout Id to checkout settings api as query string ([c25f293](https://github.com/bigcommerce/checkout-sdk-js/commit/c25f2932aa6c3b1bfff59e6a99560773fdbd82c3))

### [1.258.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.258.0...v1.258.1) (2022-06-20)

## [1.258.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.257.0...v1.258.0) (2022-06-20)


### Features

* **payment:** STRIPE-9 [Stripe UPE] Add support for Klarna ([ca706a5](https://github.com/bigcommerce/checkout-sdk-js/commit/ca706a5e040f309d1f10ca0295a52e76e30587e9))

## [1.257.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.256.0...v1.257.0) (2022-06-19)


### Features

* **checkout:** CHECKOUT-6722 pass cart Id to SF/payments API endpoint ([5f48c75](https://github.com/bigcommerce/checkout-sdk-js/commit/5f48c752a35b27ada9e4730f02d5b15ce27735d2))

## [1.256.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.255.0...v1.256.0) (2022-06-17)


### Features

* **payment:** PAYPAL-1508 removed authentication insight check to make an ability to force trigger 3ds check on Braintree ([#1473](https://github.com/bigcommerce/checkout-sdk-js/issues/1473)) ([6c73d6c](https://github.com/bigcommerce/checkout-sdk-js/commit/6c73d6c2cdffbfd34d6a68bf0be6cff87c7f33ad))

## [1.255.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.254.0...v1.255.0) (2022-06-16)


### Features

* **payment:** PAYPAL-1487 Add paypalcommercevenmo module ([3165559](https://github.com/bigcommerce/checkout-sdk-js/commit/3165559e139962a0cd07dfd212ca822aa64abd31))

## [1.254.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.253.1...v1.254.0) (2022-06-16)


### Features

* **payment:** PAYMENTS-7524 Bump bigpay-client-js version to 5.18.0 to add human verification-related payload ([6e210c2](https://github.com/bigcommerce/checkout-sdk-js/commit/6e210c2577b2ba1123d67cd93c239495c7742dd5))
* **payment:** PAYMENTS-7524 Change StepHandler and ContinueHandler callback parameters to be an object of multiple callbacks ([38267d8](https://github.com/bigcommerce/checkout-sdk-js/commit/38267d8a9a6b159b96bc7e0e481e6ce3ffd25151))
* **payment:** PAYMENTS-7524 Human verification for PPSDK payment methods ([153c6c6](https://github.com/bigcommerce/checkout-sdk-js/commit/153c6c65e45eb8251010837a5b47ed73f0a1942b))

### [1.253.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.253.0...v1.253.1) (2022-06-14)


### Code Refactoring

* **common:** CHECKOUT-6752 Refactor payment strategies to pass method as params ([4aa2e53](https://github.com/bigcommerce/checkout-sdk-js/commit/4aa2e53deaa969999d15de9eed9693b8e1a03d18))

## [1.253.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.252.0...v1.253.0) (2022-06-14)


### Features

* **payment:** PAYPAL-1381 added braintreevenmo checkout button strategy ([#1463](https://github.com/bigcommerce/checkout-sdk-js/issues/1463)) ([659bb0d](https://github.com/bigcommerce/checkout-sdk-js/commit/659bb0d367f0cb7509da196344a9a28d0e28e0a1))

## [1.252.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.251.0...v1.252.0) (2022-06-14)


### Features

* **payment:** PAYPAL-1382 added braintreepaypal checkout button strategy ([#1465](https://github.com/bigcommerce/checkout-sdk-js/issues/1465)) ([b2446ac](https://github.com/bigcommerce/checkout-sdk-js/commit/b2446ac68c4496c6a8935a1c284a7e747b00d13f))

## [1.251.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.250.0...v1.251.0) (2022-06-14)


### Features

* **payment:** PAYPAL-1382 added _removeElement method instead of _hideElement in BraintreePayPalCreditButtonStrategy ([a9a5e8e](https://github.com/bigcommerce/checkout-sdk-js/commit/a9a5e8e71593cd668c0261e0e86f8309ac2c8fb2))
* **payment:** PAYPAL-1382 added braintreepaypalcredit checkout button strategy ([82aa29e](https://github.com/bigcommerce/checkout-sdk-js/commit/82aa29e016c493602e7ef6144c66d663e9b966b6))
* **payment:** PAYPAL-1382 cleared some code in BraintreePayPalCreditButtonStrategy ([33edc69](https://github.com/bigcommerce/checkout-sdk-js/commit/33edc6913baeb247ab6f396047e91326ae1f6334))
* **payment:** PAYPAL-1382 updated checkout button method mapper ([b165152](https://github.com/bigcommerce/checkout-sdk-js/commit/b165152f173942b37f4875426e104095fdc64294))


### Bug Fixes

* **payment:** PAYPAL-1382 fixed an issue with braintreepaypalcreditv2 naming ([e061d19](https://github.com/bigcommerce/checkout-sdk-js/commit/e061d196fb975c8893272fdfda91de87e11dcd91))

## [1.250.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.249.0...v1.250.0) (2022-06-08)


### Features

* **payment:** PAYPAL-1368 added checking required fields ([aa706e7](https://github.com/bigcommerce/checkout-sdk-js/commit/aa706e7d468ad5bc8e354e59e60d863c662d87d5))

## [1.249.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.248.2...v1.249.0) (2022-06-06)


### Features

* **payment:** PAYPAL-0000 updated braintree paypal checkout button strategy to prepare strategies separation ([5d68a3d](https://github.com/bigcommerce/checkout-sdk-js/commit/5d68a3d2b30bb7b6ddaa363e42da30655fef6f6b))

### [1.248.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.248.1...v1.248.2) (2022-06-03)


### Bug Fixes

* **payment:** INT-6055 Stripe UPE mount fields properly if previously selected ([34df8a6](https://github.com/bigcommerce/checkout-sdk-js/commit/34df8a6b0b224d694d4e717273c6d1dd82ac90b3))

### [1.248.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.248.0...v1.248.1) (2022-06-01)

## [1.248.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.247.1...v1.248.0) (2022-05-31)


### Features

* **checkout:** CHECKOUT-6703 post cartid for order creation API endpoint ([2f9bd11](https://github.com/bigcommerce/checkout-sdk-js/commit/2f9bd11cd66174dba481e5d8ede8f3757083c321))

### [1.247.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.247.0...v1.247.1) (2022-05-30)


### Bug Fixes

* **payment:** INT-5826 AmazonPayV2: Provide a relative URL for `createCheckoutSession.url` ([d3d6951](https://github.com/bigcommerce/checkout-sdk-js/commit/d3d69518cb7a10d1e4ebb3e4fb3a3dd96e1108d6))

## [1.247.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.246.5...v1.247.0) (2022-05-30)


### Features

* **payment:** PAYPAL-1466 fixed currency issue ([#1457](https://github.com/bigcommerce/checkout-sdk-js/issues/1457)) ([8146537](https://github.com/bigcommerce/checkout-sdk-js/commit/814653783547daf2fe7ec460b3e042eb1dfef930))

### [1.246.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.246.4...v1.246.5) (2022-05-25)


### Bug Fixes

* **checkout:** ADYEN-480 adyen vaulting fix ([bdc90f1](https://github.com/bigcommerce/checkout-sdk-js/commit/bdc90f1c2f08939b65caa5da0b973082b04c5afb))

### [1.246.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.246.3...v1.246.4) (2022-05-25)


### Bug Fixes

* **payment:** INT-5949 stripe UPE Don't hide the state field ([#1431](https://github.com/bigcommerce/checkout-sdk-js/issues/1431)) ([3194435](https://github.com/bigcommerce/checkout-sdk-js/commit/31944355a188a83e3ad2a37e3f67bf761d737bc6))

### [1.246.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.246.2...v1.246.3) (2022-05-25)


### Bug Fixes

* **checkout:** IINT-5126 [MPGS] Add delay between calls for 3ds ([#1428](https://github.com/bigcommerce/checkout-sdk-js/issues/1428)) ([fa86745](https://github.com/bigcommerce/checkout-sdk-js/commit/fa86745d52168f440e513dc320e5623de6b4c75b))

### [1.246.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.246.1...v1.246.2) (2022-05-23)

### [1.246.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.246.0...v1.246.1) (2022-05-19)

## [1.246.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.245.1...v1.246.0) (2022-05-19)


### Features

* **payment:** PAYPAL-1465 added extra check for braintree 3DS verification ([538616f](https://github.com/bigcommerce/checkout-sdk-js/commit/538616f8d96219961b8e0a313bb1d4a904a11be7))

### [1.245.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.245.0...v1.245.1) (2022-05-19)


### Bug Fixes

* **payment:** INT-5481 Worldpay - Add worldpay initialize options ([82ae296](https://github.com/bigcommerce/checkout-sdk-js/commit/82ae2965f38784e111683795013d58d6b68d476d))

## [1.245.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.244.2...v1.245.0) (2022-05-18)


### Features

* **payment:** PAYPAL-1409 added OXXO APM to paypalcommerce ([1a5ef86](https://github.com/bigcommerce/checkout-sdk-js/commit/1a5ef86926a14b41b2684753016141a0471ca9c3))
* **payment:** PAYPAL-1420 add new creating flow for paypal oxxo ([fbf3f45](https://github.com/bigcommerce/checkout-sdk-js/commit/fbf3f45903afb5b9eafa4dbd7cdefa777a38fdad))
* **payment:** PAYPAL-1420 changes after code review ([a9cc582](https://github.com/bigcommerce/checkout-sdk-js/commit/a9cc5825c1be3be2d42101a1ea87c188ad9bcf5d))

### [1.244.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.244.1...v1.244.2) (2022-05-17)

### [1.244.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.244.0...v1.244.1) (2022-05-16)

## [1.244.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.243.0...v1.244.0) (2022-05-13)


### Features

* **checkout:** INT-5963 Check for feature flag when loading threeDS Script ([#1435](https://github.com/bigcommerce/checkout-sdk-js/issues/1435)) ([eeca0e4](https://github.com/bigcommerce/checkout-sdk-js/commit/eeca0e44937a1242e84c4897a48f8259767f4c09))

## [1.243.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.242.2...v1.243.0) (2022-05-05)


### Features

* **payment:** INT-5754 Stripe UPE update payment intent ([8c7fc8e](https://github.com/bigcommerce/checkout-sdk-js/commit/8c7fc8ee9a1f386cf19473c1f906b190e3f29192))

### [1.242.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.242.1...v1.242.2) (2022-05-02)


### Bug Fixes

* **checkout:** CHECKOUT-6631 Sentry issue bugfix ([#1425](https://github.com/bigcommerce/checkout-sdk-js/issues/1425)) ([fe43048](https://github.com/bigcommerce/checkout-sdk-js/commit/fe4304877ca73e96a1d6d6cda92dd480f6730917))

### [1.242.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.242.0...v1.242.1) (2022-05-02)

## [1.242.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.241.0...v1.242.0) (2022-04-28)


### Features

* **payment:** PAYPAL-1177 added implementation for checking 3DS regulation and handle 3DS required error from backend ([3e3513e](https://github.com/bigcommerce/checkout-sdk-js/commit/3e3513e013909ef87ea91eafc5e1ac399a0986e1))

## [1.241.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.240.5...v1.241.0) (2022-04-28)


### Features

* **checkout:** INT-5273 Non-Default Shipping Method Selection On Cart Page Is Not Persisted to Apple Pay ([cded620](https://github.com/bigcommerce/checkout-sdk-js/commit/cded620bee137dcb4947d134494429901983cab0))

### [1.240.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.240.4...v1.240.5) (2022-04-27)


### Bug Fixes

* **checkout:** ADYEN-431 AdyenV3 component state fix ([4300c75](https://github.com/bigcommerce/checkout-sdk-js/commit/4300c75b6b29ddcd89f017d7b4111c46664f26ee))

### [1.240.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.240.3...v1.240.4) (2022-04-27)


### Bug Fixes

* **common:** CHECKOUT-6591 Update node version requirement to >=14.18 ([a24bc1c](https://github.com/bigcommerce/checkout-sdk-js/commit/a24bc1c39c65a4d90f5c091f25a0920f61d5199f))

### [1.240.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.240.2...v1.240.3) (2022-04-26)


### Bug Fixes

* **common:** CHECKOUT-6268 Update asset path ([#1417](https://github.com/bigcommerce/checkout-sdk-js/issues/1417)) ([8aad60f](https://github.com/bigcommerce/checkout-sdk-js/commit/8aad60ff2fffa02d9caa1c20660ffe0718d901aa))

### [1.240.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.240.1...v1.240.2) (2022-04-26)


### Bug Fixes

* **common:** CHECKOUT-6268 Check in array while loading config ([#1415](https://github.com/bigcommerce/checkout-sdk-js/issues/1415)) ([3ba71c6](https://github.com/bigcommerce/checkout-sdk-js/commit/3ba71c65e408c9f138b24fa20c5fca9b9e161133))

### [1.240.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.240.0...v1.240.1) (2022-04-21)


### Bug Fixes

* **payment:** INT-5821 Stripe UPE Error on redirect payments with hidden fields ([#1397](https://github.com/bigcommerce/checkout-sdk-js/issues/1397)) ([f568e6c](https://github.com/bigcommerce/checkout-sdk-js/commit/f568e6c0c8d6d8525e3a1cc6c38f0757ed1c105d))

## [1.240.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.239.0...v1.240.0) (2022-04-19)


### Features

* **payment:** INT-5573 Add shopper locale to Mollie strategy ([#1399](https://github.com/bigcommerce/checkout-sdk-js/issues/1399)) ([a6c1e32](https://github.com/bigcommerce/checkout-sdk-js/commit/a6c1e320988602a0ee1a1ae5617e04f6ff32a741))

## [1.239.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.238.2...v1.239.0) (2022-04-18)


### Features

* **payment:** PAYMENTS-7707 Bump bigpay-client for PPSDK payment endpoint ([2714d24](https://github.com/bigcommerce/checkout-sdk-js/commit/2714d24430f48f3224d7f1b5d32dfd0feefe7292))
* **payment:** PAYMENTS-7707 Create PPSDK credit card payment substrategy ([775e17c](https://github.com/bigcommerce/checkout-sdk-js/commit/775e17c1b5a2241f12b6128ba8eacb0b0cf1764f))
* **payment:** PAYMENTS-7707 Update hosted forms to handle PPSDK credit card payment responses ([2db757f](https://github.com/bigcommerce/checkout-sdk-js/commit/2db757fcc599d731cb68605a3248dc114c2495eb))

### [1.238.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.238.1...v1.238.2) (2022-04-14)

### [1.238.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.238.0...v1.238.1) (2022-04-14)


### Bug Fixes

* **shipping:** CHECKOUT-6422 Use union type for consignment assignment interface ([#1405](https://github.com/bigcommerce/checkout-sdk-js/issues/1405)) ([0647e6f](https://github.com/bigcommerce/checkout-sdk-js/commit/0647e6fb8c8a46ff5cb932ec148419d011cef952))

## [1.238.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.237.3...v1.238.0) (2022-04-14)


### Features

* **payment:** INT-5060 Stripe UPE Look and Feel map theme styles to stripe appearance API ([2fd15b0](https://github.com/bigcommerce/checkout-sdk-js/commit/2fd15b0f217502a0773cec0c02a871a6459a9f45))

### [1.237.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.237.2...v1.237.3) (2022-04-13)


### Bug Fixes

* **checkout:** CHECKOUT-6563 Apple Pay in Cart does not load config ([#1402](https://github.com/bigcommerce/checkout-sdk-js/issues/1402)) ([dc66e45](https://github.com/bigcommerce/checkout-sdk-js/commit/dc66e45096b193d57f4e54a8d263dc210de4988e))

### [1.237.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.237.1...v1.237.2) (2022-04-11)


### Bug Fixes

* **payment:** CHECKOUT-6071 Add apple pay style container class ([#1400](https://github.com/bigcommerce/checkout-sdk-js/issues/1400)) ([f643abf](https://github.com/bigcommerce/checkout-sdk-js/commit/f643abf528aaeb33a320b1ab43b95858f9f9fe9b))

### [1.237.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.237.0...v1.237.1) (2022-04-07)


### Bug Fixes

* **payment:** BOLT-203 Incorrect type of last 4 card number digit ([24fb188](https://github.com/bigcommerce/checkout-sdk-js/commit/24fb188278732be703c347eb74cda65a4653cd9c))

## [1.237.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.236.0...v1.237.0) (2022-04-07)


### Features

* **payment:** CHECKOUT-6264 Add payment integration service ([0618c41](https://github.com/bigcommerce/checkout-sdk-js/commit/0618c417c1d283963ae39a6a44fd098ffe26e399))
* **shipping:** CHECKOUT-6422 Add address property to consignment interface ([#1386](https://github.com/bigcommerce/checkout-sdk-js/issues/1386)) ([1bbab84](https://github.com/bigcommerce/checkout-sdk-js/commit/1bbab8487f149811f8843857958cbcdb291aad4f))

## [1.236.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.235.1...v1.236.0) (2022-04-07)


### Features

* **checkout:** INT-5126 [MPGS] Add  MPGS to vaulting supported providers ([9c5cbd8](https://github.com/bigcommerce/checkout-sdk-js/commit/9c5cbd85b505ac12f65754ec9919225d23d24fc6))
* **checkout:** INT-5126 [MPGS] Add 3DS support to MPGS ([d7a8545](https://github.com/bigcommerce/checkout-sdk-js/commit/d7a85458db6bbe20071c9f51c0307bf6df84147c))
* **checkout:** INT-5126 [MPGS] Add retry limit for AuthenticatePayer ([63704a0](https://github.com/bigcommerce/checkout-sdk-js/commit/63704a0b4f841f2683174d6b63c6e512bba5fe0e))
* **checkout:** INT-5126 [MPGS] Add Unit Tests and small refactor ([2fca208](https://github.com/bigcommerce/checkout-sdk-js/commit/2fca208a2901104c3297bb0c7d38f43889574e78))
* **checkout:** INT-5126 [MPGS] Minor Styling Changes ([fcf5382](https://github.com/bigcommerce/checkout-sdk-js/commit/fcf5382fe1a7ca478fd1c624c3ad60ddb4673f5b))
* **payment:** INT-5498 add detach function to deinitialize ([c4067c7](https://github.com/bigcommerce/checkout-sdk-js/commit/c4067c745a44f9612fca4cf7170be154eb0afa59))

### [1.235.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.235.0...v1.235.1) (2022-04-06)


### Bug Fixes

* **checkout:** ADYEN-454 AdyenV2 initialize interface fix ([cf8f135](https://github.com/bigcommerce/checkout-sdk-js/commit/cf8f1355164c58aef28bcee670e1ac9b4239c8f6))

## [1.235.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.234.0...v1.235.0) (2022-04-04)


### Features

* **payment:** INT-5057 STRIPE UPE use vaulted card ([c78e600](https://github.com/bigcommerce/checkout-sdk-js/commit/c78e6007b709603f57a432a483cf0ad2fd01419f))


### Bug Fixes

* **checkout:** INT-5543 [CKO] Add token format support ([b4e0289](https://github.com/bigcommerce/checkout-sdk-js/commit/b4e02899d45fe5291dd8bb716c30e5ef4eeac67c))
* **checkout:** INT-5543 [CKO] Implement interface for processors ([059f7ec](https://github.com/bigcommerce/checkout-sdk-js/commit/059f7ecdfc489c5ed34432cf07b408fcf31e5b26))
* **checkout:** INT-5543 [CKO] Minor style changes ([1716cf5](https://github.com/bigcommerce/checkout-sdk-js/commit/1716cf5cb69665b645ede8eda2d48cbe6af4c3d0))
* **checkout:** INT-5543 [CKO] Solve conflicts and change window replace ([4490aef](https://github.com/bigcommerce/checkout-sdk-js/commit/4490aef7d6786ce2efd1227c4e00dd43f1c915a9))
* **checkout:** INT-5543 [CKO] Update to 3ds on Googlepay ([7b073a9](https://github.com/bigcommerce/checkout-sdk-js/commit/7b073a99f6383718a9062d435dc3aaa74e3aaf57))

## [1.234.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.233.0...v1.234.0) (2022-03-30)


### Features

* **checkout:** ADYEN-399 AdyenV3 googlepay ([e347d8a](https://github.com/bigcommerce/checkout-sdk-js/commit/e347d8ad8df7c844ab57366ce28d65b76aae6299))

## [1.233.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.232.2...v1.233.0) (2022-03-30)


### Features

* **payment:** INT-5572 Stripe UPE Hide Fields ([833c940](https://github.com/bigcommerce/checkout-sdk-js/commit/833c940a01d8bfbb8c404b32ffcf27cc5180c686))
* **payment:** INT-5572 Stripe UPE string constants ([66e06c4](https://github.com/bigcommerce/checkout-sdk-js/commit/66e06c41aa4d0f8dc901b58f113beabfcaf7ef09))


### Bug Fixes

* **payment:** INT-5175 fixing redirect in googlepay using embedded checkout on customer section ([42c3bc6](https://github.com/bigcommerce/checkout-sdk-js/commit/42c3bc65f4130bc4a7f9cc21311c7abe7c3acbc4))

### [1.232.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.232.1...v1.232.2) (2022-03-29)


### Bug Fixes

* **shipping:** CHECKOUT-0000 Throw error if no shipping options present ([#1389](https://github.com/bigcommerce/checkout-sdk-js/issues/1389)) ([670ea28](https://github.com/bigcommerce/checkout-sdk-js/commit/670ea28d6fcfc6d4a26d045967551268704f5b7c))

### [1.232.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.232.0...v1.232.1) (2022-03-28)

## [1.232.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.231.0...v1.232.0) (2022-03-24)


### Features

* **payment:** INT-5033 - INT-5053 [Stripe UPE] Add support for Giropay and Alipay ([#1361](https://github.com/bigcommerce/checkout-sdk-js/issues/1361)) ([2ed11b9](https://github.com/bigcommerce/checkout-sdk-js/commit/2ed11b9c99ae9276a8b8e0b054a2be7335a7897e))

## [1.231.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.230.0...v1.231.0) (2022-03-23)


### Features

* **payment:** INT-5042 [Stripe UPE] Add support for Bancontact & iDeal ([#1356](https://github.com/bigcommerce/checkout-sdk-js/issues/1356)) ([3495d00](https://github.com/bigcommerce/checkout-sdk-js/commit/3495d00d7b9b534ea3869cda58a58bbd84b4787e))


### Bug Fixes

* **payment:** INT-5723 fix customers with saved credit cards unable to check out with 3ds ([#1371](https://github.com/bigcommerce/checkout-sdk-js/issues/1371)) ([4f3fe50](https://github.com/bigcommerce/checkout-sdk-js/commit/4f3fe50ce0df58aeedd6a54f0414925bc24877d8))

## [1.230.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.229.0...v1.230.0) (2022-03-23)


### Features

* **payment:** INT-5040 Add GrabPay to StripeUPE ([#1350](https://github.com/bigcommerce/checkout-sdk-js/issues/1350)) ([dd41821](https://github.com/bigcommerce/checkout-sdk-js/commit/dd418217d2e233ea81ce1890c62549be8bc8fc6d))

## [1.229.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.228.0...v1.229.0) (2022-03-23)


### Features

* **payment:** INT-5061 Stripe UPE localization ([#1357](https://github.com/bigcommerce/checkout-sdk-js/issues/1357)) ([35b8341](https://github.com/bigcommerce/checkout-sdk-js/commit/35b83410b980ed6d2a4a09704f99d5c632b25cb9))

## [1.228.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.227.4...v1.228.0) (2022-03-22)


### Features

* **payment:** INT-5034 StripeUPE Add support for EPS ([#1348](https://github.com/bigcommerce/checkout-sdk-js/issues/1348)) ([ce342d9](https://github.com/bigcommerce/checkout-sdk-js/commit/ce342d94cef53d37d4e5b8b6ac137974dfc52ddb))

### [1.227.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.227.3...v1.227.4) (2022-03-22)


### Bug Fixes

* **payment:** INT-5619 fix deinitialize to remove dom elements on mollie strategy ([#1369](https://github.com/bigcommerce/checkout-sdk-js/issues/1369)) ([8e863db](https://github.com/bigcommerce/checkout-sdk-js/commit/8e863db49f272abfc2f8b13f8626861482c82d47))

### [1.227.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.227.2...v1.227.3) (2022-03-21)


### Bug Fixes

* **shipping:** CHECKOUT-6003 Fix issues found in testing pickup options implementation ([#1366](https://github.com/bigcommerce/checkout-sdk-js/issues/1366)) ([d5cfd22](https://github.com/bigcommerce/checkout-sdk-js/commit/d5cfd229b15a7548c916668a552a44a4fca3d137))

### [1.227.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.227.1...v1.227.2) (2022-03-20)


### Bug Fixes

* **checkout:** CHECKOUT-6125 Safari and Firefox focus loss bugfix ([#1373](https://github.com/bigcommerce/checkout-sdk-js/issues/1373)) ([e8f8f43](https://github.com/bigcommerce/checkout-sdk-js/commit/e8f8f438602e5efb5fae712495f2124a75b017da))

### [1.227.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.227.0...v1.227.1) (2022-03-16)


### Bug Fixes

* **payment:** INT-5645 Openpay: Change `OpyError` message ([f1e734f](https://github.com/bigcommerce/checkout-sdk-js/commit/f1e734f92e69c7c5a7c146d40a04a15a73a51e73))

## [1.227.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.226.0...v1.227.0) (2022-03-10)


### Features

* **checkout:** ADYEN-378 AdyenV3 module creation ([de64268](https://github.com/bigcommerce/checkout-sdk-js/commit/de64268aa1a21dc655161ab52088dbc6ce54b332))

## [1.226.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.225.0...v1.226.0) (2022-03-10)


### Features

* **payment:** INT-4970 Stored Credit Cards - vaulting enabled ([1fcda16](https://github.com/bigcommerce/checkout-sdk-js/commit/1fcda1644967f346c93bf59c51af2e3a22004b80))

## [1.225.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.224.0...v1.225.0) (2022-03-03)


### Features

* **payment:** INT-4970 bump bigpay-client for Opayo stored cards ([3619ab2](https://github.com/bigcommerce/checkout-sdk-js/commit/3619ab21e76ff0bee5b2cd2fc2e7ee0ba1b56491))

## [1.224.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.223.1...v1.224.0) (2022-02-28)


### Features

* **shipping:** CHECKOUT-6003 Add radius unit type and update interface ([#1354](https://github.com/bigcommerce/checkout-sdk-js/issues/1354)) ([d67049a](https://github.com/bigcommerce/checkout-sdk-js/commit/d67049a6bfc37e9483b36a23154ed0ab9edf01eb))

### [1.223.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.223.0...v1.223.1) (2022-02-28)

## [1.223.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.222.0...v1.223.0) (2022-02-24)


### Features

* **payment:** INT-5090 Stripe UPE add handler for redirect methods ([693ab4e](https://github.com/bigcommerce/checkout-sdk-js/commit/693ab4e357f9e885b3b1cd21970a4e5010457c13))
* **payment:** INT-5090 Stripe UPE SOFORT support ([4236bc1](https://github.com/bigcommerce/checkout-sdk-js/commit/4236bc1458fb74ec650bc24d9c065cd472df6aa5))
* **payment:** INT-5156 Klarna add support for poland, portugal, ireland ([#1351](https://github.com/bigcommerce/checkout-sdk-js/issues/1351)) ([1045e27](https://github.com/bigcommerce/checkout-sdk-js/commit/1045e271fc40f95982fa9172576bc35448fce219))

## [1.222.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.221.0...v1.222.0) (2022-02-21)


### Features

* **payment:** PAYPAL-1151 braintree venmo spb integration ([#1346](https://github.com/bigcommerce/checkout-sdk-js/issues/1346)) ([dbca991](https://github.com/bigcommerce/checkout-sdk-js/commit/dbca9919143260ae7a9626b124604b3412cdac23))

## [1.221.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.220.0...v1.221.0) (2022-02-18)


### Features

* **payment:** INT-5467 Stripe UPE GooglePay ([a821b71](https://github.com/bigcommerce/checkout-sdk-js/commit/a821b718ef3bc15a3e5703e9aa6b1012bcc98df4))
* **payment:** INT-5467 Stripe UPE GooglePay Checkout button and customer strategy ([a8ea005](https://github.com/bigcommerce/checkout-sdk-js/commit/a8ea005bd0f0632679cc4f499886d59cbd4e8256))
* **payment:** INT-5467 Stripe UPE GooglePay PR feedback ([6eed391](https://github.com/bigcommerce/checkout-sdk-js/commit/6eed3918247a0c0683c232c34040ae91257b4907))

## [1.220.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.219.0...v1.220.0) (2022-02-17)


### Features

* **shipping:** CHECKOUT-6003 Add method to fetch available shipping options ([#1337](https://github.com/bigcommerce/checkout-sdk-js/issues/1337)) ([2405886](https://github.com/bigcommerce/checkout-sdk-js/commit/2405886003e928596e43b91d1f51a43875984a10))

## [1.219.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.218.0...v1.219.0) (2022-02-17)


### Features

* **payment:** PAYPAL-1282 New style object for PayPal APMs ([#1330](https://github.com/bigcommerce/checkout-sdk-js/issues/1330)) ([89ecb3f](https://github.com/bigcommerce/checkout-sdk-js/commit/89ecb3f86019be9ddeadfa5b0e9d256fc4a88418))

## [1.218.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.217.0...v1.218.0) (2022-02-17)


### Features

* **payment:** INT-5384 Openpay: Add the learn more button widget ([6990849](https://github.com/bigcommerce/checkout-sdk-js/commit/69908496e5692611b12a60dae0b43b45591a4dc7))

## [1.217.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.216.0...v1.217.0) (2022-02-14)


### Features

* **payment:** INT-4282 removing masterpass logic for square ([8118522](https://github.com/bigcommerce/checkout-sdk-js/commit/8118522d5dd008d38a3f5f58468fe59c3b0bc8d0))

## [1.216.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.215.1...v1.216.0) (2022-02-10)


### Features

* **order:** INT-4776 Create a new field for the mandate reference ID ([#1220](https://github.com/bigcommerce/checkout-sdk-js/issues/1220)) ([e9005f5](https://github.com/bigcommerce/checkout-sdk-js/commit/e9005f56af5adb37322f19325e527f3b7b9e1500))

### [1.215.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.215.0...v1.215.1) (2022-02-10)

## [1.215.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.214.1...v1.215.0) (2022-02-08)


### Features

* **checkout:** CHECKOUT-6071 Update Apple Pay in Cart ([#1334](https://github.com/bigcommerce/checkout-sdk-js/issues/1334)) ([1dd8b0f](https://github.com/bigcommerce/checkout-sdk-js/commit/1dd8b0fc6e30459b1644a2a5f5e6bc323508a00e))

### [1.214.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.214.0...v1.214.1) (2022-02-07)


### Bug Fixes

* **common:**  CHECKOUT-0000 upgrade core-js from 3.1.2 to 3.20.1 ([#1323](https://github.com/bigcommerce/checkout-sdk-js/issues/1323)) ([4d1e4cd](https://github.com/bigcommerce/checkout-sdk-js/commit/4d1e4cde447e9046876e2c04acbc34fa96d84268))
* **common:** CHECKOUT-0000 upgrade @types/lodash from 4.14.139 to 4.14.178 ([#1324](https://github.com/bigcommerce/checkout-sdk-js/issues/1324)) ([78a3b65](https://github.com/bigcommerce/checkout-sdk-js/commit/78a3b652b3801dd9ffd0589db6f1d0f78ad00fb6))
* **common:** CHECKOUT-0000 upgrade reselect from 4.0.0 to 4.1.5 ([#1327](https://github.com/bigcommerce/checkout-sdk-js/issues/1327)) ([c6df17f](https://github.com/bigcommerce/checkout-sdk-js/commit/c6df17fa06d8136263f021ee406a7be7df1536f8))

## [1.214.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.213.1...v1.214.0) (2022-02-04)


### Features

* **payment:** INT-4969 add browser_info for Opayo ([b85353f](https://github.com/bigcommerce/checkout-sdk-js/commit/b85353fa4e84ef9ec1be66f10915b162958352da))
* **payment:** INT-4969 add SagePayPayload type ([647e87f](https://github.com/bigcommerce/checkout-sdk-js/commit/647e87f3852ee778a8dd6bded84dbab68b3d5b88))
* **payment:** INT-4969 add SagePayPayload type ([046e28d](https://github.com/bigcommerce/checkout-sdk-js/commit/046e28da021a1322c7f04c9fc63c2aeec746980c))
* **payment:** INT-4969 add Unit Tests ([ddfa5a7](https://github.com/bigcommerce/checkout-sdk-js/commit/ddfa5a75958c99aa443fbfb5b1f56d43af52621a))
* **payment:** INT-4969 remove SagePayPayload type ([c93499c](https://github.com/bigcommerce/checkout-sdk-js/commit/c93499cb858f6ba1116e3ac53a2fefbe046ad8d4))

### [1.213.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.213.0...v1.213.1) (2022-02-03)


### Bug Fixes

* **payment:** CHECKOUT-6070 Update style of apple pay customer step button ([#1341](https://github.com/bigcommerce/checkout-sdk-js/issues/1341)) ([d4a3fd4](https://github.com/bigcommerce/checkout-sdk-js/commit/d4a3fd4a6569e8039c1b9bb1f71ba27a6ca71624))

## [1.213.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.212.0...v1.213.0) (2022-02-03)


### Features

* **payment:** INT-4969 Bump bigpay-client dependency to add browser info for Opayo ([972e1bf](https://github.com/bigcommerce/checkout-sdk-js/commit/972e1bf4d267717a6323531b103e08a6c2791422))


### Bug Fixes

* **checkout:** INT-5409 Change error message when payment data is unavailable ([94cfe42](https://github.com/bigcommerce/checkout-sdk-js/commit/94cfe423d03ea9e454e15a2ffcc5a4abc3e08b61))

## [1.212.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.211.0...v1.212.0) (2022-02-02)


### Features

* **shipping:** CHECKOUT-6004 Add pickup options to consignment interfaces ([#1332](https://github.com/bigcommerce/checkout-sdk-js/issues/1332)) ([d201e5d](https://github.com/bigcommerce/checkout-sdk-js/commit/d201e5dc2ef3c1612097ee4a60182aa92ae695d0))

## [1.211.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.210.0...v1.211.0) (2022-01-20)


### Features

* **payments:** CHECKOUT-6070 Add apple pay customer strategy ([#1307](https://github.com/bigcommerce/checkout-sdk-js/issues/1307)) ([e0dcd53](https://github.com/bigcommerce/checkout-sdk-js/commit/e0dcd539d74d336364051e926673d2736324e49c))

## [1.210.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.209.0...v1.210.0) (2022-01-20)


### Features

* **payment:** INT-5150 Delete experiment StripeV3 enable_reuse_payment_intent experiment ([678291b](https://github.com/bigcommerce/checkout-sdk-js/commit/678291b2e78982fb9e65b35bd7b8080d6b3f6645))


### Bug Fixes

* **payment:** INT-5402 Afterpay - Change the SDK URL to the newest one ([5f826da](https://github.com/bigcommerce/checkout-sdk-js/commit/5f826da38b7c900c518e8b00351ba8cdb212d70f))

## [1.209.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.208.0...v1.209.0) (2022-01-18)


### Features

* **payment:** BOLT-135 multi-field component ([c234df0](https://github.com/bigcommerce/checkout-sdk-js/commit/c234df09b3e4623c4783f14953332955722de7ee))

## [1.208.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.207.0...v1.208.0) (2022-01-17)


### Features

* **payment:** PAYPAL-1208 renamed paypal Fields to PaymentFields ([#1313](https://github.com/bigcommerce/checkout-sdk-js/issues/1313)) ([bdf01d1](https://github.com/bigcommerce/checkout-sdk-js/commit/bdf01d1622d54d990df8c1c91b0fcd9cd2106404))

## [1.207.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.206.2...v1.207.0) (2022-01-17)


### Features

* **payment:** INT-5031 Stripe: Stripe UPE boilerplate ([#1295](https://github.com/bigcommerce/checkout-sdk-js/issues/1295)) ([f039e8b](https://github.com/bigcommerce/checkout-sdk-js/commit/f039e8b937dcb838006b51fde0ce9e49750b186b))

### [1.206.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.206.1...v1.206.2) (2022-01-11)


### Bug Fixes

* **payment:** ADYEN-373 fix iDEAL payment ([efa76e8](https://github.com/bigcommerce/checkout-sdk-js/commit/efa76e8ba2adf88face5e3e4e4d1d1ebbc1c8764))

### [1.206.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.206.0...v1.206.1) (2022-01-04)


### Bug Fixes

* **payment:** ADYEN-296 Card fields validation ([40b26f1](https://github.com/bigcommerce/checkout-sdk-js/commit/40b26f168b77adff3e11504733b9d4da722bf69a))

## [1.206.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.205.1...v1.206.0) (2021-12-21)


### Features

* **checkout:** CHECKOUT-6248 Throw Custom Error When Tax Service Unavailable ([#1306](https://github.com/bigcommerce/checkout-sdk-js/issues/1306)) ([1e2455e](https://github.com/bigcommerce/checkout-sdk-js/commit/1e2455eb5fe91d876e99c458320e75158017bcdb))

### [1.205.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.205.0...v1.205.1) (2021-12-19)


### Bug Fixes

* **payment:** INT-5166 CKO mapping for vaulted instrument ([fc02041](https://github.com/bigcommerce/checkout-sdk-js/commit/fc02041c785330cc02bba611cc42ef9673c12486))

## [1.205.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.204.0...v1.205.0) (2021-12-16)


### Features

* **payment:** INT-4893 Add translations for errors from execute step ([afa9698](https://github.com/bigcommerce/checkout-sdk-js/commit/afa9698afe63fdd6b09e7cb97abc6a37ae4ed8e1))
* **payment:** INT-4893 Retrieve initialization data from Humm ([b78a57d](https://github.com/bigcommerce/checkout-sdk-js/commit/b78a57d7e26963f5bb252f42e09b09bdf1e26ec4))

## [1.204.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.203.0...v1.204.0) (2021-12-13)


### Features

* **payment:** BOLT-109 added extra check for transaction reference what comes from Bolt ([fccb9e7](https://github.com/bigcommerce/checkout-sdk-js/commit/fccb9e79e7ffc87c8323fe67721a4fe5e5a35cbd))

## [1.203.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.202.0...v1.203.0) (2021-12-08)


### Features

* **payment:** BOLT-100 add error codes for Bolt fields ([cf9b5ec](https://github.com/bigcommerce/checkout-sdk-js/commit/cf9b5ec8e5a4103e1493b6267c407cc67c0b1285))
* **payment:** BOLT-100 add error mesages for Bolt fields ([1090565](https://github.com/bigcommerce/checkout-sdk-js/commit/109056578c7943f4922b472cd761b0073c850060))

## [1.202.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.201.2...v1.202.0) (2021-12-06)


### Features

* **payment:** INT-5000 Throw error when payment method isn't available ([#1286](https://github.com/bigcommerce/checkout-sdk-js/issues/1286)) ([893f1fc](https://github.com/bigcommerce/checkout-sdk-js/commit/893f1fca9e86a257be23b3803fdec91f291d884c))

### [1.201.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.201.1...v1.201.2) (2021-12-03)


### Bug Fixes

* **checkout:** ADYEN-320 reset adyen component state on deinitialize ([e484781](https://github.com/bigcommerce/checkout-sdk-js/commit/e484781f8b1b5951e1d7fa7231f8e9177533aa1a))

### [1.201.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.201.0...v1.201.1) (2021-12-02)


### Bug Fixes

* **payment:** CHECKOUT-6066 Remove 0 space characters ([#1300](https://github.com/bigcommerce/checkout-sdk-js/issues/1300)) ([83d7cc9](https://github.com/bigcommerce/checkout-sdk-js/commit/83d7cc9fae26dce7d515fbf66c2ef1f1a428587a))

## [1.201.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.200.0...v1.201.0) (2021-12-02)


### Features

* **payment:** INT-4897 Humm - Add Humm strategy as external payment ([#1266](https://github.com/bigcommerce/checkout-sdk-js/issues/1266)) ([e13dc61](https://github.com/bigcommerce/checkout-sdk-js/commit/e13dc614ad61e3e54a41013d78363e288cc7cea8))

## [1.200.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.199.1...v1.200.0) (2021-12-01)


### Features

* **payment:** CHECKOUT-6066 Add apple pay payment strategy ([#1297](https://github.com/bigcommerce/checkout-sdk-js/issues/1297)) ([d0558cc](https://github.com/bigcommerce/checkout-sdk-js/commit/d0558cc4f26623ffb4c68f05470d3360c1b44852))

### [1.199.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.199.0...v1.199.1) (2021-11-30)

## [1.199.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.198.0...v1.199.0) (2021-11-11)


### Features

* **payment:** INT-4909 Quadpay: Homologate with Zip's strategy ([#1279](https://github.com/bigcommerce/checkout-sdk-js/issues/1279)) ([a605b5d](https://github.com/bigcommerce/checkout-sdk-js/commit/a605b5d34b7cd9124c36da3ff600474e8ed4856e))

## [1.198.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.197.0...v1.198.0) (2021-11-11)


### Features

* **payment:** INT-4909 Zip: Delete experiment INT-3824.zip_force_redirect_flow ([#1267](https://github.com/bigcommerce/checkout-sdk-js/issues/1267)) ([e70805e](https://github.com/bigcommerce/checkout-sdk-js/commit/e70805e8ba6174d70f9934f79b801eb3722f6aa9))

## [1.197.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.196.1...v1.197.0) (2021-11-09)


### Features

* **payment:** INT-4646 Add Openpay payment strategy ([#1237](https://github.com/bigcommerce/checkout-sdk-js/issues/1237)) ([087976d](https://github.com/bigcommerce/checkout-sdk-js/commit/087976def11dc3d0c161b72e0b378972102a4c69))

### [1.196.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.196.0...v1.196.1) (2021-11-04)


### Bug Fixes

* **payment:** PAYMENTS-7408 suppress repeated thrown errors when resuming a PPSDK payment ([#1281](https://github.com/bigcommerce/checkout-sdk-js/issues/1281)) ([74caf9d](https://github.com/bigcommerce/checkout-sdk-js/commit/74caf9dedc2ee26612105ff2ff591c4a93625726))

## [1.196.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.195.0...v1.196.0) (2021-11-04)


### Features

* **payment:** CHECKOUT-6067 Filter applepay based on browser ([#1282](https://github.com/bigcommerce/checkout-sdk-js/issues/1282)) ([062d810](https://github.com/bigcommerce/checkout-sdk-js/commit/062d810f90593c64d1b5a3c849a6fbb401dc8dd2))

## [1.195.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.194.1...v1.195.0) (2021-11-01)


### Features

* **payment:** INT-4917 Add logo property to PaymentMethodConfig interface ([#1272](https://github.com/bigcommerce/checkout-sdk-js/issues/1272)) ([1f0a2a5](https://github.com/bigcommerce/checkout-sdk-js/commit/1f0a2a54c423b2b2148b1312281e0430478c0567))

### [1.194.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.194.0...v1.194.1) (2021-10-24)


### Bug Fixes

* **payment:** PAYMENTS-7390 use location.assign in PPSDK redirects to maintain correct browser history ([#1278](https://github.com/bigcommerce/checkout-sdk-js/issues/1278)) ([145b6d2](https://github.com/bigcommerce/checkout-sdk-js/commit/145b6d2ad8b10b0a2e0d464bfc552dfa3b455991))

## [1.194.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.193.0...v1.194.0) (2021-10-21)


### Features

* **payment:** BOLT-78 changed background color of mounted Bolt payment field ([90f5443](https://github.com/bigcommerce/checkout-sdk-js/commit/90f54433f31b22a3cd158c5990f426c203ada3da))

## [1.193.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.192.1...v1.193.0) (2021-10-21)


### Features

* **payment:** PAYPAL-1123 rounded amount on braintree ([#1271](https://github.com/bigcommerce/checkout-sdk-js/issues/1271)) ([d04c732](https://github.com/bigcommerce/checkout-sdk-js/commit/d04c732ea10d3f6356c312b4c5957d40ff9906b5))

### [1.192.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.192.0...v1.192.1) (2021-10-13)


### Bug Fixes

* **payment:** PAYPAL-1180 fixed paylater region issue ([#1269](https://github.com/bigcommerce/checkout-sdk-js/issues/1269)) ([6a8f6df](https://github.com/bigcommerce/checkout-sdk-js/commit/6a8f6df8652053cfe5d67f723872a8fee64cfe0a))

## [1.192.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.191.0...v1.192.0) (2021-10-12)


### Features

* **payment:** BOLT-73 send orderId during payment creation for Bolt Full Ckeckout ([c35d325](https://github.com/bigcommerce/checkout-sdk-js/commit/c35d32554993a763fcd9258fa37de374d5057f43))

## [1.191.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.190.2...v1.191.0) (2021-10-12)


### Features

* **payment:** INT-4891 Add support to remount compliance section for Digital River ([d9858de](https://github.com/bigcommerce/checkout-sdk-js/commit/d9858de64c8b6d309f70352eb2ee3f87209d1566))

### [1.190.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.190.1...v1.190.2) (2021-10-11)


### Bug Fixes

* **payment:** INT-4885 Fixed "select a different card" button on googlepay ([f514618](https://github.com/bigcommerce/checkout-sdk-js/commit/f51461890431ab36138c4e1fbf4772e7eb14de60))

### [1.190.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.190.0...v1.190.1) (2021-10-10)

## [1.190.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.189.0...v1.190.0) (2021-10-08)


### Features

* **payment:** INT-4593 handle squareForm errors ([f9baee6](https://github.com/bigcommerce/checkout-sdk-js/commit/f9baee6fd59584708a421983393ce969c7974b92))

## [1.189.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.188.1...v1.189.0) (2021-10-06)


### Features

* **payment:** INT-4231 deleting spinner functionality in amazonpay ([#1219](https://github.com/bigcommerce/checkout-sdk-js/issues/1219)) ([30cc04e](https://github.com/bigcommerce/checkout-sdk-js/commit/30cc04ecdd65150a2b6ce41270614cadba49f8ea))

### [1.188.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.188.0...v1.188.1) (2021-10-05)


### Bug Fixes

* **payment:** ADYEN-253 disabled showing error modal on Adyen GooglePay 3ds ([f504dff](https://github.com/bigcommerce/checkout-sdk-js/commit/f504dff130a748cae1c3400c5c67fed7d1ae023f))

## [1.188.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.187.1...v1.188.0) (2021-10-05)


### Features

* **payment:** PAYMENTS-7269 allow PPSDK payment methods to finalise in progress payments ([#1252](https://github.com/bigcommerce/checkout-sdk-js/issues/1252)) ([e6d02cc](https://github.com/bigcommerce/checkout-sdk-js/commit/e6d02ccc2b590763a8761237638c25166f3cf35f))
* **payment:** PAYMENTS-7269 allow PPSDK payment methods to finalise in progress payments ([#1261](https://github.com/bigcommerce/checkout-sdk-js/issues/1261)) ([5d43fcc](https://github.com/bigcommerce/checkout-sdk-js/commit/5d43fcc1ba73d990c2a413f67adecf23cac4c7a2))

### [1.187.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.187.0...v1.187.1) (2021-10-01)

## [1.187.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.186.1...v1.187.0) (2021-09-30)


### Features

* **payment:** PAYMENTS-7270 skip PPSDK finalization when order is marked complete ([#1256](https://github.com/bigcommerce/checkout-sdk-js/issues/1256)) ([67c1a90](https://github.com/bigcommerce/checkout-sdk-js/commit/67c1a905447ce4283bbb1c38a27dab19ee7a30f4))

### [1.186.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.186.0...v1.186.1) (2021-09-30)


### Bug Fixes

* **checkout:** ADYEN-260 fixed googlepay updates billing info, removed update of customer email ([53222a7](https://github.com/bigcommerce/checkout-sdk-js/commit/53222a7a10789bcc6ffdcb685be753a71c1ee92e))

## [1.186.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.185.2...v1.186.0) (2021-09-30)


### Features

* **payment:** PAYPAL-1103 added paylater messaging for braintree on cart ([#1245](https://github.com/bigcommerce/checkout-sdk-js/issues/1245)) ([08b418a](https://github.com/bigcommerce/checkout-sdk-js/commit/08b418acec6d00feb34811f2c425a3bc1e7eb2e9))

### [1.185.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.185.1...v1.185.2) (2021-09-29)

### [1.185.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.185.0...v1.185.1) (2021-09-29)


### Bug Fixes

* **payment:** INT-4087 Add a flag to enable or disable the send back the client token ([2389370](https://github.com/bigcommerce/checkout-sdk-js/commit/238937068ad16526e6f58cf92b0b9497e2e1bd0f))
* **payment:** INT-4087 Catch stripe exception to process 3ds when payment intent is updated on the banckend and confirm it ([5651c70](https://github.com/bigcommerce/checkout-sdk-js/commit/5651c70c85f753e600092412ee2aa409fe26d4cb))
* **payment:** INT-4489 cko add supported method 'card' ([22f51fd](https://github.com/bigcommerce/checkout-sdk-js/commit/22f51fd32624d36ef0c6af3a2afdade00bdd8cb4))

## [1.185.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.184.0...v1.185.0) (2021-09-29)


### Features

* **payment:** PAYPAL-972 added 3ds check for googlepaybraintree ([#1240](https://github.com/bigcommerce/checkout-sdk-js/issues/1240)) ([deaf0c5](https://github.com/bigcommerce/checkout-sdk-js/commit/deaf0c5749545e204fb8ca4e51e21df766defce4))


### Bug Fixes

* **payment:** INT-4698 doing post to checkout after completing visa checkout payment information ([#1232](https://github.com/bigcommerce/checkout-sdk-js/issues/1232)) ([9e524af](https://github.com/bigcommerce/checkout-sdk-js/commit/9e524af55a3b9511d688a3892dee409aef150baa))

## [1.184.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.183.2...v1.184.0) (2021-09-27)


### Features

* **payment:** INT-4170 Do not use as keyword ([c749820](https://github.com/bigcommerce/checkout-sdk-js/commit/c749820a905852130ff0e5e325201f0f7dfdcf73))
* **payment:** INT-4170 Mount hostedfields for TSV on StripeV3 ([fb635ea](https://github.com/bigcommerce/checkout-sdk-js/commit/fb635ea320a10f8979441cb93cdd87e15589e2a8))

### [1.183.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.183.1...v1.183.2) (2021-09-24)

### [1.183.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.183.0...v1.183.1) (2021-09-22)


### Bug Fixes

* **checkout:** ADYEN-260 fixed googlepay updates billing info, removed update of customer email ([efb29b4](https://github.com/bigcommerce/checkout-sdk-js/commit/efb29b449a308a3224ab252f38ed43c3b070fa3f))

## [1.183.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.182.1...v1.183.0) (2021-09-21)


### Features

* **checkout:** CHECKOUT-5777 Send SDK version as a header for all SDK API requests ([#1242](https://github.com/bigcommerce/checkout-sdk-js/issues/1242)) ([1372f33](https://github.com/bigcommerce/checkout-sdk-js/commit/1372f3392cc2789221db6688c8aa866cc6771f80))


### Bug Fixes

* **payment:** INT-4674 forgetting checkout instead of signing out when using google pay ([#1215](https://github.com/bigcommerce/checkout-sdk-js/issues/1215)) ([c74b4ba](https://github.com/bigcommerce/checkout-sdk-js/commit/c74b4ba874b6965afda3341c3a9f7683b36d1562))

### [1.182.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.182.0...v1.182.1) (2021-09-15)


### Bug Fixes

* **checkout:** INT-4798 Fix Moneris Hosted Field Validation ([8f81ff5](https://github.com/bigcommerce/checkout-sdk-js/commit/8f81ff5844a451f6feae08f9896c3ea98b24ccdf))
* **checkout:** INT-4798 Use Lodash utils to validate fields ([be50ef2](https://github.com/bigcommerce/checkout-sdk-js/commit/be50ef25f9a74df18a9f73f05846c50f57878fdd))
* **payment:** INT-4802 Moneris validate response before resolve ([#1228](https://github.com/bigcommerce/checkout-sdk-js/issues/1228)) ([f643b4a](https://github.com/bigcommerce/checkout-sdk-js/commit/f643b4a3abe46b60c8732ad9b7968f213cc9e9c3))

## [1.182.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.181.1...v1.182.0) (2021-09-14)


### Features

* **payment:** BOLT-24 added account creation flag for Bolt Embedded One Click execution ([b23ae4a](https://github.com/bigcommerce/checkout-sdk-js/commit/b23ae4a4e126be2058a70317e5dc40600a7725ce))


### Bug Fixes

* **payment:** INT-4810 Forget checkout provider and reload payment methods - Clearpay ([#1234](https://github.com/bigcommerce/checkout-sdk-js/issues/1234)) ([d8e982e](https://github.com/bigcommerce/checkout-sdk-js/commit/d8e982e005183822b0e11148f0393f7a9d3eb144))

### [1.181.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.181.0...v1.181.1) (2021-09-13)

## [1.181.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.180.1...v1.181.0) (2021-09-08)


### Features

* **payment:** PAYPAL-954 Update Braintree web SDK version ([#1231](https://github.com/bigcommerce/checkout-sdk-js/issues/1231)) ([041828d](https://github.com/bigcommerce/checkout-sdk-js/commit/041828dd147023ea7665bc4e843c4fb9ff55e30e))

### [1.180.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.180.0...v1.180.1) (2021-09-08)


### Bug Fixes

* **payment:** INT-4705 [Clearpay] display correct error message when amount is out of limits ([3b5ba0b](https://github.com/bigcommerce/checkout-sdk-js/commit/3b5ba0bcd17cbf9f28f148e414a49b5a0e086c68))
* **payment:** PAYMENTS-7252 pass methodIds on to PPSDK endpoint without transformation ([#1233](https://github.com/bigcommerce/checkout-sdk-js/issues/1233)) ([c0b0d3a](https://github.com/bigcommerce/checkout-sdk-js/commit/c0b0d3ac877264e4d2a98890a849b3026b21e877))

## [1.180.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.179.1...v1.180.0) (2021-09-02)


### Features

* **payment:** BOLT-23 embedded Bolt payment method ([8632cce](https://github.com/bigcommerce/checkout-sdk-js/commit/8632ccea1833dca7e64518562433ac64d089c32a))

### [1.179.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.179.0...v1.179.1) (2021-09-01)


### Bug Fixes

* **checkout:** ADYEN-231 fixed adyen checkout form localization ([9f03081](https://github.com/bigcommerce/checkout-sdk-js/commit/9f03081580907046dd204c19f39c041905d2b54a))

## [1.179.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.178.0...v1.179.0) (2021-08-31)


### Features

* **payment:** BOLT-49 removed unnecessary payment data nonce check for Bolt Full Checkout ([d825f8b](https://github.com/bigcommerce/checkout-sdk-js/commit/d825f8b61d8376bbb97337b8799e40ac9061af16))

## [1.178.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.177.1...v1.178.0) (2021-08-30)


### Features

* **checkout:** PAYPAL-1111 Added APM check to paypalcommerce button integration ([204e6a3](https://github.com/bigcommerce/checkout-sdk-js/commit/204e6a318c381ef4e6936f1f73ef56f956c02296))
* **checkout:** PAYPAL-1111 added SEPA APM integration to paypal commerce ([630d6ed](https://github.com/bigcommerce/checkout-sdk-js/commit/630d6ed84f4c542192f580836dbfd3ae43eb7815))

### [1.177.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.177.0...v1.177.1) (2021-08-30)


### Bug Fixes

* **payment:** PAYMENTS-7221 add AUTHORIZATION and remove X-XSRF-TOKEN headers for PPSDK requests ([#1221](https://github.com/bigcommerce/checkout-sdk-js/issues/1221)) ([491150a](https://github.com/bigcommerce/checkout-sdk-js/commit/491150ae4800647292c0b093f202dbda07ebd69d))

## [1.177.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.176.0...v1.177.0) (2021-08-30)


### Features

* **payment:** INT-4141 Improve css look and feel ([52c546f](https://github.com/bigcommerce/checkout-sdk-js/commit/52c546f9a215d3c501c152acdd8ef134b9317157))

## [1.176.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.175.6...v1.176.0) (2021-08-27)


### Features

* **payment:** BOLT-19 added Bolt Embedded One Click Checkout implementation and add generic executePaymentProviderCheckout to customer strategy ([b43e620](https://github.com/bigcommerce/checkout-sdk-js/commit/b43e620af00563ff5bbdc03d8f051f38e9bb42a7))

### [1.175.6](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.175.5...v1.175.6) (2021-08-26)


### Bug Fixes

* **checkout:** JIRA-5757 Fix Sign Out Button Not Working on Checkout … ([b6aaaf3](https://github.com/bigcommerce/checkout-sdk-js/commit/b6aaaf3058d8778d627f071fdb873f476160c1dc))
* **checkout:** JIRA-5757 Fix Sign Out Button Not Working on Checkout … ([aa44412](https://github.com/bigcommerce/checkout-sdk-js/commit/aa444126b284661a85d940aa1d858ceed3063586))
* **checkout:** JIRA-5757 Fix Sign Out Button Not Working on Checkout … ([6e4c14a](https://github.com/bigcommerce/checkout-sdk-js/commit/6e4c14a504b4c520fc24773f4f4d322f26129ebe))

### [1.175.5](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.175.4...v1.175.5) (2021-08-25)


### Bug Fixes

* **payment:** INT-4594 [Afterpay] display correct error message when amount is out of limit ([434985c](https://github.com/bigcommerce/checkout-sdk-js/commit/434985c0e65a1eb6847a7d5d2179b4c88097f355))

### [1.175.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.175.3...v1.175.4) (2021-08-23)


### Bug Fixes

* **payment:** BOLT-47 fixed an issue of throwing payment method error on initialization for Bolt Full Checkout flow ([32ae1e1](https://github.com/bigcommerce/checkout-sdk-js/commit/32ae1e1e1a014ef8da5fe6e3cc7db70200181f3f))

### [1.175.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.175.2...v1.175.3) (2021-08-23)


### Bug Fixes

* **payment:** PAYMENTS-7214 fix PPSDK initialisation strategy casing ([#1211](https://github.com/bigcommerce/checkout-sdk-js/issues/1211)) ([c9944ff](https://github.com/bigcommerce/checkout-sdk-js/commit/c9944ff2e1e68aadb33079938236e270e58ba1f8))

### [1.175.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.175.1...v1.175.2) (2021-08-19)


### Bug Fixes

* **payment:** INT-4672 Forget checkout provider and reload payment methods - Afterpay ([de40a43](https://github.com/bigcommerce/checkout-sdk-js/commit/de40a43c3eb8f22bbcad27781da879c219aa7eab))

### [1.175.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.175.0...v1.175.1) (2021-08-17)


### Bug Fixes

* **payment:** PAYMENTS-7215 disable withCredentials on PPSDK xhr requests to BigPay ([#1212](https://github.com/bigcommerce/checkout-sdk-js/issues/1212)) ([e7ab9fd](https://github.com/bigcommerce/checkout-sdk-js/commit/e7ab9fd117f740f5800cbea51723f953515f8b81))

## [1.175.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.174.0...v1.175.0) (2021-08-17)


### Features

* **payment:** CHECKOUT-5906 Payment step "Name on Card" of checkout requires label for screen readers ([72b98d0](https://github.com/bigcommerce/checkout-sdk-js/commit/72b98d05dc165911f593e11e51ecf47688e38406))
* **payment:** INT-4456 Add CA/FR to klarna countries list ([e3e66a5](https://github.com/bigcommerce/checkout-sdk-js/commit/e3e66a5bd68f6ccaeb089242812b010810f7683a))

## [1.174.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.173.0...v1.174.0) (2021-08-16)


### Features

* **checkout:** PAYPAL-1100 added paylater to enable-funding field on paypalcommerce checkout and buttons ([f021b81](https://github.com/bigcommerce/checkout-sdk-js/commit/f021b81befdc459db5963b3b1689e6bf4da86dfd))


### Bug Fixes

* **checkout:** DATA-7883 Fix Segment + GAEE issue ([0e490ef](https://github.com/bigcommerce/checkout-sdk-js/commit/0e490efe6326785bde5261772063510201b63e90))

## [1.173.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.172.0...v1.173.0) (2021-08-12)


### Features

* **payment:** INT-4592 Added 3DS handler to SquareV2 ([a47016a](https://github.com/bigcommerce/checkout-sdk-js/commit/a47016a9dacba4eb93699d5c2e2e223160db265a))
* **payment:** INT-4686 remove disabledPaymentMethod interface for DR ([2738bb9](https://github.com/bigcommerce/checkout-sdk-js/commit/2738bb9bef86e8ba5d1218f9232b70d2099e26f9))


### Bug Fixes

* **payment:** INT-4222 Add tests for type guard ([7a3a8e2](https://github.com/bigcommerce/checkout-sdk-js/commit/7a3a8e274a942ffa53fbde6beb9ae73be5ec8ffd))
* **payment:** INT-4222 Code and test cleanup ([39452e9](https://github.com/bigcommerce/checkout-sdk-js/commit/39452e916844d276bea4a7f5677806449c688c2b))
* **payment:** INT-4222 Test Cleanup ([1c29d3d](https://github.com/bigcommerce/checkout-sdk-js/commit/1c29d3ddc406d65c0a5e5553366207a72aeba580))
* **payment:** INT-4222 Use default interface to avoid build errors ([5b73379](https://github.com/bigcommerce/checkout-sdk-js/commit/5b733794a0c8738436839db704ab3c38b5d3e103))

## [1.172.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.171.0...v1.172.0) (2021-08-09)


### Features

* **payment:** BOLT-30 added some changes to bolt checkout execute method logic ([f08ecfa](https://github.com/bigcommerce/checkout-sdk-js/commit/f08ecfa8cef7127c2498363bce8a3048f69921de))

## [1.171.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.170.0...v1.171.0) (2021-08-05)


### Features

* **payment:** INT-3946 added locale from browser on masterpass SRC ([b9a335d](https://github.com/bigcommerce/checkout-sdk-js/commit/b9a335d582b72f268d2d9082c6a52ebf1bbabeb8))


### Bug Fixes

* **payment:** INT-3946 missing semicolon ([60afc6e](https://github.com/bigcommerce/checkout-sdk-js/commit/60afc6e401bc4129eab1fe764926485c1e9c7821))
* **payment:** INT-3946 PR requested changes ([c805d55](https://github.com/bigcommerce/checkout-sdk-js/commit/c805d55707df4df3cafcf65292b11e78b4476de4))
* **payment:** INT-3946 removed unused variables ([f8f5f68](https://github.com/bigcommerce/checkout-sdk-js/commit/f8f5f68c7e4f2c1ccd5de360bd1d84bd00a7bc67))
* **payment:** INT-3946 using supported locales on masterpass SRC ([b719bf8](https://github.com/bigcommerce/checkout-sdk-js/commit/b719bf8818f68e7cbdaaf085e4b3f7da063363b7))
* **payment:** INT-3946 using supported locales on masterpass SRC ([6eaf14f](https://github.com/bigcommerce/checkout-sdk-js/commit/6eaf14f0f5b888c2da4cf1b3b037f028878938b2))
* **payment:** INT-3946 using supported locales on masterpass SRC ([1b30227](https://github.com/bigcommerce/checkout-sdk-js/commit/1b302276571de56126de80a087c62edf890777af))

## [1.170.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.169.3...v1.170.0) (2021-08-04)


### Features

* **payment:** INT-4584 - Refactor Quadpay uri data for redirect ([ac11929](https://github.com/bigcommerce/checkout-sdk-js/commit/ac1192971fd468066b401719f447e31e879302a7))
* **payment:** INT-4585 - Refactor Zip uri data for redirect ([323372b](https://github.com/bigcommerce/checkout-sdk-js/commit/323372b8d712d80c9b6a649ac7add048ebdc4899))


### Bug Fixes

* **payment:** INT-4438 update SDK documentation for Digital River ([fa094fc](https://github.com/bigcommerce/checkout-sdk-js/commit/fa094fc3b4ab82d47f2ce901de337b05c472aa6d))
* **payment:** INT-4480 Throws stripe error when user closes the auth modal on Stripe V3 ([6577e8a](https://github.com/bigcommerce/checkout-sdk-js/commit/6577e8a769b7bec8f5bb82793ba35fabc8fe29ed))

### [1.169.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.169.2...v1.169.3) (2021-08-02)


### Bug Fixes

* **payment:** INT-4481 Success pay without the last name in the credit/debit card ([ab95b9e](https://github.com/bigcommerce/checkout-sdk-js/commit/ab95b9e693d57c3306bd8d5609f3037186a93490))

### [1.169.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.169.1...v1.169.2) (2021-07-30)


### Bug Fixes

* **payment:** INT-4685 Orbital initializer added properly ([4546591](https://github.com/bigcommerce/checkout-sdk-js/commit/4546591f010a6f7577b3f7e7b85fa06b4a90a78a))

### [1.169.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.169.0...v1.169.1) (2021-07-29)

## [1.169.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.168.1...v1.169.0) (2021-07-29)


### Features

* **payment:** INT-4222 Add vaulting compatibility to Moneris ([dc318d7](https://github.com/bigcommerce/checkout-sdk-js/commit/dc318d72a2faa708066c59f07f9c23c98b01b94c))

### [1.168.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.168.0...v1.168.1) (2021-07-27)


### Bug Fixes

* **payment:** INT-4598 handle vaulting Enable checkbox ([cee0198](https://github.com/bigcommerce/checkout-sdk-js/commit/cee01981b80a6d4ae1b84586b860d0168b83ace6))
* **payment:** INT-4661 [Afterpay] get countryCode by shopperCurrency ([ca41447](https://github.com/bigcommerce/checkout-sdk-js/commit/ca41447c42bd4d199b9ae8908e6ad9a2345cf8ac))

## [1.168.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.167.0...v1.168.0) (2021-07-23)


### Features

* **checkout:** PAYPAL-1057 added Venmo APM to paypal commerce ([e55f4d5](https://github.com/bigcommerce/checkout-sdk-js/commit/e55f4d5ee0511b4bde005aaa970498467d29beaa))

## [1.167.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.166.0...v1.167.0) (2021-07-22)


### Features

* **payment:** PAYPAL-1090 added size property for paypalexpress button ([#1191](https://github.com/bigcommerce/checkout-sdk-js/issues/1191)) ([99daccf](https://github.com/bigcommerce/checkout-sdk-js/commit/99daccf6468ef65a063d151b97b465f61d45158e))

## [1.166.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.165.0...v1.166.0) (2021-07-22)


### Features

* **payment:** PAYMENTS-7169 add resume payment ability to PPSDK strategy ([#1188](https://github.com/bigcommerce/checkout-sdk-js/issues/1188)) ([c874e0f](https://github.com/bigcommerce/checkout-sdk-js/commit/c874e0fbbd09503629c3c555c232cd3da08e6141))

## [1.165.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.164.1...v1.165.0) (2021-07-18)


### Features

* **payment:** INT-4141 Make iframe border and background transparent ([4600855](https://github.com/bigcommerce/checkout-sdk-js/commit/46008559fef1bf6b3e9e88b9e71711102fa50bac))
* **payment:** INT-4141 Update test ([c26f39a](https://github.com/bigcommerce/checkout-sdk-js/commit/c26f39a6a42ad2770c373075b8b7e57b35fa9e59))
* **payment:** INT-4141 Use border: none instead border: transparent ([7a65022](https://github.com/bigcommerce/checkout-sdk-js/commit/7a650228cfcf5d7ca22230674c84b4b937af78fc))

### [1.164.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.164.0...v1.164.1) (2021-07-13)


### Bug Fixes

* **payment:** INT-4087 Send the client token back to update the payment intent related for StripeV3 ([#1164](https://github.com/bigcommerce/checkout-sdk-js/issues/1164)) ([97417ab](https://github.com/bigcommerce/checkout-sdk-js/commit/97417ab13d00930158351e9480e404c9e187e623))

## [1.164.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.163.0...v1.164.0) (2021-07-12)


### Features

* **payment:** PAYPAL-1026 fixed braintree button height ([#1169](https://github.com/bigcommerce/checkout-sdk-js/issues/1169)) ([67aa575](https://github.com/bigcommerce/checkout-sdk-js/commit/67aa575b20d0e17d0305fa41ca4d51cccd2e67e0))

## [1.163.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.162.1...v1.163.0) (2021-07-12)


### Features

* **payment:** PAYMENTS-6811 map failure codes to RequestError error codes ([#1173](https://github.com/bigcommerce/checkout-sdk-js/issues/1173)) ([597ba5d](https://github.com/bigcommerce/checkout-sdk-js/commit/597ba5deebc0528586d591c2c2741d9534d98348))
* **payment:** PAYMENTS-6814 add NonePaymentProcessor test ([#1176](https://github.com/bigcommerce/checkout-sdk-js/issues/1176)) ([8dc9e6f](https://github.com/bigcommerce/checkout-sdk-js/commit/8dc9e6f00a3b45fab2ef28cddff4d0bf89474c6e))

### [1.162.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.162.0...v1.162.1) (2021-07-08)


### Bug Fixes

* **payment:** INT-4448 Braintree cardTypeChange event ([0ca0018](https://github.com/bigcommerce/checkout-sdk-js/commit/0ca0018f3e6125539c7397c7ccc742d3ab034285))

## [1.162.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.161.0...v1.162.0) (2021-07-06)


### Features

* **payment:** PAYMENTS-6805 add core stepHandler to PPSDK strategy ([#1162](https://github.com/bigcommerce/checkout-sdk-js/issues/1162)) ([4ffed6f](https://github.com/bigcommerce/checkout-sdk-js/commit/4ffed6f2a468e255de2ac363176d6dc24d729d13))

## [1.161.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.160.0...v1.161.0) (2021-07-05)


### Features

* **payment:** INT-4309 Adding additional action to Digital River ([b046460](https://github.com/bigcommerce/checkout-sdk-js/commit/b046460e16d851612a00c7c6f471cad492d2ea13))
* **payment:** INT-4423 Set labels to Moneris iframe creation process ([208500c](https://github.com/bigcommerce/checkout-sdk-js/commit/208500c181a930f120073e13ae762c7ea0fca912))


### Bug Fixes

* **payment:** INT-4309 Addresing Ignacio feedback ([93197d6](https://github.com/bigcommerce/checkout-sdk-js/commit/93197d63cf7d4a4a03dfc62ba3b8e3aeb74fa772))
* **payment:** INT-4309 Addresing Ignacio feedback ([e9e5adb](https://github.com/bigcommerce/checkout-sdk-js/commit/e9e5adb975ee9a5906e60ecd3db08818ff14c4ad))
* **payment:** INT-4309 Addresing Ignacio feedback 2 ([4fff2a2](https://github.com/bigcommerce/checkout-sdk-js/commit/4fff2a210877765dfd3d427ef0314169b5c3657c))
* **payment:** INT-4309 Updating Digital River unit tests ([72ad20a](https://github.com/bigcommerce/checkout-sdk-js/commit/72ad20a0900883a8f8d733ea33d9a1cf1d844287))

## [1.160.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.159.0...v1.160.0) (2021-06-30)


### Features

* **payment:** INT-4342 added google pay on orbital ([6ef0eaa](https://github.com/bigcommerce/checkout-sdk-js/commit/6ef0eaac0e400fb42009ef6bebaa53b7d6dcdf84))

## [1.159.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.158.1...v1.159.0) (2021-06-30)


### Features

* **common:** CHECKOUT-5892 Specify locale for default and fallback translations ([306bcb7](https://github.com/bigcommerce/checkout-sdk-js/commit/306bcb70ae4c24f17887c065d6d18bf700d00c2a))

### [1.158.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.158.0...v1.158.1) (2021-06-23)


### Bug Fixes

* **common:** CHECKOUT-5873 Fix path to copy previous releases from ([d5a16ed](https://github.com/bigcommerce/checkout-sdk-js/commit/d5a16ed422aa2f6a266075fd1bf5cfee2e0ea43a))

## [1.158.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.157.1...v1.158.0) (2021-06-23)


### Features

* **common:** CHECKOUT-5873 Deploy compiled assets to GCS ([f87db6b](https://github.com/bigcommerce/checkout-sdk-js/commit/f87db6bb8e7549bf12a49fde3ac18e05093921b9))

### [1.157.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.157.0...v1.157.1) (2021-06-22)


### Bug Fixes

* **payment:** INT-4266 Renew the nonce for Google Payment when the payment fails. ([c7b54bf](https://github.com/bigcommerce/checkout-sdk-js/commit/c7b54bfa74809f734d6b8a4513e0b74bfe2d819a))

## [1.157.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.156.0...v1.157.0) (2021-06-22)


### Features

* **payment:** PAYMENTS-6807 extend PPSDK payment strategy ([#1150](https://github.com/bigcommerce/checkout-sdk-js/issues/1150)) ([5d3298a](https://github.com/bigcommerce/checkout-sdk-js/commit/5d3298aaccb0883d2f896b15570b985176c78b46))

## [1.156.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.155.1...v1.156.0) (2021-06-08)


### Features

* **payment:** INT-4170 added hosted fields on Mollie verification field ([b487651](https://github.com/bigcommerce/checkout-sdk-js/commit/b487651d29984dbfcf022525d438a72191a8641c))

### [1.155.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.155.0...v1.155.1) (2021-06-02)


### Bug Fixes

* **checkout:** PAYPAL-1055 change expected methodId from przelewy24 to p24 ([7405a6e](https://github.com/bigcommerce/checkout-sdk-js/commit/7405a6eea40b90780cb50c27c20227ea51692269))
* **checkout:** PAYPAL-1055 removed buyer-country property from paypal commerce initialization ([bf2ff1a](https://github.com/bigcommerce/checkout-sdk-js/commit/bf2ff1ad874e7e79bb84ac1fbe395db045354f42))

## [1.155.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.154.0...v1.155.0) (2021-06-01)


### Features

* **payment:** PAYPAL-863 Braintree: PayPal JS SDK Smart Buttons ([#1074](https://github.com/bigcommerce/checkout-sdk-js/issues/1074)) ([e32555a](https://github.com/bigcommerce/checkout-sdk-js/commit/e32555a902679f45b11332f7df8a62efec550d61))

## [1.154.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.153.0...v1.154.0) (2021-06-01)


### Features

* **payment:** INT-4205 Add Moneris strategy ([fff5070](https://github.com/bigcommerce/checkout-sdk-js/commit/fff5070ed3062b1a1d1a4f8c6f25b786ad76d987))
* **payment:** INT-4205 Cleanup Strategy and add additional tests ([73e7357](https://github.com/bigcommerce/checkout-sdk-js/commit/73e7357fd1fcf8790e7b2edeb6317d6ee631475f))

## [1.153.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.152.0...v1.153.0) (2021-05-31)


### Features

* **payment:** INT-4242 Add Quadpay payment strategy ([95fc8c1](https://github.com/bigcommerce/checkout-sdk-js/commit/95fc8c105be374c8f97e30d343e9e7fe552e82a1))
* **payment:** INT-4242 Create StorefrontPaymentRequestSender ([626e618](https://github.com/bigcommerce/checkout-sdk-js/commit/626e618a614ee9503188b42c21d77b45c7eabcaf))


### Code Refactoring

* **payment:** INT-4242 Quadpay code cleanup ([19d9480](https://github.com/bigcommerce/checkout-sdk-js/commit/19d9480dd105f9203206251ce3ef5ada65a7877e))

## [1.152.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.151.0...v1.152.0) (2021-05-27)


### Features

* **payment:** INT-4310 resolving mexico review ([f4ce08b](https://github.com/bigcommerce/checkout-sdk-js/commit/f4ce08b5ffe9033d31d85f0d903878f971a192da))
* **payment:** INT-4310 Update DR strategy to support vaulted instruments ([964130d](https://github.com/bigcommerce/checkout-sdk-js/commit/964130d945ac2c3ef411c8ab4951e52b8fef40f7))

## [1.151.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.150.0...v1.151.0) (2021-05-24)


### Features

* **payment:** INT-4197 added test ([453974f](https://github.com/bigcommerce/checkout-sdk-js/commit/453974f555a90e21d7ab67dd5f021386a2e12821))
* **payment:** INT-4197 added type and color parameters on googlepay checkout button ([34a5cec](https://github.com/bigcommerce/checkout-sdk-js/commit/34a5cec2bf4a90940a3bc5d31b29f9657e126e4c))

## [1.150.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.149.0...v1.150.0) (2021-05-20)


### Features

* **checkout:** PAYPAL-1024 make APM work regardless of shopper geolocation ([73cad65](https://github.com/bigcommerce/checkout-sdk-js/commit/73cad654ec91e93a7eb48720e6c329330a1d6e10))

## [1.149.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.148.0...v1.149.0) (2021-05-18)


### Features

* **payment:** PAYMENTS-6813 extend Payment Method type to cover PPSDK variants ([#1139](https://github.com/bigcommerce/checkout-sdk-js/issues/1139)) ([0be6fcf](https://github.com/bigcommerce/checkout-sdk-js/commit/0be6fcf897f0190baa4373366d906135e81088d0))

## [1.148.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.147.1...v1.148.0) (2021-05-17)


### Features

* **payment:** PAYPAL-976 Paypal APM fields intagration was added ([b5266cf](https://github.com/bigcommerce/checkout-sdk-js/commit/b5266cf073a1f896d8a4844ad5607eb1799d2579))

### [1.147.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.147.0...v1.147.1) (2021-05-17)


### Bug Fixes

* **checkout:** INT-3941 Updated remote-checkout path on button initialization ([226232f](https://github.com/bigcommerce/checkout-sdk-js/commit/226232f9f0f3c5e47da31c4da17419d434eb74da))

## [1.147.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.146.0...v1.147.0) (2021-05-13)


### Features

* **payment:** INT-4071 Clearpay - Create custom strategy ([ff7ea13](https://github.com/bigcommerce/checkout-sdk-js/commit/ff7ea134df8703a5e8fc011554902314a5fcb8a8))
* **payment:** INT-4071 Clearpay - rename function that validate the countrycode ([e44941f](https://github.com/bigcommerce/checkout-sdk-js/commit/e44941f60a471bb7cdd49407aee761354b4feafb))
* **payment:** INT-4071 validate countryCode in billingAddress ([3f7993d](https://github.com/bigcommerce/checkout-sdk-js/commit/3f7993d0efe33e2b31e28a67d810c45646d7b8dc))
* **payment:** INT-4071 wip ([4520461](https://github.com/bigcommerce/checkout-sdk-js/commit/4520461aecf269ba6cf497f2423dd3ba48eedb9a))
* **payment:** INT-4237 Add issuer for Mollie APMs ([21bfded](https://github.com/bigcommerce/checkout-sdk-js/commit/21bfded889dba0afb22396d439910116934cebe4))

## [1.146.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.145.0...v1.146.0) (2021-05-10)


### Features

* **payment:** PAYMENTS-6806 add dummy PPSDK strategy ([#1128](https://github.com/bigcommerce/checkout-sdk-js/issues/1128)) ([547a1c3](https://github.com/bigcommerce/checkout-sdk-js/commit/547a1c3d263479499b8b42b9a8858dd28903c3a3))

## [1.145.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.144.1...v1.145.0) (2021-05-05)


### Features

* **payment:** INT-4258 StripeV3: Improve error handling ([48da4f4](https://github.com/bigcommerce/checkout-sdk-js/commit/48da4f4b51cd9d34c9f7cefa04de2ddde02bf714))

### [1.144.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.144.0...v1.144.1) (2021-04-29)


### Bug Fixes

* **payment:** INT-4266 Googlepay - fixing where nonce value is going to be reloaded ([399b670](https://github.com/bigcommerce/checkout-sdk-js/commit/399b670709893f69ae2d3f10e57b3aee6346feab))

## [1.144.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.143.0...v1.144.0) (2021-04-29)


### Features

* **payment:** INT-4150 changing zip strategy flow ([fd2354a](https://github.com/bigcommerce/checkout-sdk-js/commit/fd2354ad5d9c2a8ebe3a7a87bf12723644bec248))


### Bug Fixes

* **payment:** PAYPAL-983 Improve the Checkout SDK documentation around PayPal Commerce ([613c456](https://github.com/bigcommerce/checkout-sdk-js/commit/613c4566dd787c58d4b4f649027f5b6cddf03a91))

## [1.143.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.142.0...v1.143.0) (2021-04-22)


### Features

* **payment:** PAYPAL-982 Pass BN code into the banners script ([8a71bfb](https://github.com/bigcommerce/checkout-sdk-js/commit/8a71bfba5a54bc91ed3501a34705fc1778ca4e91))

## [1.142.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.141.0...v1.142.0) (2021-04-22)


### Features

* **payment:** INT-3702 added vaulted cc ([cdf639c](https://github.com/bigcommerce/checkout-sdk-js/commit/cdf639c658ff489b03eef03d137266486e0cc50d))
* **payment:** INT-3702 fix containerId ([7d6bc75](https://github.com/bigcommerce/checkout-sdk-js/commit/7d6bc754f93516357a5f3a6d03051f1a28638033))


### Bug Fixes

* **payment:** INT-4063 Avoid holding inventory if a payment intent confirmation fails for StripeV3 ([e291784](https://github.com/bigcommerce/checkout-sdk-js/commit/e291784ab81c98001e865e1e07836bf927ff6a45))

## [1.141.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.140.0...v1.141.0) (2021-04-15)


### Features

* **cart:** CHECKOUT-5747 Add cart changed error meta ([7addf66](https://github.com/bigcommerce/checkout-sdk-js/commit/7addf660dd7e82046a60b121c7a7a8e10b1d7a17))

## [1.140.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.139.1...v1.140.0) (2021-04-14)


### Features

* **payment:** INT-2503 Add strategy for checkout.com with Fawry ([878ebd7](https://github.com/bigcommerce/checkout-sdk-js/commit/878ebd70c588e5920414d2637c1db09f202d7146))


### Bug Fixes

* **payment:** INT-3611 Refresh the state in Googlepay and Braintree refactor ([a33dc55](https://github.com/bigcommerce/checkout-sdk-js/commit/a33dc5539861f809eff2763a2d89cbb5d56192e9))

### [1.139.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.139.0...v1.139.1) (2021-04-14)

## [1.139.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.138.0...v1.139.0) (2021-04-13)


### Features

* **payment:** INT-3702 added vaulted cc ([8f6f2a1](https://github.com/bigcommerce/checkout-sdk-js/commit/8f6f2a1cef716386de329c5d052d570b43019ff6))

## [1.138.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.137.3...v1.138.0) (2021-04-13)


### Features

* **payment:** INT-4021 Add strategy for iDeal APM ([752796b](https://github.com/bigcommerce/checkout-sdk-js/commit/752796bb109acadd118d94f51d04a3cc8cd1deb5))
* **payment:** INT-4021 Test Cleanup ([61dfc25](https://github.com/bigcommerce/checkout-sdk-js/commit/61dfc257e6dbfb4b66661890403a96097a5f0f30))
* **payment:** INT-4117 Support reload DR widget ([beb388a](https://github.com/bigcommerce/checkout-sdk-js/commit/beb388a233d64ee3532cf28ec4e33bd44095837f))
* **payment:** INT-4117 Support reload DR widget + capsula changes ([bcfd2eb](https://github.com/bigcommerce/checkout-sdk-js/commit/bcfd2eb2b4a48220aafa1ffb3e1ef55f5b3e32d8))

### [1.137.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.137.2...v1.137.3) (2021-04-12)


### Bug Fixes

* **payment:** PAYPAL-970 add unit test for click handler on paypal checkout ([503e60b](https://github.com/bigcommerce/checkout-sdk-js/commit/503e60be649fd0757f729477c2e07fa2c831db44))
* **payment:** PAYPAL-970 added loader test ([113d2f2](https://github.com/bigcommerce/checkout-sdk-js/commit/113d2f2821c94e27914ea4af4be64c7cd11e7a7b))
* **payment:** PAYPAL-970 don't show loading indicator if checkout form hasn't passed validation ([c571f90](https://github.com/bigcommerce/checkout-sdk-js/commit/c571f9009e2e9804da6d3f67ef11040e35938caf))
* **payment:** PAYPAL-970 fix linter error ([75b914f](https://github.com/bigcommerce/checkout-sdk-js/commit/75b914fb7eebaabd36fb33ff7f3f04a9d9ba6e4b))
* **payment:** PAYPAL-970 small fixes after code review ([083e2c5](https://github.com/bigcommerce/checkout-sdk-js/commit/083e2c5419c5d2ec13e5e85aa6329e71720c01f2))

### [1.137.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.137.1...v1.137.2) (2021-04-08)


### Bug Fixes

* **payment:** INT-3408 added masterpass SRC experiment ([933609a](https://github.com/bigcommerce/checkout-sdk-js/commit/933609ae27a938bfb3b9e3e976f5f9014d650731))
* **payment:** INT-3408 refactor script loader ([f064474](https://github.com/bigcommerce/checkout-sdk-js/commit/f064474710c2dfc09f4a075a5f060874f31e843b))

### [1.137.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.137.0...v1.137.1) (2021-04-08)


### Bug Fixes

* **payment:** CHECKOUT-5740 Post to and receive messages from www subdomain ([2e80137](https://github.com/bigcommerce/checkout-sdk-js/commit/2e801378f0c1b845e1b77f3394ec0d0f72a475d8))

## [1.137.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.136.2...v1.137.0) (2021-04-05)


### Features

* **payment:** INT-3931 Add strategy for checkout.com with SEPA ([5538a3b](https://github.com/bigcommerce/checkout-sdk-js/commit/5538a3b80f13ff653142bcd598553195168834b1))

### [1.136.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.136.1...v1.136.2) (2021-04-05)


### Bug Fixes

* **payment:** PAYPAL-965 Check that there are no inventory underselling or overselling issues in PayPal Commerce ([a0f4952](https://github.com/bigcommerce/checkout-sdk-js/commit/a0f49522c39d9d615904eac3a65174b3a64f9dc6))

### [1.136.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.136.0...v1.136.1) (2021-03-31)


### Bug Fixes

* **checkout:** INT-3571 Google Pay [StripeV3] - Billing address is missing ([df60da3](https://github.com/bigcommerce/checkout-sdk-js/commit/df60da31414942acb3d8f81941d7327898c4d442))

## [1.136.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.135.0...v1.136.0) (2021-03-28)


### Features

* **payment:** INT-3905 creating execute for digital river and credit card ([2937cdd](https://github.com/bigcommerce/checkout-sdk-js/commit/2937cddde9a12ca4f6c1daecd6ade5047680ee6b))

## [1.135.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.134.2...v1.135.0) (2021-03-22)


### Features

* **payment:** INT-3947 Suppress PayPal and Klarna ([5fd75a0](https://github.com/bigcommerce/checkout-sdk-js/commit/5fd75a054169b12f677831b98a444a7fa8cb5165))

### [1.134.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.134.1...v1.134.2) (2021-03-21)


### Bug Fixes

* **payment:** PAYMENTS-6642 Make Paypal overlay modal/new window aware ([#1088](https://github.com/bigcommerce/checkout-sdk-js/issues/1088)) ([326c961](https://github.com/bigcommerce/checkout-sdk-js/commit/326c9611b0a80c9c49d4278f4a240e23f7c18bdb))

### [1.134.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.134.0...v1.134.1) (2021-03-16)


### Bug Fixes

* **checkout:** INT-2546 Add ideal to document supported apms ([9c69506](https://github.com/bigcommerce/checkout-sdk-js/commit/9c695064612a01a7ce66d1a47a09c6b0e884715e))

## [1.134.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.133.0...v1.134.0) (2021-03-14)


### Features

* **payment:** INT-3840 creating digital river strategy ([6062bbf](https://github.com/bigcommerce/checkout-sdk-js/commit/6062bbf9d78c6c9c9f5cadb8f0c6a619c8af6827))
* **payment:** INT-3896 [Zip] it returns the nonce value when it's a referred payment ([d123551](https://github.com/bigcommerce/checkout-sdk-js/commit/d12355120b5ebef56de44dcb16c5c45f3a1dbcbc))

## [1.133.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.132.0...v1.133.0) (2021-03-10)


### Features

* **checkout:** INT-3700 Load Bolt Scripts from different environments ([980e9be](https://github.com/bigcommerce/checkout-sdk-js/commit/980e9be9bd9d983dbb8a77ede24b1e6e09d8f5c7))

## [1.132.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.131.0...v1.132.0) (2021-03-02)


### Features

* **checkout:** INT-3675 Add Bolt's tracking script to checkout ([f6faa1a](https://github.com/bigcommerce/checkout-sdk-js/commit/f6faa1a8c7914a751e01c0d3ab8a0c1987bb573a))
* **payment:** INT-3408 migrate masterpass to SRC ([7f30282](https://github.com/bigcommerce/checkout-sdk-js/commit/7f3028278516b5433767d0e89b8313f54c0053f8))
* **payment:** INT-3610 added Mollie Checkout ([d8f3df6](https://github.com/bigcommerce/checkout-sdk-js/commit/d8f3df6981770b2ae469d53d71005f86d58cc151))

## [1.131.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.130.1...v1.131.0) (2021-02-22)


### Features

* **payment:** PAYPAL-876 added preloader for APM when polling mechanism is running ([2d613b8](https://github.com/bigcommerce/checkout-sdk-js/commit/2d613b86e7b195c95ef7e1c0a607a58d11269eb9))

### [1.130.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.130.0...v1.130.1) (2021-02-18)


### Bug Fixes

* **checkout:** INT-3665 3D Secure is declining the transaction in Braintree without any reason in some stores ([4d5528e](https://github.com/bigcommerce/checkout-sdk-js/commit/4d5528e0b7fdd3a141898b02d2ae2345af3ac624))
* **common:** CHECKOUT-5612 Add isAccountCreationEnabled prop to StoreConfig ([74cc00e](https://github.com/bigcommerce/checkout-sdk-js/commit/74cc00e301185aed9acf7b0f42141f0dea035a20))

## [1.130.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.129.1...v1.130.0) (2021-02-15)


### Features

* **payment:** PAYPAL-876 stop polling mechanism when error occurs ([79119b2](https://github.com/bigcommerce/checkout-sdk-js/commit/79119b23c791d1f6dda5046691576f032148ea0a))


### Bug Fixes

* **payment:** INT-3611 Refresh the state in Braintree ([351bfe3](https://github.com/bigcommerce/checkout-sdk-js/commit/351bfe3fa11d7c945ab5593a27f4d33c0d2727d9))

### [1.129.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.129.0...v1.129.1) (2021-02-11)


### Bug Fixes

* **payment:** CHECKOUT-5324 Upgrade BigPay client version ([3aa965b](https://github.com/bigcommerce/checkout-sdk-js/commit/3aa965b4258be2a7995d6a2655939ce98d8549f7))

## [1.129.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.128.0...v1.129.0) (2021-02-10)


### Features

* **payment:** INT-3418 Added googlepay on cybersourcev2 ([8964140](https://github.com/bigcommerce/checkout-sdk-js/commit/8964140870d19babdd286870337995d356b14db0))

## [1.128.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.127.0...v1.128.0) (2021-02-09)


### Features

* **payment:** INT-3659 Add payment method flow to Stripe v3 ([7b4b388](https://github.com/bigcommerce/checkout-sdk-js/commit/7b4b38892bfccf59fb54a7151530c1a447fa532a))

## [1.127.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.126.0...v1.127.0) (2021-02-09)


### Features

* **payment:** PAYPAL-876 fixed paypalcommerce initialization endpoint ([b8fa0f2](https://github.com/bigcommerce/checkout-sdk-js/commit/b8fa0f202f68a75d78e6d24479f55a3b29fce59f))

## [1.126.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.125.0...v1.126.0) (2021-02-09)


### Features

* **checkout:** INT-2544 Create strategy For redirect flow on checkout.com apms ([31022c7](https://github.com/bigcommerce/checkout-sdk-js/commit/31022c7aca2f6b3ccff0b51695e1c03aac00d415))
* **payment:** INT-3831 enable vaulting on cybersource v2 ([7ba0849](https://github.com/bigcommerce/checkout-sdk-js/commit/7ba0849a186fdc9eb6cf029fa7594b37ac9544dd))
* **shopper:** CHECKOUT-4726 Allow creating customer address ([1546208](https://github.com/bigcommerce/checkout-sdk-js/commit/1546208336baa1b20f07417ab758e085299f452b))

## [1.125.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.124.1...v1.125.0) (2021-02-03)


### Features

* **payment:** PAYPAL-876 implemented polling mechanism ([29a08c4](https://github.com/bigcommerce/checkout-sdk-js/commit/29a08c4527d4e39332a58198feb54914886f3908))
* **payment:** PAYPAL-876 implemented polling mechanism on front end ([aca1d29](https://github.com/bigcommerce/checkout-sdk-js/commit/aca1d29a6eadd906c12d16038e66ce55931ff81e))
* **payment:** PAYPAL-876 implemented polling mechanism on front end ([30aca53](https://github.com/bigcommerce/checkout-sdk-js/commit/30aca53e184b5aeb0c8d94fdd15c6c7fbe9ccdb5))
* **payment:** PAYPAL-876 temp ([5bed143](https://github.com/bigcommerce/checkout-sdk-js/commit/5bed143c118e9ecd9a19b80fb40d53d7d2674801))
* **payment:** PAYPAL-883 fixed conflicts ([15fa4d5](https://github.com/bigcommerce/checkout-sdk-js/commit/15fa4d58d7c37d884526f987a69cbd7ebecc8a7b))

### [1.124.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.124.0...v1.124.1) (2021-02-01)


### Bug Fixes

* **payment:** CHECKOUT-5324 Set nonce in memory instead of local storage ([0515427](https://github.com/bigcommerce/checkout-sdk-js/commit/05154279c82293c04f246ffacdaf760ca6de449b))

## [1.124.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.123.0...v1.124.0) (2021-01-28)


### Features

* **payment:** INT-3537 Add CYBS One Platform Payment Strategy ([3bab19d](https://github.com/bigcommerce/checkout-sdk-js/commit/3bab19d478c66f114a5c02d8d499b1fabd7bed62))


### Bug Fixes

* **payment:** INT-3655 Avoid passing null nonce token to StripeV3 ([1ac7b18](https://github.com/bigcommerce/checkout-sdk-js/commit/1ac7b181b0e8bc4aed7e631b94838a86f1e15513))
* **payment:** INT-3743 Add Mada cards validation ([0e08640](https://github.com/bigcommerce/checkout-sdk-js/commit/0e08640c8af3dd5df8807e608939b6c2d5ce81c3))

## [1.123.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.122.0...v1.123.0) (2021-01-19)


### Features

* **payment:** ADYEN-8 add adyen methods to list of available methods ([b4bbeda](https://github.com/bigcommerce/checkout-sdk-js/commit/b4bbeda9c460a1c69db4e19a359227d7fb1c7576))

## [1.122.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.121.1...v1.122.0) (2021-01-18)


### Features

* **order:** CHECKOUT-2322 Add gift wrapping total ([6078f2d](https://github.com/bigcommerce/checkout-sdk-js/commit/6078f2d41a6db22d52a6b58ae0066ed9ef87efcf))

### [1.121.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.121.0...v1.121.1) (2021-01-13)


### Bug Fixes

* **payment:** INT-3717 Unformat cardNumber before notifying a bin number change ([c16324c](https://github.com/bigcommerce/checkout-sdk-js/commit/c16324cc9432cd0ec114c8778ebfc1fc5fdd6d1e))

## [1.121.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.120.0...v1.121.0) (2020-12-29)


### Features

* **payment:** PAYPAL-787 added condition ([af075d3](https://github.com/bigcommerce/checkout-sdk-js/commit/af075d3fe2576e5b604fcfb3446ba5baa2a54574))

## [1.120.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.119.0...v1.120.0) (2020-12-24)


### Features

* **payments:** PAYPAL-830 Add mechanism for testing of the APMs for different countries ([73d5f71](https://github.com/bigcommerce/checkout-sdk-js/commit/73d5f71f5748c487a28bc9035a0c119026489b7a))

## [1.119.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.118.2...v1.119.0) (2020-12-22)


### Features

* **shopper:** CHECKOUT-5418 Add support for recaptcha for customer account creation ([a92f310](https://github.com/bigcommerce/checkout-sdk-js/commit/a92f310b815fac76349cd9ba942544794482665a))

### [1.118.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.118.1...v1.118.2) (2020-12-18)


### Bug Fixes

* **checkout:** PAYPAL-767 Core review - remove excessive Promise.resolve ([f850faa](https://github.com/bigcommerce/checkout-sdk-js/commit/f850faa9f3b8a9fe72931ecad0291e004db4832a))
* **checkout:** PAYPAL-767 Fix device data collection for Braintree stored credit cards ([8aca92d](https://github.com/bigcommerce/checkout-sdk-js/commit/8aca92d045122f5605370f26207f80acfa50c0b6))
* **payment:** INT-2816 fix unit test for googlepay-adyenv2-payment ([2bc4ef7](https://github.com/bigcommerce/checkout-sdk-js/commit/2bc4ef707edc755b920273ec10891f2df15982d7))

### [1.118.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.118.0...v1.118.1) (2020-12-16)


### Bug Fixes

* **order:** CHECKOUT-4941 Load form fields when loading order ([6639da0](https://github.com/bigcommerce/checkout-sdk-js/commit/6639da0b8d38a2738597a2b20057ba81ed67367f))

## [1.118.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.117.0...v1.118.0) (2020-12-15)


### Features

* **payment:** PAYPAL-848 Add messages to script ([5c75f24](https://github.com/bigcommerce/checkout-sdk-js/commit/5c75f24d892c1234852780151cd8a7c492cab0c0))
* **shopper:** CHECKOUT-4941 Add Customer Creation functionality ([6a3c5e8](https://github.com/bigcommerce/checkout-sdk-js/commit/6a3c5e864a54b1e637826ad300af2a427ea4bab0))

## [1.117.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.116.0...v1.117.0) (2020-12-13)


### Features

* **forms:** CHECKOUT-4941 Expose customer account fields ([d9ce3db](https://github.com/bigcommerce/checkout-sdk-js/commit/d9ce3db953144b77afa5d0a59ecdc521d6b27f9f))
* **payment:** INT-2816 Added 3DS to googlepay adyenv2 ([519d036](https://github.com/bigcommerce/checkout-sdk-js/commit/519d036377435e7059be04166a4c4769bdbf86aa))
* **payment:** INT-3538 Replaced borwser language instead locale variable on Adyenv2 ([b11b877](https://github.com/bigcommerce/checkout-sdk-js/commit/b11b877c42ec4241d5024de543fb480415c519bd))
* **payment:** PAYPAL-868 fixed ([d83e9ff](https://github.com/bigcommerce/checkout-sdk-js/commit/d83e9ff891707ff340be9aa295f88577542bba0b))
* **payment:** PAYPAL-868 fixed ([28a8b53](https://github.com/bigcommerce/checkout-sdk-js/commit/28a8b53e1b9ae44b0983e098babdcc2b185e5ac6))
* **payment:** PAYPAL-868 fixed ([ccabf10](https://github.com/bigcommerce/checkout-sdk-js/commit/ccabf10d0a91da58699977bce509a9c28b5e7a13))
* **payment:** PAYPAL-868 fixed ([862cfc9](https://github.com/bigcommerce/checkout-sdk-js/commit/862cfc958dd8f59d48636a19d6932f70e5ed64c7))
* **payment:** PAYPAL-868 fixed ([0533c8c](https://github.com/bigcommerce/checkout-sdk-js/commit/0533c8ce8d651b6fbadf0cdb37fe10c0e4615c76))
* **payment:** PAYPAL-868 fixed ([0110b94](https://github.com/bigcommerce/checkout-sdk-js/commit/0110b94c95d792403d4c2423298b4e20ecf8083b))


### Bug Fixes

* **common:** CHECKOUT-4571 Remove alpha tags from stable functionality ([b8c1667](https://github.com/bigcommerce/checkout-sdk-js/commit/b8c16672075596af00519ca3901482a922cedbc3))
* **payment:** INT-2816 fix unit test for googlepay-adyenv2-payment-processor ([46da807](https://github.com/bigcommerce/checkout-sdk-js/commit/46da8074b29b295dcf9516b151e004e4b0579f9d))

## [1.116.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.115.0...v1.116.0) (2020-12-01)


### Features

* **payment:** INT-3237 Allows reinitialize the cardinal script ([38a2d23](https://github.com/bigcommerce/checkout-sdk-js/commit/38a2d2372aca4ff1cf3071a309af74c597390f55))

## [1.115.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.114.0...v1.115.0) (2020-11-13)


### Features

* **payment:** PAYPAL-839 Move method_id in execute ([9f8a35a](https://github.com/bigcommerce/checkout-sdk-js/commit/9f8a35a3d959bb4df2c4d12480b67edd035b79b3))

## [1.114.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.113.0...v1.114.0) (2020-11-13)


### Features

* **payment:** PAYPAL-837 Submit cardholder name to PayPal ([b0d0a61](https://github.com/bigcommerce/checkout-sdk-js/commit/b0d0a6133e1986fdcfca4d9cc5b77f3412d8360e))

## [1.113.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.112.0...v1.113.0) (2020-11-12)


### Features

* **payment:** INT-3438 Integrate Barclays strategy ([c53119d](https://github.com/bigcommerce/checkout-sdk-js/commit/c53119d6dc7501f25f601b0ab3ad8f1dcc9439a2))
* **payment:** PAYPAL-800 PPCP: Pay-in-3 ([a4003ae](https://github.com/bigcommerce/checkout-sdk-js/commit/a4003aee8b35723040562c31c3afd52989848937))
* **payment:** PAYPAL-800 PPCP: Pay-in-3 ([7b931d8](https://github.com/bigcommerce/checkout-sdk-js/commit/7b931d8d7621a749c722075541a275080279115b))

## [1.112.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.111.0...v1.112.0) (2020-11-09)


### Features

* **payment:** PAYPAL-702 Add alternative payment methods ([#1005](https://github.com/bigcommerce/checkout-sdk-js/issues/1005)) ([ea04c2d](https://github.com/bigcommerce/checkout-sdk-js/commit/ea04c2debc1a51f07242caa25b3af1ca72742dba))

## [1.111.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.110.1...v1.111.0) (2020-11-05)


### Features

* **payment:** PAYPAL-759 Add docs for initialize PPCP ([#1008](https://github.com/bigcommerce/checkout-sdk-js/issues/1008)) ([492858d](https://github.com/bigcommerce/checkout-sdk-js/commit/492858d7e7a9ea108860127834493bd742caa4f5))

### [1.110.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.110.0...v1.110.1) (2020-11-05)


### Bug Fixes

* **payment:** INT-3311 klarna can checkout with coupons ([375a2c3](https://github.com/bigcommerce/checkout-sdk-js/commit/375a2c3946aae0d415812913785eb663a75a256d))

## [1.110.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.109.0...v1.110.0) (2020-11-03)


### Features

* **checkout:** INT-3174 Added title as attribute of flashMessage ([73cbe48](https://github.com/bigcommerce/checkout-sdk-js/commit/73cbe487e86645348df49b265e4487c430d82053))

## [1.109.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.108.0...v1.109.0) (2020-10-22)


### Features

* **payment:** PAYPAL-746 Change style for sbp on checkout ([6b3c4a0](https://github.com/bigcommerce/checkout-sdk-js/commit/6b3c4a0edef7a5c057e78893362a4641ed4290e8))

## [1.108.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.107.1...v1.108.0) (2020-10-20)


### Features

* **payment:** PAYPAL-702 Bump bigpay client ([f812f43](https://github.com/bigcommerce/checkout-sdk-js/commit/f812f43fcc49a15617e10f55c7f76ad915f51516))

### [1.107.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.107.0...v1.107.1) (2020-10-19)


### Bug Fixes

* **payment:** PAYPAL-766 Validate cc before submit order ([#1003](https://github.com/bigcommerce/checkout-sdk-js/issues/1003)) ([0c3edb3](https://github.com/bigcommerce/checkout-sdk-js/commit/0c3edb36b370eaf16827d373583cea11f1af43ca))

## [1.107.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.106.1...v1.107.0) (2020-10-14)


### Features

* **payment:** INT-3061 renamed mandate field to mandateUrl on order interface ([1e4099c](https://github.com/bigcommerce/checkout-sdk-js/commit/1e4099c9df3751ee5009a7cd121bac4e17bc9401))

### [1.106.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.106.0...v1.106.1) (2020-10-12)


### Bug Fixes

* **order:** CHECKOUT-4639 Send discounted price when tracking analytics ([cea959f](https://github.com/bigcommerce/checkout-sdk-js/commit/cea959f8d15fa5afc2a327f0dee1441adff80234))

## [1.106.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.105.0...v1.106.0) (2020-10-09)


### Features

* **payment:** PAYPAL-706 Add validate before using spb ([3c02031](https://github.com/bigcommerce/checkout-sdk-js/commit/3c020315d5148b9048626d444fcbe9031fd4a42c))

## [1.105.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.104.2...v1.105.0) (2020-10-08)


### Features

* **payment:** PAYPAL-734 Change credit to paylater ([#994](https://github.com/bigcommerce/checkout-sdk-js/issues/994)) ([7a64bc1](https://github.com/bigcommerce/checkout-sdk-js/commit/7a64bc1733b7926535f72e2a6339da9ed5233e21))


### Bug Fixes

* **checkout:** DATA-6891 missing transactions ([51a0740](https://github.com/bigcommerce/checkout-sdk-js/commit/51a07403b403df05cc3b0b2fcc6dd56372146ef7))

### [1.104.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.104.1...v1.104.2) (2020-10-07)


### Bug Fixes

* **payment:** PAYPAL-202 fix validation ([a5aa5fb](https://github.com/bigcommerce/checkout-sdk-js/commit/a5aa5fb1e46b57fd9591f62506bd3ec876697cf0))

### [1.104.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.104.0...v1.104.1) (2020-10-02)


### Bug Fixes

* **payment:** PAYPAL-726 Switch payment methods ([4305cfd](https://github.com/bigcommerce/checkout-sdk-js/commit/4305cfd14a30abc381d2617a10fe47c78a89932e))

## [1.104.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.103.0...v1.104.0) (2020-09-30)


### Features

* **payment:** PAYPAL-675 Upgrade to 3DS v2 Braintree ([f1417cf](https://github.com/bigcommerce/checkout-sdk-js/commit/f1417cfaf0af27c7a32cac13bdfa725cbfa1fbf7))
* **payment:** PAYPAL-675 Upgrade to 3DS v2 Braintree ([58b187d](https://github.com/bigcommerce/checkout-sdk-js/commit/58b187d9ae393c63b9408986c850dbe12eabb9d5))

## [1.103.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.102.0...v1.103.0) (2020-09-30)


### Features

* **payment:** PAYPAL-553 3ds for PayPal ([#988](https://github.com/bigcommerce/checkout-sdk-js/issues/988)) ([a9d9fa8](https://github.com/bigcommerce/checkout-sdk-js/commit/a9d9fa86820c2df6ffb5192b9c4ac4f0a34588ca))

## [1.102.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.101.0...v1.102.0) (2020-09-28)


### Features

* **payment:** INT-3086 Support mounting individual card fields on StripeV3 ([2fc46a8](https://github.com/bigcommerce/checkout-sdk-js/commit/2fc46a8e9196b4f1f096f5b35672454662b05a97))

## [1.101.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.100.0...v1.101.0) (2020-09-22)


### Features

* **payment:** PAYPAL-705 add messaging for PayPal banners ([d35ea9b](https://github.com/bigcommerce/checkout-sdk-js/commit/d35ea9be7a8eb7517811f266ae57825e84c81310))
* **payment:** PAYPAL-705 enable banners along with credit + tests ([8f110af](https://github.com/bigcommerce/checkout-sdk-js/commit/8f110af6a1624778741bdf4e317be7d20c6a5376))

## [1.100.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.99.3...v1.100.0) (2020-09-18)


### Features

* **checkout:** INT-2779 Add vaulting support for Orbital ([a58c700](https://github.com/bigcommerce/checkout-sdk-js/commit/a58c700fc79abaf1da821e0cb58fb977f728e4ea))
* **payment:** PAYPAL-654 Add callback and disable submit button ([1f2fc79](https://github.com/bigcommerce/checkout-sdk-js/commit/1f2fc7999f75f143b39c2c4abf316bb3d45ca150))
* **payment:** PAYPAL-654 Add hidePaymentButton instead EmbeddedSubmitButton ([b57cd2b](https://github.com/bigcommerce/checkout-sdk-js/commit/b57cd2b2ed28169f4c642c96d0688202597e8a17))
* **payment:** PAYPAL-654 Changes for PR ([aad6632](https://github.com/bigcommerce/checkout-sdk-js/commit/aad6632c9ad5717be136aa8801526c45f380db19))
* **payment:** PAYPAL-654 Changes for PR ([c31a459](https://github.com/bigcommerce/checkout-sdk-js/commit/c31a459c7f789e4bf2f8d8dbae7028cfe2bf523f))
* **payment:** PAYPAL-654 Remove EmbeddedSubmitButton ([71f9937](https://github.com/bigcommerce/checkout-sdk-js/commit/71f99374dfcdbe1c665ec86fab133eabfaf77929))
* **payment:** PAYPAL-654 Rename hidePaymentButton to onRenderButton ([71d34d2](https://github.com/bigcommerce/checkout-sdk-js/commit/71d34d2a5ad1ab5b15770d907487904ff4918112))
* **payment:** PAYPAL-654 Spb checkout ([8f7b9a7](https://github.com/bigcommerce/checkout-sdk-js/commit/8f7b9a74ee923ae69d1debbc7b0bcdafe29dda9a))
* **payment:** PAYPAL-654 Take out paypal script to processor ([87a0902](https://github.com/bigcommerce/checkout-sdk-js/commit/87a09026518ab3f2a88fdef25e980beff5bfbf97))
* **payment:** PAYPAL-654 Tests ([f348dfc](https://github.com/bigcommerce/checkout-sdk-js/commit/f348dfc07e50d05ccadac2b1659fdbb578e3a187))

### [1.99.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.99.2...v1.99.3) (2020-09-17)


### Bug Fixes

* **payment:** CHECKOUT-5135 Reset Braintree hosted form initialisation state ([fe606c0](https://github.com/bigcommerce/checkout-sdk-js/commit/fe606c05cf0a1f67030efc4911eb474914f45f6e))

### [1.99.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.99.1...v1.99.2) (2020-09-15)


### Bug Fixes

* **payment:** CHECKOUT-5135 Fix onValidate callback not getting called with correct error type and not getting called when tokenize returns validation error ([307c44d](https://github.com/bigcommerce/checkout-sdk-js/commit/307c44daaf32e437988ce4569ed58377bccb7860))

### [1.99.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.99.0...v1.99.1) (2020-09-15)

## [1.99.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.98.0...v1.99.0) (2020-09-10)


### Features

* **payment:** INT-3061 added mandate field on order interface ([c8c542b](https://github.com/bigcommerce/checkout-sdk-js/commit/c8c542b0e9f486905b4a2fe99ae12287b107aad4))

## [1.98.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.97.1...v1.98.0) (2020-09-08)


### Features

* **checkout:** INT-3112 Merge Bolt strategies ([25e0c7d](https://github.com/bigcommerce/checkout-sdk-js/commit/25e0c7db01ef4f97766177046838c232057a4ddf))
* **payment:** INT-3027 Implementing client key ([e95bf66](https://github.com/bigcommerce/checkout-sdk-js/commit/e95bf66fe6ac5e42a85030268dd5b8a5094ecd9f))

### [1.97.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.97.0...v1.97.1) (2020-09-07)

## [1.97.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.96.0...v1.97.0) (2020-09-04)


### Features

* **payment:** INT-3027 Implementing client key ([77e6807](https://github.com/bigcommerce/checkout-sdk-js/commit/77e68077537207b1fe62d1913707c82c530896fa))
* **payment:** PAYPAL-202 Add tests ([c92dfe7](https://github.com/bigcommerce/checkout-sdk-js/commit/c92dfe790e62ddb38ead68e53eafe05a707584a9))
* **payment:** PAYPAL-202 Changes for PR ([144b0bb](https://github.com/bigcommerce/checkout-sdk-js/commit/144b0bb143f4ed95694a244408d390b89ef93d11))
* **payment:** PAYPAL-202 Hosted Credit Card ([04c740f](https://github.com/bigcommerce/checkout-sdk-js/commit/04c740fa12b55e89a7ee54f0775928a3f5ec5779))
* **payment:** PAYPAL-202 take clientToken from appropriate params ([4d8a5ed](https://github.com/bigcommerce/checkout-sdk-js/commit/4d8a5ed1f1b4d0b2c94f4bcf368b6bf1326a1565))

## [1.96.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.95.0...v1.96.0) (2020-09-02)


### Features

* **payment:** INT-3032 Add ES/EUR support to Klarna ([0b942ed](https://github.com/bigcommerce/checkout-sdk-js/commit/0b942ed983974c705eeeb4a638dfe5c3ed1c6674))

## [1.95.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.94.0...v1.95.0) (2020-08-31)


### Features

* **payment:** PAYMENTS-5513 add setAsDefaultInstrument to the nonce mapping white list ([#964](https://github.com/bigcommerce/checkout-sdk-js/issues/964)) ([2eaab8f](https://github.com/bigcommerce/checkout-sdk-js/commit/2eaab8f89226daa8864a824da763f8cbd492bef5))

## [1.94.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.93.2...v1.94.0) (2020-08-30)


### Features

* **payment:** INT-3084 Autopopulate card holder name ([3df5395](https://github.com/bigcommerce/checkout-sdk-js/commit/3df539532a0eef13c6622a6b224de883611f8574))

### [1.93.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.93.1...v1.93.2) (2020-08-26)


### Performance Improvements

* **payment:** INT-2926 Avoid unnecessary calls to payments/amazonpay and checkout-settings ([6e90e80](https://github.com/bigcommerce/checkout-sdk-js/commit/6e90e80120224e434c8c332faf64a5f90517564e))

### [1.93.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.93.0...v1.93.1) (2020-08-21)


### Bug Fixes

* **payment:** CHECKOUT-5115 CHECKOUT-5116 CHECKOUT-5117 Set correct type for card number verification field ([cb708cd](https://github.com/bigcommerce/checkout-sdk-js/commit/cb708cdd8c19f3aea333540150cee19362931594))

## [1.93.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.92.1...v1.93.0) (2020-08-21)


### Features

* **checkout:** INT-2992 Make store credit usable with bolt ([07d5cdd](https://github.com/bigcommerce/checkout-sdk-js/commit/07d5cdd5aedc8f4f9c652734d57cb62fc203a258))


### Bug Fixes

* **checkout:** INT-3041 Fix GooglePay updating shipping address when not needed ([28736af](https://github.com/bigcommerce/checkout-sdk-js/commit/28736afd978ee65a38db04e44953de4b94f9d412))

### [1.92.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.92.0...v1.92.1) (2020-08-18)


### Code Refactoring

* **payment:** INT-2995 Avoid setting up Affirm.js from string code ([b8b8f92](https://github.com/bigcommerce/checkout-sdk-js/commit/b8b8f92497379d646c8d6ce2a1d8147f3b2112d4))

## [1.92.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.91.1...v1.92.0) (2020-08-18)


### Features

* **payment:** PAYPAL-652 Add PPCP to SDK documentation ([83276b9](https://github.com/bigcommerce/checkout-sdk-js/commit/83276b916d829539ac5c3a5cb3770ca0ef218226))

### [1.91.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.91.0...v1.91.1) (2020-08-18)


### Bug Fixes

* **payment:** INT-2043 Apply store credit on StripeV3 ([ac41ff9](https://github.com/bigcommerce/checkout-sdk-js/commit/ac41ff9515e70306c574e93b788435eec7a45d6d))

## [1.91.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.90.2...v1.91.0) (2020-08-17)


### Features

* **payment:** INT-3016 remove phone number parameter in request if field is empty in Stripev3 ([c0220de](https://github.com/bigcommerce/checkout-sdk-js/commit/c0220de393161fba75350531236d2aefab04040d))

### [1.90.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.90.1...v1.90.2) (2020-08-14)


### Bug Fixes

* **payment:** INT-3010 Fix Zip store credit implementation ([37ffccf](https://github.com/bigcommerce/checkout-sdk-js/commit/37ffccf9ec63f3a85338d7d4b10a5fcdc08199fd))

### [1.90.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.90.0...v1.90.1) (2020-08-13)


### Code Refactoring

* **checkout:** CHECKOUT-4947 Remove unused key from settings object ([232a2cc](https://github.com/bigcommerce/checkout-sdk-js/commit/232a2cca5866861628e2af6ccba156d8a50ccdcc))
* **payment:** INT-2922 Upgrade Adyen Component Library ([50e5dd7](https://github.com/bigcommerce/checkout-sdk-js/commit/50e5dd75fd86c8c923a20969417bbfd079be1651))

## [1.90.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.89.0...v1.90.0) (2020-08-12)


### Features

* **payment:** PAYPAL-202 bump bigpay-client to 5.12 ([e1cebb6](https://github.com/bigcommerce/checkout-sdk-js/commit/e1cebb649b90eda7726c897e0a6949f50222463f))

## [1.89.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.88.0...v1.89.0) (2020-08-10)


### Features

* **payment:** INT-2907 Avoid returns duplicate vaulted instruments ([663194e](https://github.com/bigcommerce/checkout-sdk-js/commit/663194e0e427d07e43aaf226c57098b76d59f701))


### Bug Fixes

* **payment:** INT-2907 Fix linter in instrument selector ([2d455f0](https://github.com/bigcommerce/checkout-sdk-js/commit/2d455f07b8d1f7f6d92d5daa2a241d777bf51d6d))

## [1.88.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.87.0...v1.88.0) (2020-08-07)


### Features

* **payment:** CHECKOUT-4947 Modify Braintree credit card strategy to use hosted form service when feature is enabled ([3847aeb](https://github.com/bigcommerce/checkout-sdk-js/commit/3847aebcd62ddab7334bf4bb4b7ef0efb8a1a7f3))

## [1.87.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.86.0...v1.87.0) (2020-08-06)


### Features

* **payment:** CHECKOUT-4947 Inspect payment method object to determine whether hosted payment form is enabled for payment method ([5c49812](https://github.com/bigcommerce/checkout-sdk-js/commit/5c4981205f6469986c4e7f39b533d3c1ec8297a8))


### Bug Fixes

* **payment:** CHECKOUT-5089 Catch "permission denied" error when attempting to gather adjacent hosted inputs to support IE11 ([dc0f334](https://github.com/bigcommerce/checkout-sdk-js/commit/dc0f33484cad5193c3debab7cdb460736f41bfe1))

## [1.86.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.85.0...v1.86.0) (2020-07-30)


### Features

* **checkout:** INT-2919 Add Unit Test ([1de848f](https://github.com/bigcommerce/checkout-sdk-js/commit/1de848f14f98d0ff9bdb3b68e814e927f028c732))
* **checkout:** INT-2919 Add Unit test to script loader ([dddd1d1](https://github.com/bigcommerce/checkout-sdk-js/commit/dddd1d119a45e7babf665299a7631fcafd0864ad))
* **checkout:** INT-2919 Create an strategy in order to use Bolt in Bigcommerce checkout ([f25c662](https://github.com/bigcommerce/checkout-sdk-js/commit/f25c662ef860f084133fddb13ae24767f659e54c))
* **checkout:** INT-2919 Minor corrections ([4e1160d](https://github.com/bigcommerce/checkout-sdk-js/commit/4e1160db27a588e9bcae3925d4a78717b3419f05))
* **checkout:** INT-2919 move changes to another strategy ([d09c299](https://github.com/bigcommerce/checkout-sdk-js/commit/d09c299d822ecf309b1722bfd9e46e46747a3db4))
* **checkout:** INT-2919 Several fixes to mocks and indentation ([2570226](https://github.com/bigcommerce/checkout-sdk-js/commit/2570226f30e756ddd01e862a77556c183a84dc5d))

## [1.85.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.84.0...v1.85.0) (2020-07-29)


### Features

* **payment:** CHECKOUT-4947 Add Braintree hosted form service as abstraction layer for interacting with Braintree API ([a764cd0](https://github.com/bigcommerce/checkout-sdk-js/commit/a764cd09da18fb0d07809337238f13a35786c0f4))
* **payment:** CHECKOUT-4947 Add methods for loading and initializing Braintree hosted fields module ([fc87ee9](https://github.com/bigcommerce/checkout-sdk-js/commit/fc87ee96621483d8395d2d2e59234d6b5340cb72))
* **payment:** INT-2653 Accept payments through StripeV3 using Alipay ([997bd1d](https://github.com/bigcommerce/checkout-sdk-js/commit/997bd1d3838c6bb8c2a13e056aee2648ce6ec30b))
* **payment:** INT-2801 Prepopulate ACH Billing Info ([84f1524](https://github.com/bigcommerce/checkout-sdk-js/commit/84f152494e779e47eea8f7f43122220b4571c824))
* **payment:** PAYMENTS-5513 add setAsDefaultInstrument feature during vaulting or vaulted payments ([#893](https://github.com/bigcommerce/checkout-sdk-js/issues/893)) ([055b7ee](https://github.com/bigcommerce/checkout-sdk-js/commit/055b7eea7be09ff09220bdcb599aec4e94f86cf8))

## [1.84.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.83.0...v1.84.0) (2020-07-22)


### Features

* **payment:** INT-2532 Accept payments through StripeV3 using iDEAL & SEPA ([3fcb1cc](https://github.com/bigcommerce/checkout-sdk-js/commit/3fcb1cc61e78a7e298ee6c0014132b72a4b8581f))

## [1.83.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.82.4...v1.83.0) (2020-07-22)


### Features

* **payment:** PAYPAL-539 Add validate params in script loader ([1bac153](https://github.com/bigcommerce/checkout-sdk-js/commit/1bac1535e865feba3ec80dae0aa6d3f026a55ed9))
* **payment:** PAYPAL-539 MerchantId does not required for progressive onboarding ([ec88cf7](https://github.com/bigcommerce/checkout-sdk-js/commit/ec88cf76e3cd0245fc062355297ec457e5e1d7c1))

### [1.82.4](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.82.3...v1.82.4) (2020-07-16)


### Bug Fixes

* **checkout:** CHECKOUT-5006 added displayDateFormat type ([75e190e](https://github.com/bigcommerce/checkout-sdk-js/commit/75e190e13de10d76165b7e20c3a916a2c34285e4))

### [1.82.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.82.2...v1.82.3) (2020-07-16)


### Bug Fixes

* **payment:** PAYMENTS-5575 fix paypal and bank instrument clash ([#918](https://github.com/bigcommerce/checkout-sdk-js/issues/918)) ([3908ed1](https://github.com/bigcommerce/checkout-sdk-js/commit/3908ed145d6d62ea2a357e6d0a64bc53991c3cde))

### [1.82.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.82.1...v1.82.2) (2020-07-14)


### Bug Fixes

* **payment:** CHECKOUT-5025 Fix Elavon Converge strategy so that it can utilise hosted payment form ([c2b21a9](https://github.com/bigcommerce/checkout-sdk-js/commit/c2b21a90d174c253d179412561ba2b96a67d0eb5))
* **payment:** CHECKOUT-5029 Return error if hosted field iframe is removed during asynchronous call ([35f91df](https://github.com/bigcommerce/checkout-sdk-js/commit/35f91df566a47f081150bc9db2236da0c26c525e))
* **shipping:** INT-2832 Handle custom fields for AmazonPayV2 ([a27d244](https://github.com/bigcommerce/checkout-sdk-js/commit/a27d24466ec69e1d9182028480c7dc39bf2953ac))

### [1.82.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.82.0...v1.82.1) (2020-07-10)

## [1.82.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.81.0...v1.82.0) (2020-07-07)


### Features

* **common:** BC-897 Upgrade typescript ([08cc2f8](https://github.com/bigcommerce/checkout-sdk-js/commit/08cc2f8))
* **payment:** PAYPAL-539 MerchantId does not required for progressive onboarding ([816658d](https://github.com/bigcommerce/checkout-sdk-js/commit/816658d))

## [1.81.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.80.2...v1.81.0) (2020-07-03)


### Features

* **payment:** PAYPAL-508 Mark up flow additional params ([a0cf703](https://github.com/bigcommerce/checkout-sdk-js/commit/a0cf703))

### [1.80.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.80.1...v1.80.2) (2020-07-03)


### Bug Fixes

* **payment:** CHECKOUT-4995 Pass additional action data to hosted forms ([59abc4f](https://github.com/bigcommerce/checkout-sdk-js/commit/59abc4f))

### [1.80.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.80.0...v1.80.1) (2020-07-02)


### Bug Fixes

* **payment:** CHECKOUT-4973 Initialise hosted payment field within its iframe ([db5610e](https://github.com/bigcommerce/checkout-sdk-js/commit/db5610e))

## [1.80.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.79.0...v1.80.0) (2020-07-01)


### Features

* **payment:** INT-2748 Adding Sezzle strategy ([327ecb5](https://github.com/bigcommerce/checkout-sdk-js/commit/327ecb5))

## [1.79.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.78.1...v1.79.0) (2020-06-25)


### Features

* **checkout:** INT-2274 Add vaulting support for Checkout.com ([89b4608](https://github.com/bigcommerce/checkout-sdk-js/commit/89b4608))
* **payment:** INT-2279 Create a strategy for credit cards with redirect and add support to Checkout.com ([#809](https://github.com/bigcommerce/checkout-sdk-js/issues/809)) ([0f42b13](https://github.com/bigcommerce/checkout-sdk-js/commit/0f42b13))
* **payment:** INT-2280 Added GooglePay for Checkout.com ([894d863](https://github.com/bigcommerce/checkout-sdk-js/commit/894d863))

### [1.78.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.78.0...v1.78.1) (2020-06-24)

## [1.78.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.77.3...v1.78.0) (2020-06-23)


### Features

* **payment:** INT-2113 Checkout button and customer strategy ([908a04d](https://github.com/bigcommerce/checkout-sdk-js/commit/908a04d))
* **payment:** INT-2119 adding payment and shipping strategies ([c0e9cf3](https://github.com/bigcommerce/checkout-sdk-js/commit/c0e9cf3))
* **payment:** INT-2119 Create WidgetInteraction action for Shipping Strategy ([ee6757d](https://github.com/bigcommerce/checkout-sdk-js/commit/ee6757d))

### [1.77.3](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.77.2...v1.77.3) (2020-06-16)


### Bug Fixes

* **payment:** PAYPAL-453 Submit device data to Braintree/Kount ([6506716](https://github.com/bigcommerce/checkout-sdk-js/commit/6506716))

### [1.77.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.77.1...v1.77.2) (2020-06-15)


### Bug Fixes

* **payment:** INT-2759 Do not mount GiroPay component while initializing payment strategy ([7bc9e54](https://github.com/bigcommerce/checkout-sdk-js/commit/7bc9e54))

### [1.77.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.77.0...v1.77.1) (2020-06-11)


### Code Refactoring

* **payment:** INT-2614 renaming values for iban/accountnumber ([a8955dd](https://github.com/bigcommerce/checkout-sdk-js/commit/a8955dd))

## [1.77.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.76.2...v1.77.0) (2020-06-11)


### Bug Fixes

* **common:** INT-2308 Align button Tell me more at checkout section ([a6010bc](https://github.com/bigcommerce/checkout-sdk-js/commit/a6010bc))


### Features

* **common:** ORDERS-3323 Ensure coupon codes are upper case. ([269c236](https://github.com/bigcommerce/checkout-sdk-js/commit/269c236))
* **payment:** INT-2722 Upgrade Adyen component library ([b10d0c7](https://github.com/bigcommerce/checkout-sdk-js/commit/b10d0c7))
* **payment:** PAYPAL-483 Pass merchant ID on PayPal button for PPCP ([20f1756](https://github.com/bigcommerce/checkout-sdk-js/commit/20f1756))

### [1.76.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.76.1...v1.76.2) (2020-06-04)


### Bug Fixes

* **payment:** INT-2726 Revert Fix redirect to home on safari ([03fe0f4](https://github.com/bigcommerce/checkout-sdk-js/commit/03fe0f4))

### [1.76.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.76.0...v1.76.1) (2020-06-02)

## [1.76.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.75.0...v1.76.0) (2020-06-01)


### Features

* **checkout:** INT-2001 Reload widget when apply store credit checkbox state changes ([a133618](https://github.com/bigcommerce/checkout-sdk-js/commit/a133618))
* **payment:** INT-2629 Relate stripeConnectedAccount while initilializing GooglePay ([a62dc1d](https://github.com/bigcommerce/checkout-sdk-js/commit/a62dc1d))

## [1.75.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.74.0...v1.75.0) (2020-05-28)


### Bug Fixes

* **payment:** INT-2674 Fix redirect to home on safari ([661f503](https://github.com/bigcommerce/checkout-sdk-js/commit/661f503))


### Features

* **payment:** INT-2668 Increase code coverage for adyenv2 payment strategy ([a327e59](https://github.com/bigcommerce/checkout-sdk-js/commit/a327e59))
* **payment:** PAYMENTS-5443 Update docs to include human verification at payment step ([b50b04e](https://github.com/bigcommerce/checkout-sdk-js/commit/b50b04e))

## [1.74.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.73.0...v1.74.0) (2020-05-28)


### Features

* **payment:** INT-2541 Add Laybuy strategy ([#837](https://github.com/bigcommerce/checkout-sdk-js/issues/837)) ([7e3f936](https://github.com/bigcommerce/checkout-sdk-js/commit/7e3f936))

## [1.73.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.72.2...v1.73.0) (2020-05-28)


### Features

* **checkout:** CHECKOUT-4754 Send a header to indicate the version of the SDK used to place an order ([3efccbb](https://github.com/bigcommerce/checkout-sdk-js/commit/3efccbb))
* **checkout:** CHECKOUT-4754 Send an additional header to provide information about the checkout variant that is used to pay for an order ([e1224e2](https://github.com/bigcommerce/checkout-sdk-js/commit/e1224e2))

### [1.72.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.72.1...v1.72.2) (2020-05-26)


### Bug Fixes

* **payment:** INT-2691 Remove integrity & crossorigin attributes ([fb007e9](https://github.com/bigcommerce/checkout-sdk-js/commit/fb007e9))
* **payment:** INT-2691 Remove integrity & crossorigin attributes ([db6ccf9](https://github.com/bigcommerce/checkout-sdk-js/commit/db6ccf9))

### [1.72.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.72.0...v1.72.1) (2020-05-26)


### Bug Fixes

* **payment:** INT-2690 Expose AdyenV2 as a valid GooglePay gateway ([97d32e3](https://github.com/bigcommerce/checkout-sdk-js/commit/97d32e3))

## [1.72.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.71.0...v1.72.0) (2020-05-25)


### Features

* **common:** CHECKOUT-4760 Expose shouldSaveAddress attribute ([1f6ff20](https://github.com/bigcommerce/checkout-sdk-js/commit/1f6ff20))

## [1.71.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.70.1...v1.71.0) (2020-05-25)


### Bug Fixes

* **payment:** PAYMENTS-5425 add missing paymentHumanVerificationHandler dep of BoltPaymentStrategy ([#885](https://github.com/bigcommerce/checkout-sdk-js/issues/885)) ([a7618a6](https://github.com/bigcommerce/checkout-sdk-js/commit/a7618a6))


### Features

* **payment:** PAYMENTS-5425 Implement the UX for Carding remediation solution ([#875](https://github.com/bigcommerce/checkout-sdk-js/issues/875)) ([cbaa2d3](https://github.com/bigcommerce/checkout-sdk-js/commit/cbaa2d3))

### [1.70.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.70.0...v1.70.1) (2020-05-22)


### Code Refactoring

* **payment:** INT-2684 Upgrade Adyen Component Library ([a872a4c](https://github.com/bigcommerce/checkout-sdk-js/commit/a872a4c))

## [1.70.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.69.2...v1.70.0) (2020-05-22)


### Bug Fixes

* **payment:** CHECKOUT-4904 Pass Store Credit properly to amazon pay ([6900644](https://github.com/bigcommerce/checkout-sdk-js/commit/6900644))


### Features

* **checkout:** INT-2577 Create a strategy for Bolt ([484eab8](https://github.com/bigcommerce/checkout-sdk-js/commit/484eab8))
* **payment:** INT-2613 remove receipt_email in stripe-strategy ([9c10454](https://github.com/bigcommerce/checkout-sdk-js/commit/9c10454))

### [1.69.2](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.69.1...v1.69.2) (2020-05-20)


### Bug Fixes

* **shopper:** CHECKOUT-4897 Add redirect_to to SignInEmail ([b020bfa](https://github.com/bigcommerce/checkout-sdk-js/commit/b020bfa))

### [1.69.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.69.0...v1.69.1) (2020-05-19)


### Bug Fixes

* **shopper:** CHECKOUT-4742 Update customer object when continuing as guest ([c83c50f](https://github.com/bigcommerce/checkout-sdk-js/commit/c83c50f))

## [1.69.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.68.0...v1.69.0) (2020-05-15)


### Features

* **payment:** INT-2612 Pay with vaulted SEPA accounts ([a97533f](https://github.com/bigcommerce/checkout-sdk-js/commit/a97533f))

## [1.68.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.67.1...v1.68.0) (2020-05-14)


### Features

* **payment:** PAYPAL-365 choses paypalcredit method on the checkout ([cfae602](https://github.com/bigcommerce/checkout-sdk-js/commit/cfae602))

### [1.67.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.67.0...v1.67.1) (2020-05-14)


### Bug Fixes

* **payment:** PAYPAL-406 Checkout order after approval issue ([438bf2b](https://github.com/bigcommerce/checkout-sdk-js/commit/438bf2b))

## [1.67.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.66.0...v1.67.0) (2020-05-14)


### Features

* **checkout:** INT-2497 Add elavon to supported instruments whitelist ([b145268](https://github.com/bigcommerce/checkout-sdk-js/commit/b145268))
* **payment:** INT-2437 Add support for GooglePay on Adyen ([4853677](https://github.com/bigcommerce/checkout-sdk-js/commit/4853677))

## [1.66.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.65.0...v1.66.0) (2020-05-12)


### Code Refactoring

* **payment:** INT-2611 Update the klarna session before load the widget ([4905de5](https://github.com/bigcommerce/checkout-sdk-js/commit/4905de5))


### Features

* **common:** CHECKOUT-4879 Expose flash messages ([f9c71e5](https://github.com/bigcommerce/checkout-sdk-js/commit/f9c71e5))

## [1.65.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.64.0...v1.65.0) (2020-05-06)


### Features

* **payment:** PAYPAL-293 Bump bigpay-client version to 5.6.0 ([b58a229](https://github.com/bigcommerce/checkout-sdk-js/commit/b58a229))

## [1.64.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.63.1...v1.64.0) (2020-05-05)


### Features

* **payment:** PAYPAL-293 Implement paypalcommercecredit provider ([ceaaa69](https://github.com/bigcommerce/checkout-sdk-js/commit/ceaaa69))

### [1.63.1](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.63.0...v1.63.1) (2020-05-04)


### Bug Fixes

* **spam-protection:** CHECKOUT-4852 Make sure spam protection execution status is accurate ([be0221d](https://github.com/bigcommerce/checkout-sdk-js/commit/be0221d))
* **spam-protection:** CHECKOUT-4852 Rethrow spam protection cancellation error ([0294b2b](https://github.com/bigcommerce/checkout-sdk-js/commit/0294b2b))

## [1.63.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.62.0...v1.63.0) (2020-04-29)


### Features

* **payment:** PAYPAL-19 Paypal Commerce ([2ab3bed](https://github.com/bigcommerce/checkout-sdk-js/commit/2ab3bed))

## [1.62.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.61.0...v1.62.0) (2020-04-29)


### Features

* **payment:** INT-2428 Modified filter to accept AccountInstruments ([7eab61b](https://github.com/bigcommerce/checkout-sdk-js/commit/7eab61b))

## [1.61.0](https://github.com/bigcommerce/checkout-sdk-js/compare/v1.60.1...v1.61.0) (2020-04-23)


### Bug Fixes

* **payment:** CHECKOUT-4842 Trigger event when "enter" key is pressed in one of hosted payment fields ([a9f9e86](https://github.com/bigcommerce/checkout-sdk-js/commit/a9f9e86))


### Features

* **shopper:** CHECKOUT-4799 Add Sign-in Email support ([bbea61e](https://github.com/bigcommerce/checkout-sdk-js/commit/bbea61e))

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
