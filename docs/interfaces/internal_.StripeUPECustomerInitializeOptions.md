[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StripeUPECustomerInitializeOptions

# Interface: StripeUPECustomerInitializeOptions

[<internal>](../modules/internal_.md).StripeUPECustomerInitializeOptions

## Table of contents

### Properties

- [container](internal_.StripeUPECustomerInitializeOptions.md#container)
- [gatewayId](internal_.StripeUPECustomerInitializeOptions.md#gatewayid)
- [methodId](internal_.StripeUPECustomerInitializeOptions.md#methodid)

### Methods

- [getStyles](internal_.StripeUPECustomerInitializeOptions.md#getstyles)
- [isLoading](internal_.StripeUPECustomerInitializeOptions.md#isloading)
- [onEmailChange](internal_.StripeUPECustomerInitializeOptions.md#onemailchange)

## Properties

### container

• **container**: `string`

The ID of a container which the stripe iframe should be inserted.

___

### gatewayId

• **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Stripeupe and Klarna.

___

### methodId

• **methodId**: `string`

The identifier of the payment method.

## Methods

### getStyles

▸ `Optional` **getStyles**(): `undefined` \| { `[key: string]`: `string`;  }

get styles from store theme

#### Returns

`undefined` \| { `[key: string]`: `string`;  }

___

### isLoading

▸ **isLoading**(`mounted`): `void`

A callback that gets called when Stripe Link Authentication Element is Loaded.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mounted` | `boolean` |

#### Returns

`void`

___

### onEmailChange

▸ **onEmailChange**(`authenticated`, `email`): `void`

A callback that gets called whenever the Stripe Link Authentication Element's value changes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `authenticated` | `boolean` | if the email is authenticated on Stripe. |
| `email` | `string` | The new value of the email. |

#### Returns

`void`
