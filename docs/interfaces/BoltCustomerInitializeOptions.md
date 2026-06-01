[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BoltCustomerInitializeOptions

# Interface: BoltCustomerInitializeOptions

A set of options that are required to initialize the customer step of
checkout to support Bolt.

## Methods

### onInit()?

> `optional` **onInit**(`hasBoltAccount`, `email?`): `void`

A callback that gets called on initialize the strategy

#### Parameters

##### hasBoltAccount

`boolean`

The hasBoltAccount variable handle the result of checking user account availability on Bolt.

##### email?

`string`

Email address which was used for checking user account availability on Bolt.

#### Returns

`void`
