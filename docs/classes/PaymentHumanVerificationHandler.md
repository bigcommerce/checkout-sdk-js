[@bigcommerce/checkout-sdk](../README.md) / PaymentHumanVerificationHandler

# Class: PaymentHumanVerificationHandler

## Table of contents

### Constructors

- [constructor](PaymentHumanVerificationHandler.md#constructor)

### Methods

- [handle](PaymentHumanVerificationHandler.md#handle)

## Constructors

### constructor

• **new PaymentHumanVerificationHandler**(`_googleRecaptcha`): [`PaymentHumanVerificationHandler`](PaymentHumanVerificationHandler.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_googleRecaptcha` | [`GoogleRecaptcha`](GoogleRecaptcha.md) |

#### Returns

[`PaymentHumanVerificationHandler`](PaymentHumanVerificationHandler.md)

## Methods

### handle

▸ **handle**(`error`): `Promise`\<[`PaymentAdditionalAction`](../interfaces/PaymentAdditionalAction.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `any` |

#### Returns

`Promise`\<[`PaymentAdditionalAction`](../interfaces/PaymentAdditionalAction.md)\>

▸ **handle**(`id`, `key`): `Promise`\<[`PaymentAdditionalAction`](../interfaces/PaymentAdditionalAction.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `key` | `string` |

#### Returns

`Promise`\<[`PaymentAdditionalAction`](../interfaces/PaymentAdditionalAction.md)\>
