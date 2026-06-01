[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / BaseAccountInstrument

# Interface: BaseAccountInstrument

## Extends

- [`BaseInstrument`](BaseInstrument.md)

## Extended by

- [`AchInstrument`](AchInstrument.md)
- [`BankInstrument`](BankInstrument.md)
- [`PayPalInstrument`](PayPalInstrument.md)

## Properties

### bigpayToken

> **bigpayToken**: `string`

#### Inherited from

[`BaseInstrument`](BaseInstrument.md).[`bigpayToken`](BaseInstrument.md#bigpaytoken)

***

### defaultInstrument

> **defaultInstrument**: `boolean`

#### Inherited from

[`BaseInstrument`](BaseInstrument.md).[`defaultInstrument`](BaseInstrument.md#defaultinstrument)

***

### method

> **method**: `string`

#### Overrides

[`BaseInstrument`](BaseInstrument.md).[`method`](BaseInstrument.md#method)

***

### provider

> **provider**: `string`

#### Inherited from

[`BaseInstrument`](BaseInstrument.md).[`provider`](BaseInstrument.md#provider)

***

### trustedShippingAddress

> **trustedShippingAddress**: `boolean`

#### Inherited from

[`BaseInstrument`](BaseInstrument.md).[`trustedShippingAddress`](BaseInstrument.md#trustedshippingaddress)

***

### type

> **type**: `"account"` \| `"bank"`

#### Overrides

[`BaseInstrument`](BaseInstrument.md).[`type`](BaseInstrument.md#type)
