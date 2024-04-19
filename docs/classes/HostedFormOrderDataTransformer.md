[@bigcommerce/checkout-sdk](../README.md) / HostedFormOrderDataTransformer

# Class: HostedFormOrderDataTransformer

## Table of contents

### Constructors

- [constructor](HostedFormOrderDataTransformer.md#constructor)

### Methods

- [transform](HostedFormOrderDataTransformer.md#transform)

## Constructors

### constructor

• **new HostedFormOrderDataTransformer**(`_store`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_store` | [`ReadableCheckoutStore`](../README.md#readablecheckoutstore) |

## Methods

### transform

▸ **transform**(`payload`, `additionalAction?`): [`HostedFormOrderData`](../interfaces/HostedFormOrderData.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`OrderPaymentRequestBody`](../interfaces/OrderPaymentRequestBody.md) |
| `additionalAction?` | [`PaymentAdditionalAction`](../interfaces/PaymentAdditionalAction.md) |

#### Returns

[`HostedFormOrderData`](../interfaces/HostedFormOrderData.md)
