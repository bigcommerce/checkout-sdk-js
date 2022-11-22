[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / GatewayOrderPayment

# Interface: GatewayOrderPayment

[<internal>](../modules/internal_.md).GatewayOrderPayment

## Hierarchy

- [`OrderPayment`](internal_.OrderPayment.md)

  ↳ **`GatewayOrderPayment`**

## Table of contents

### Properties

- [amount](internal_.GatewayOrderPayment.md#amount)
- [description](internal_.GatewayOrderPayment.md#description)
- [detail](internal_.GatewayOrderPayment.md#detail)
- [gatewayId](internal_.GatewayOrderPayment.md#gatewayid)
- [mandate](internal_.GatewayOrderPayment.md#mandate)
- [methodId](internal_.GatewayOrderPayment.md#methodid)
- [paymentId](internal_.GatewayOrderPayment.md#paymentid)
- [providerId](internal_.GatewayOrderPayment.md#providerid)

## Properties

### amount

• **amount**: `number`

#### Inherited from

[OrderPayment](internal_.OrderPayment.md).[amount](internal_.OrderPayment.md#amount)

___

### description

• **description**: `string`

#### Inherited from

[OrderPayment](internal_.OrderPayment.md).[description](internal_.OrderPayment.md#description)

___

### detail

• **detail**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `instructions` | `string` |
| `step` | `string` |

___

### gatewayId

• `Optional` **gatewayId**: `string`

#### Inherited from

[OrderPayment](internal_.OrderPayment.md).[gatewayId](internal_.OrderPayment.md#gatewayid)

___

### mandate

• `Optional` **mandate**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `url?` | `string` |

___

### methodId

• `Optional` **methodId**: `string`

#### Inherited from

[OrderPayment](internal_.OrderPayment.md).[methodId](internal_.OrderPayment.md#methodid)

___

### paymentId

• `Optional` **paymentId**: `string`

#### Inherited from

[OrderPayment](internal_.OrderPayment.md).[paymentId](internal_.OrderPayment.md#paymentid)

___

### providerId

• **providerId**: `string`

#### Inherited from

[OrderPayment](internal_.OrderPayment.md).[providerId](internal_.OrderPayment.md#providerid)
