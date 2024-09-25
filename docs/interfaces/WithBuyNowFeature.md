[@bigcommerce/checkout-sdk](../README.md) / WithBuyNowFeature

# Interface: WithBuyNowFeature

## Hierarchy

- `AmazonPayV2ButtonConfig`

  ↳ **`WithBuyNowFeature`**

## Table of contents

### Properties

- [buttonColor](WithBuyNowFeature.md#buttoncolor)
- [buyNowInitializeOptions](WithBuyNowFeature.md#buynowinitializeoptions)
- [checkoutLanguage](WithBuyNowFeature.md#checkoutlanguage)
- [design](WithBuyNowFeature.md#design)
- [ledgerCurrency](WithBuyNowFeature.md#ledgercurrency)
- [merchantId](WithBuyNowFeature.md#merchantid)
- [placement](WithBuyNowFeature.md#placement)
- [productType](WithBuyNowFeature.md#producttype)
- [sandbox](WithBuyNowFeature.md#sandbox)

## Properties

### buttonColor

• `Optional` **buttonColor**: `AmazonPayV2ButtonColor`

Color of the Amazon Pay button.

#### Inherited from

AmazonPayV2ButtonConfig.buttonColor

___

### buyNowInitializeOptions

• `Optional` **buyNowInitializeOptions**: `Object`

The options that are required to initialize Buy Now functionality.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getBuyNowCartRequestBody?` | () => `void` \| `default` |

___

### checkoutLanguage

• `Optional` **checkoutLanguage**: `AmazonPayV2CheckoutLanguage`

Language used to render the button and text on Amazon Pay hosted pages.

#### Inherited from

AmazonPayV2ButtonConfig.checkoutLanguage

___

### design

• `Optional` **design**: `C0001`

Sets Amazon Pay button design.

#### Inherited from

AmazonPayV2ButtonConfig.design

___

### ledgerCurrency

• **ledgerCurrency**: `AmazonPayV2LedgerCurrency`

Ledger currency provided during registration for the given merchant identifier.

#### Inherited from

AmazonPayV2ButtonConfig.ledgerCurrency

___

### merchantId

• **merchantId**: `string`

Amazon Pay merchant account identifier.

#### Inherited from

AmazonPayV2ButtonConfig.merchantId

___

### placement

• **placement**: `AmazonPayV2Placement`

Placement of the Amazon Pay button on your website.

#### Inherited from

AmazonPayV2ButtonConfig.placement

___

### productType

• `Optional` **productType**: `AmazonPayV2PayOptions`

Product type selected for checkout. Default is 'PayAndShip'.

#### Inherited from

AmazonPayV2ButtonConfig.productType

___

### sandbox

• `Optional` **sandbox**: `boolean`

Sets button to Sandbox environment. You do not have to set this parameter
if your `publicKeyId` has an environment prefix. Default is false.

#### Inherited from

AmazonPayV2ButtonConfig.sandbox
