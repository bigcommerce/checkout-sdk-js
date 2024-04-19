[@bigcommerce/checkout-sdk](../README.md) / AmazonPayRemoteCheckout

# Interface: AmazonPayRemoteCheckout

## Table of contents

### Properties

- [billing](AmazonPayRemoteCheckout.md#billing)
- [referenceId](AmazonPayRemoteCheckout.md#referenceid)
- [settings](AmazonPayRemoteCheckout.md#settings)
- [shipping](AmazonPayRemoteCheckout.md#shipping)

## Properties

### billing

• `Optional` **billing**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address?` | ``false`` \| [`InternalAddress`](InternalAddress.md)<`string`\> |

___

### referenceId

• `Optional` **referenceId**: `string`

___

### settings

• `Optional` **settings**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `billing` | `string` |
| `billingMessage` | `string` |
| `customer` | `string` |
| `payment` | `string` |
| `provider` | `string` |
| `shipping` | `string` |

___

### shipping

• `Optional` **shipping**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address?` | ``false`` \| [`InternalAddress`](InternalAddress.md)<`string`\> |
