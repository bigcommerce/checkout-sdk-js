[@bigcommerce/checkout-sdk](../README.md) / GatewayOrderPayment

# Interface: GatewayOrderPayment

## Hierarchy

- [`OrderPayment`](OrderPayment.md)

  ↳ **`GatewayOrderPayment`**

## Table of contents

### Properties

- [amount](GatewayOrderPayment.md#amount)
- [description](GatewayOrderPayment.md#description)
- [detail](GatewayOrderPayment.md#detail)
- [gatewayId](GatewayOrderPayment.md#gatewayid)
- [mandate](GatewayOrderPayment.md#mandate)
- [methodId](GatewayOrderPayment.md#methodid)
- [paymentId](GatewayOrderPayment.md#paymentid)
- [providerId](GatewayOrderPayment.md#providerid)

## Properties

### amount

• **amount**: `number`

#### Inherited from

[OrderPayment](OrderPayment.md).[amount](OrderPayment.md#amount)

___

### description

• **description**: `string`

#### Inherited from

[OrderPayment](OrderPayment.md).[description](OrderPayment.md#description)

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

[OrderPayment](OrderPayment.md).[gatewayId](OrderPayment.md#gatewayid)

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

[OrderPayment](OrderPayment.md).[methodId](OrderPayment.md#methodid)

___

### paymentId

• `Optional` **paymentId**: `string`

#### Inherited from

[OrderPayment](OrderPayment.md).[paymentId](OrderPayment.md#paymentid)

___

### providerId

• **providerId**: `string`

#### Inherited from

[OrderPayment](OrderPayment.md).[providerId](OrderPayment.md#providerid)
