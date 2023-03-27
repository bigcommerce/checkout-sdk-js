[@bigcommerce/checkout-sdk](../README.md) / AmazonPayV2ButtonConfig

# Interface: AmazonPayV2ButtonConfig

## Hierarchy

- **`AmazonPayV2ButtonConfig`**

  ↳ [`AmazonPayV2ButtonParams`](AmazonPayV2ButtonParams.md)

  ↳ [`AmazonPayV2NewButtonParams`](AmazonPayV2NewButtonParams.md)

  ↳ [`WithBuyNowFeature`](WithBuyNowFeature.md)

## Table of contents

### Properties

- [buttonColor](AmazonPayV2ButtonConfig.md#buttoncolor)
- [checkoutLanguage](AmazonPayV2ButtonConfig.md#checkoutlanguage)
- [ledgerCurrency](AmazonPayV2ButtonConfig.md#ledgercurrency)
- [merchantId](AmazonPayV2ButtonConfig.md#merchantid)
- [placement](AmazonPayV2ButtonConfig.md#placement)
- [productType](AmazonPayV2ButtonConfig.md#producttype)
- [sandbox](AmazonPayV2ButtonConfig.md#sandbox)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`Gold`](../enums/AmazonPayV2ButtonColor.md#gold) \| [`LightGray`](../enums/AmazonPayV2ButtonColor.md#lightgray) \| [`DarkGray`](../enums/AmazonPayV2ButtonColor.md#darkgray)

Color of the Amazon Pay button.

___

### checkoutLanguage

• `Optional` **checkoutLanguage**: [`en_US`](../enums/AmazonPayV2CheckoutLanguage.md#en_us) \| [`en_GB`](../enums/AmazonPayV2CheckoutLanguage.md#en_gb) \| [`de_DE`](../enums/AmazonPayV2CheckoutLanguage.md#de_de) \| [`fr_FR`](../enums/AmazonPayV2CheckoutLanguage.md#fr_fr) \| [`it_IT`](../enums/AmazonPayV2CheckoutLanguage.md#it_it) \| [`es_ES`](../enums/AmazonPayV2CheckoutLanguage.md#es_es) \| [`ja_JP`](../enums/AmazonPayV2CheckoutLanguage.md#ja_jp)

Language used to render the button and text on Amazon Pay hosted pages.

___

### ledgerCurrency

• **ledgerCurrency**: [`AmazonPayV2LedgerCurrency`](../enums/AmazonPayV2LedgerCurrency.md)

Ledger currency provided during registration for the given merchant identifier.

___

### merchantId

• **merchantId**: `string`

Amazon Pay merchant account identifier.

___

### placement

• **placement**: [`AmazonPayV2Placement`](../enums/AmazonPayV2Placement.md)

Placement of the Amazon Pay button on your website.

___

### productType

• `Optional` **productType**: [`PayAndShip`](../enums/AmazonPayV2PayOptions.md#payandship) \| [`PayOnly`](../enums/AmazonPayV2PayOptions.md#payonly)

Product type selected for checkout. Default is 'PayAndShip'.

___

### sandbox

• `Optional` **sandbox**: `boolean`

Sets button to Sandbox environment. You do not have to set this parameter
if your `publicKeyId` has an environment prefix. Default is false.
