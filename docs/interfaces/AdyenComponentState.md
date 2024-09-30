[@bigcommerce/checkout-sdk](../README.md) / AdyenComponentState

# Interface: AdyenComponentState

## Table of contents

### Properties

- [data](AdyenComponentState.md#data)
- [errors](AdyenComponentState.md#errors)
- [isValid](AdyenComponentState.md#isvalid)
- [issuer](AdyenComponentState.md#issuer)
- [valid](AdyenComponentState.md#valid)

## Properties

### data

• `Optional` **data**: [`CardStateData`](CardStateData.md) \| [`IdealStateData`](IdealStateData.md) \| [`SepaStateData`](SepaStateData.md)

___

### errors

• `Optional` **errors**: [`CardStateErrors`](CardStateErrors.md)

___

### isValid

• `Optional` **isValid**: `boolean`

___

### issuer

• `Optional` **issuer**: `string`

___

### valid

• `Optional` **valid**: `Object`

#### Index signature

▪ [key: `string`]: `boolean`
