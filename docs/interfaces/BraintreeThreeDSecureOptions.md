[@bigcommerce/checkout-sdk](../README.md) / BraintreeThreeDSecureOptions

# Interface: BraintreeThreeDSecureOptions

A set of options that are required to support 3D Secure authentication flow.

If the customer uses a credit card that has 3D Secure enabled, they will be
asked to verify their identity when they pay. The verification is done
through a web page via an iframe provided by the card issuer.

## Table of contents

### Properties

- [additionalInformation](BraintreeThreeDSecureOptions.md#additionalinformation)
- [challengeRequested](BraintreeThreeDSecureOptions.md#challengerequested)

### Methods

- [addFrame](BraintreeThreeDSecureOptions.md#addframe)
- [removeFrame](BraintreeThreeDSecureOptions.md#removeframe)

## Properties

### additionalInformation

• `Optional` **additionalInformation**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `acsWindowSize?` | ``"01"`` \| ``"02"`` \| ``"03"`` \| ``"04"`` \| ``"05"`` |

___

### challengeRequested

• `Optional` **challengeRequested**: `boolean`

## Methods

### addFrame

▸ **addFrame**(`error`, `iframe`, `cancel`): `void`

A callback that gets called when the iframe is ready to be added to the
current page. It is responsible for determining where the iframe should
be inserted in the DOM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `undefined` \| `Error` | Any error raised during the verification process; undefined if there is none. |
| `iframe` | `HTMLIFrameElement` | The iframe element containing the verification web page provided by the card issuer. |
| `cancel` | () => `undefined` \| `Promise`<[`BraintreeVerifyPayload`](BraintreeVerifyPayload.md)\> | A function, when called, will cancel the verification process and remove the iframe. |

#### Returns

`void`

___

### removeFrame

▸ **removeFrame**(): `void`

A callback that gets called when the iframe is about to be removed from
the current page.

#### Returns

`void`
