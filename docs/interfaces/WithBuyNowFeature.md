[@bigcommerce/checkout-sdk](../README.md) / WithBuyNowFeature

# Interface: WithBuyNowFeature

## Hierarchy

- [`AmazonPayV2ButtonConfig`](AmazonPayV2ButtonConfig.md)

  ↳ **`WithBuyNowFeature`**

## Table of contents

### Properties

- [buttonColor](WithBuyNowFeature.md#buttoncolor)
- [buyNowInitializeOptions](WithBuyNowFeature.md#buynowinitializeoptions)
- [checkoutLanguage](WithBuyNowFeature.md#checkoutlanguage)
- [ledgerCurrency](WithBuyNowFeature.md#ledgercurrency)
- [merchantId](WithBuyNowFeature.md#merchantid)
- [placement](WithBuyNowFeature.md#placement)
- [productType](WithBuyNowFeature.md#producttype)
- [sandbox](WithBuyNowFeature.md#sandbox)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`Gold`](../enums/AmazonPayV2ButtonColor.md#gold) \| [`LightGray`](../enums/AmazonPayV2ButtonColor.md#lightgray) \| [`DarkGray`](../enums/AmazonPayV2ButtonColor.md#darkgray)

Color of the Amazon Pay button.

#### Inherited from

[AmazonPayV2ButtonConfig](AmazonPayV2ButtonConfig.md).[buttonColor](AmazonPayV2ButtonConfig.md#buttoncolor)

___

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| [`BuyNowCartRequestBody`](BuyNowCartRequestBody.md) |

___

### checkoutLanguage

• `Optional` **checkoutLanguage**: [`en_US`](../enums/AmazonPayV2CheckoutLanguage.md#en_us) \| [`en_GB`](../enums/AmazonPayV2CheckoutLanguage.md#en_gb) \| [`de_DE`](../enums/AmazonPayV2CheckoutLanguage.md#de_de) \| [`fr_FR`](../enums/AmazonPayV2CheckoutLanguage.md#fr_fr) \| [`it_IT`](../enums/AmazonPayV2CheckoutLanguage.md#it_it) \| [`es_ES`](../enums/AmazonPayV2CheckoutLanguage.md#es_es) \| [`ja_JP`](../enums/AmazonPayV2CheckoutLanguage.md#ja_jp)

Language used to render the button and text on Amazon Pay hosted pages.

#### Inherited from

[AmazonPayV2ButtonConfig](AmazonPayV2ButtonConfig.md).[checkoutLanguage](AmazonPayV2ButtonConfig.md#checkoutlanguage)

___

### ledgerCurrency

• **ledgerCurrency**: [`AmazonPayV2LedgerCurrency`](../enums/AmazonPayV2LedgerCurrency.md)

Ledger currency provided during registration for the given merchant identifier.

#### Inherited from

[AmazonPayV2ButtonConfig](AmazonPayV2ButtonConfig.md).[ledgerCurrency](AmazonPayV2ButtonConfig.md#ledgercurrency)

___

### merchantId

• **merchantId**: `string`

Amazon Pay merchant account identifier.

#### Inherited from

[AmazonPayV2ButtonConfig](AmazonPayV2ButtonConfig.md).[merchantId](AmazonPayV2ButtonConfig.md#merchantid)

___

### placement

• **placement**: [`AmazonPayV2Placement`](../enums/AmazonPayV2Placement.md)

Placement of the Amazon Pay button on your website.

#### Inherited from

[AmazonPayV2ButtonConfig](AmazonPayV2ButtonConfig.md).[placement](AmazonPayV2ButtonConfig.md#placement)

___

### productType

• `Optional` **productType**: [`PayAndShip`](../enums/AmazonPayV2PayOptions.md#payandship) \| [`PayOnly`](../enums/AmazonPayV2PayOptions.md#payonly)

Product type selected for checkout. Default is 'PayAndShip'.

#### Inherited from

[AmazonPayV2ButtonConfig](AmazonPayV2ButtonConfig.md).[productType](AmazonPayV2ButtonConfig.md#producttype)

___

### sandbox

• `Optional` **sandbox**: `boolean`

Sets button to Sandbox environment. You do not have to set this parameter
if your `publicKeyId` has an environment prefix. Default is false.

#### Inherited from

[AmazonPayV2ButtonConfig](AmazonPayV2ButtonConfig.md).[sandbox](AmazonPayV2ButtonConfig.md#sandbox)
