[@bigcommerce/checkout-sdk](../README.md) / HostedInputStoredCardErrorEvent

# Interface: HostedInputStoredCardErrorEvent

## Table of contents

### Properties

- [payload](HostedInputStoredCardErrorEvent.md#payload)
- [type](HostedInputStoredCardErrorEvent.md#type)

## Properties

### payload

• `Optional` **payload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error?` | `PaymentErrorData` |
| `errors?` | `string`[] |
| `response?` | `default`<`PaymentErrorResponseBody`\> |

___

### type

• **type**: [`StoredCardFailed`](../enums/HostedInputEventType.md#storedcardfailed)
