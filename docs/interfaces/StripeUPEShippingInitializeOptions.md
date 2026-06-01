[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / StripeUPEShippingInitializeOptions

# Interface: StripeUPEShippingInitializeOptions

A set of options that are required to initialize the shipping step of
checkout in order to support StripeUpe.

When StripeUpe is initialized, an iframe will be inserted into the DOM. The
iframe has a list of shipping addresses for the customer to choose from.

## Properties

### availableCountries

> **availableCountries**: `string`

Available countries configured on BC shipping setup.

***

### container?

> `optional` **container?**: `string`

The ID of a container which the stripe iframe should be inserted.

***

### gatewayId

> **gatewayId**: `string`

The identifier of the payment provider providing the payment method. This
option is only required if the provider offers multiple payment options.
i.e.: Stripeupe and Klarna.

***

### methodId

> **methodId**: `string`

The identifier of the payment method.

## Methods

### getStripeState()

> **getStripeState**(`country`, `state`, `isStripeStateMappingDisabledForES?`): `string`

get the state code needed for shipping stripe element

#### Parameters

##### country

`string`

##### state

`string`

##### isStripeStateMappingDisabledForES?

`boolean`

#### Returns

`string`

***

### getStyles()?

> `optional` **getStyles**(): `object`

get styles from store theme

#### Returns

`object`

***

### onChangeShipping()

> **onChangeShipping**(`shipping`): `void`

A callback that gets called whenever the Stripe Link Shipping Element's object is completed.

#### Parameters

##### shipping

`StripeEventType`

#### Returns

`void`

***

### setStripeExperiments()?

> `optional` **setStripeExperiments**(`experiments`): `void`

Set the Stripe experiments to be used in checkout-js components;
Stripe specific experiments broadcasts to SDK from payment provider configs request.

#### Parameters

##### experiments

`Record`\<`string`, `boolean`\>

#### Returns

`void`

void
