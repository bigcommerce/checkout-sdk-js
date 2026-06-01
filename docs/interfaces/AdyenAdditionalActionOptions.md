[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenAdditionalActionOptions

# Interface: AdyenAdditionalActionOptions

## Extends

- [`AdyenAdditionalActionCallbacks`](AdyenAdditionalActionCallbacks.md)

## Properties

### containerId

> **containerId**: `string`

The location to insert the additional action component.

***

### widgetSize?

> `optional` **widgetSize?**: `string`

Specify Three3DS2Challenge Widget Size

Values
'01' = 250px x 400px
'02' = 390px x 400px
'03' = 500px x 600px
'04' = 600px x 400px
'05' = 100% x 100%

## Methods

### onActionHandled()?

> `optional` **onActionHandled**(): `void`

A callback that gets called when an action, for example a QR code or 3D Secure 2 authentication screen, is shown to the shopper

#### Returns

`void`

#### Inherited from

[`AdyenAdditionalActionCallbacks`](AdyenAdditionalActionCallbacks.md).[`onActionHandled`](AdyenAdditionalActionCallbacks.md#onactionhandled)

***

### onBeforeLoad()?

> `optional` **onBeforeLoad**(`shopperInteraction?`): `void`

A callback that gets called before adyen component is loaded

#### Parameters

##### shopperInteraction?

`boolean`

#### Returns

`void`

#### Inherited from

[`AdyenAdditionalActionCallbacks`](AdyenAdditionalActionCallbacks.md).[`onBeforeLoad`](AdyenAdditionalActionCallbacks.md#onbeforeload)

***

### onComplete()?

> `optional` **onComplete**(): `void`

A callback that gets called when adyen component verification
is completed

#### Returns

`void`

#### Inherited from

[`AdyenAdditionalActionCallbacks`](AdyenAdditionalActionCallbacks.md).[`onComplete`](AdyenAdditionalActionCallbacks.md#oncomplete)

***

### onLoad()?

> `optional` **onLoad**(`cancel?`): `void`

A callback that gets called when adyen component is loaded

#### Parameters

##### cancel?

() => `void`

#### Returns

`void`

#### Inherited from

[`AdyenAdditionalActionCallbacks`](AdyenAdditionalActionCallbacks.md).[`onLoad`](AdyenAdditionalActionCallbacks.md#onload)
