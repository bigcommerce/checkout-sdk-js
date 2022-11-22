[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StripeUPEShippingInitializeOptions

# Interface: StripeUPEShippingInitializeOptions

[<internal>](../modules/internal_.md).StripeUPEShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support StripeUpe.

When StripeUpe is initialized, an iframe will be inserted into the DOM. The
iframe has a list of shipping addresses for the customer to choose from.

## Table of contents

### Properties

- [availableCountries](internal_.StripeUPEShippingInitializeOptions.md#availablecountries)
- [container](internal_.StripeUPEShippingInitializeOptions.md#container)
- [gatewayId](internal_.StripeUPEShippingInitializeOptions.md#gatewayid)
- [methodId](internal_.StripeUPEShippingInitializeOptions.md#methodid)

### Methods

- [getStripeState](internal_.StripeUPEShippingInitializeOptions.md#getstripestate)
- [getStyles](internal_.StripeUPEShippingInitializeOptions.md#getstyles)
- [onChangeShipping](internal_.StripeUPEShippingInitializeOptions.md#onchangeshipping)

## Properties

### availableCountries

• **availableCountries**: `string`

Available countries configured on BC shipping setup.

___

### container

• `Optional` **container**: `string`

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

### getStripeState

▸ **getStripeState**(`country`, `state`): `string`

get the state code needed for shipping stripe element

#### Parameters

| Name | Type |
| :------ | :------ |
| `country` | `string` |
| `state` | `string` |

#### Returns

`string`

___

### getStyles

▸ `Optional` **getStyles**(): `Object`

get styles from store theme

#### Returns

`Object`

___

### onChangeShipping

▸ **onChangeShipping**(`shipping`): `void`

A callback that gets called whenever the Stripe Link Shipping Element's object is completed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `shipping` | [`StripeEventType`](../modules/internal_.md#stripeeventtype) |

#### Returns

`void`
