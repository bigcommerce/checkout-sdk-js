[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenAdditionalActionCallbacks

# Interface: AdyenAdditionalActionCallbacks

## Extended by

- [`AdyenAdditionalActionOptions`](AdyenAdditionalActionOptions.md)
- [`AdyenThreeDS2Options`](AdyenThreeDS2Options.md)

## Methods

### onActionHandled()?

> `optional` **onActionHandled**(): `void`

A callback that gets called when an action, for example a QR code or 3D Secure 2 authentication screen, is shown to the shopper

#### Returns

`void`

***

### onBeforeLoad()?

> `optional` **onBeforeLoad**(`shopperInteraction?`): `void`

A callback that gets called before adyen component is loaded

#### Parameters

##### shopperInteraction?

`boolean`

#### Returns

`void`

***

### onComplete()?

> `optional` **onComplete**(): `void`

A callback that gets called when adyen component verification
is completed

#### Returns

`void`

***

### onLoad()?

> `optional` **onLoad**(`cancel?`): `void`

A callback that gets called when adyen component is loaded

#### Parameters

##### cancel?

() => `void`

#### Returns

`void`
