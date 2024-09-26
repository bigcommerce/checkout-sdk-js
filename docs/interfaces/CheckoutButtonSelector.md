[@bigcommerce/checkout-sdk](../README.md) / CheckoutButtonSelector

# Interface: CheckoutButtonSelector

## Table of contents

### Methods

- [getDeinitializeError](CheckoutButtonSelector.md#getdeinitializeerror)
- [getInitializeError](CheckoutButtonSelector.md#getinitializeerror)
- [getState](CheckoutButtonSelector.md#getstate)
- [isDeinitializing](CheckoutButtonSelector.md#isdeinitializing)
- [isInitialized](CheckoutButtonSelector.md#isinitialized)
- [isInitializing](CheckoutButtonSelector.md#isinitializing)

## Methods

### getDeinitializeError

▸ **getDeinitializeError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`APPLEPAY`](../enums/CheckoutButtonMethodType.md#applepay) \| [`AMAZON_PAY_V2`](../enums/CheckoutButtonMethodType.md#amazon_pay_v2) \| [`BRAINTREE_PAYPAL`](../enums/CheckoutButtonMethodType.md#braintree_paypal) \| [`BRAINTREE_VENMO`](../enums/CheckoutButtonMethodType.md#braintree_venmo) \| [`BRAINTREE_PAYPAL_CREDIT`](../enums/CheckoutButtonMethodType.md#braintree_paypal_credit) \| [`GOOGLEPAY_ADYENV2`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv2) \| [`GOOGLEPAY_ADYENV3`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv3) \| [`GOOGLEPAY_AUTHORIZENET`](../enums/CheckoutButtonMethodType.md#googlepay_authorizenet) \| [`GOOGLEPAY_BNZ`](../enums/CheckoutButtonMethodType.md#googlepay_bnz) \| [`GOOGLEPAY_BRAINTREE`](../enums/CheckoutButtonMethodType.md#googlepay_braintree) \| [`GOOGLEPAY_CHECKOUTCOM`](../enums/CheckoutButtonMethodType.md#googlepay_checkoutcom) \| [`GOOGLEPAY_CYBERSOURCEV2`](../enums/CheckoutButtonMethodType.md#googlepay_cybersourcev2) \| [`GOOGLEPAY_ORBITAL`](../enums/CheckoutButtonMethodType.md#googlepay_orbital) \| [`GOOGLEPAY_STRIPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripe) \| [`GOOGLEPAY_STRIPEUPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripeupe) \| [`GOOGLEPAY_WORLDPAYACCESS`](../enums/CheckoutButtonMethodType.md#googlepay_worldpayaccess) \| [`MASTERPASS`](../enums/CheckoutButtonMethodType.md#masterpass) \| [`PAYPALEXPRESS`](../enums/CheckoutButtonMethodType.md#paypalexpress) |

#### Returns

`undefined` \| `Error`

___

### getInitializeError

▸ **getInitializeError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`APPLEPAY`](../enums/CheckoutButtonMethodType.md#applepay) \| [`AMAZON_PAY_V2`](../enums/CheckoutButtonMethodType.md#amazon_pay_v2) \| [`BRAINTREE_PAYPAL`](../enums/CheckoutButtonMethodType.md#braintree_paypal) \| [`BRAINTREE_VENMO`](../enums/CheckoutButtonMethodType.md#braintree_venmo) \| [`BRAINTREE_PAYPAL_CREDIT`](../enums/CheckoutButtonMethodType.md#braintree_paypal_credit) \| [`GOOGLEPAY_ADYENV2`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv2) \| [`GOOGLEPAY_ADYENV3`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv3) \| [`GOOGLEPAY_AUTHORIZENET`](../enums/CheckoutButtonMethodType.md#googlepay_authorizenet) \| [`GOOGLEPAY_BNZ`](../enums/CheckoutButtonMethodType.md#googlepay_bnz) \| [`GOOGLEPAY_BRAINTREE`](../enums/CheckoutButtonMethodType.md#googlepay_braintree) \| [`GOOGLEPAY_CHECKOUTCOM`](../enums/CheckoutButtonMethodType.md#googlepay_checkoutcom) \| [`GOOGLEPAY_CYBERSOURCEV2`](../enums/CheckoutButtonMethodType.md#googlepay_cybersourcev2) \| [`GOOGLEPAY_ORBITAL`](../enums/CheckoutButtonMethodType.md#googlepay_orbital) \| [`GOOGLEPAY_STRIPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripe) \| [`GOOGLEPAY_STRIPEUPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripeupe) \| [`GOOGLEPAY_WORLDPAYACCESS`](../enums/CheckoutButtonMethodType.md#googlepay_worldpayaccess) \| [`MASTERPASS`](../enums/CheckoutButtonMethodType.md#masterpass) \| [`PAYPALEXPRESS`](../enums/CheckoutButtonMethodType.md#paypalexpress) |

#### Returns

`undefined` \| `Error`

___

### getState

▸ **getState**(): [`CheckoutButtonState`](CheckoutButtonState.md)

#### Returns

[`CheckoutButtonState`](CheckoutButtonState.md)

___

### isDeinitializing

▸ **isDeinitializing**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`APPLEPAY`](../enums/CheckoutButtonMethodType.md#applepay) \| [`AMAZON_PAY_V2`](../enums/CheckoutButtonMethodType.md#amazon_pay_v2) \| [`BRAINTREE_PAYPAL`](../enums/CheckoutButtonMethodType.md#braintree_paypal) \| [`BRAINTREE_VENMO`](../enums/CheckoutButtonMethodType.md#braintree_venmo) \| [`BRAINTREE_PAYPAL_CREDIT`](../enums/CheckoutButtonMethodType.md#braintree_paypal_credit) \| [`GOOGLEPAY_ADYENV2`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv2) \| [`GOOGLEPAY_ADYENV3`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv3) \| [`GOOGLEPAY_AUTHORIZENET`](../enums/CheckoutButtonMethodType.md#googlepay_authorizenet) \| [`GOOGLEPAY_BNZ`](../enums/CheckoutButtonMethodType.md#googlepay_bnz) \| [`GOOGLEPAY_BRAINTREE`](../enums/CheckoutButtonMethodType.md#googlepay_braintree) \| [`GOOGLEPAY_CHECKOUTCOM`](../enums/CheckoutButtonMethodType.md#googlepay_checkoutcom) \| [`GOOGLEPAY_CYBERSOURCEV2`](../enums/CheckoutButtonMethodType.md#googlepay_cybersourcev2) \| [`GOOGLEPAY_ORBITAL`](../enums/CheckoutButtonMethodType.md#googlepay_orbital) \| [`GOOGLEPAY_STRIPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripe) \| [`GOOGLEPAY_STRIPEUPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripeupe) \| [`GOOGLEPAY_WORLDPAYACCESS`](../enums/CheckoutButtonMethodType.md#googlepay_worldpayaccess) \| [`MASTERPASS`](../enums/CheckoutButtonMethodType.md#masterpass) \| [`PAYPALEXPRESS`](../enums/CheckoutButtonMethodType.md#paypalexpress) |

#### Returns

`boolean`

___

### isInitialized

▸ **isInitialized**(`methodId`, `containerId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId` | [`CheckoutButtonMethodType`](../enums/CheckoutButtonMethodType.md) |
| `containerId?` | `string` |

#### Returns

`boolean`

___

### isInitializing

▸ **isInitializing**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | [`APPLEPAY`](../enums/CheckoutButtonMethodType.md#applepay) \| [`AMAZON_PAY_V2`](../enums/CheckoutButtonMethodType.md#amazon_pay_v2) \| [`BRAINTREE_PAYPAL`](../enums/CheckoutButtonMethodType.md#braintree_paypal) \| [`BRAINTREE_VENMO`](../enums/CheckoutButtonMethodType.md#braintree_venmo) \| [`BRAINTREE_PAYPAL_CREDIT`](../enums/CheckoutButtonMethodType.md#braintree_paypal_credit) \| [`GOOGLEPAY_ADYENV2`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv2) \| [`GOOGLEPAY_ADYENV3`](../enums/CheckoutButtonMethodType.md#googlepay_adyenv3) \| [`GOOGLEPAY_AUTHORIZENET`](../enums/CheckoutButtonMethodType.md#googlepay_authorizenet) \| [`GOOGLEPAY_BNZ`](../enums/CheckoutButtonMethodType.md#googlepay_bnz) \| [`GOOGLEPAY_BRAINTREE`](../enums/CheckoutButtonMethodType.md#googlepay_braintree) \| [`GOOGLEPAY_CHECKOUTCOM`](../enums/CheckoutButtonMethodType.md#googlepay_checkoutcom) \| [`GOOGLEPAY_CYBERSOURCEV2`](../enums/CheckoutButtonMethodType.md#googlepay_cybersourcev2) \| [`GOOGLEPAY_ORBITAL`](../enums/CheckoutButtonMethodType.md#googlepay_orbital) \| [`GOOGLEPAY_STRIPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripe) \| [`GOOGLEPAY_STRIPEUPE`](../enums/CheckoutButtonMethodType.md#googlepay_stripeupe) \| [`GOOGLEPAY_WORLDPAYACCESS`](../enums/CheckoutButtonMethodType.md#googlepay_worldpayaccess) \| [`MASTERPASS`](../enums/CheckoutButtonMethodType.md#masterpass) \| [`PAYPALEXPRESS`](../enums/CheckoutButtonMethodType.md#paypalexpress) |

#### Returns

`boolean`
