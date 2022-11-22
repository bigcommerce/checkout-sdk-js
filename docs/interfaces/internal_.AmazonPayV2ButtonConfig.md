[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AmazonPayV2ButtonConfig

# Interface: AmazonPayV2ButtonConfig

[<internal>](../modules/internal_.md).AmazonPayV2ButtonConfig

## Hierarchy

- **`AmazonPayV2ButtonConfig`**

  ↳ [`AmazonPayV2ButtonParams`](internal_.AmazonPayV2ButtonParams.md)

  ↳ [`AmazonPayV2NewButtonParams`](internal_.AmazonPayV2NewButtonParams.md)

## Table of contents

### Properties

- [buttonColor](internal_.AmazonPayV2ButtonConfig.md#buttoncolor)
- [checkoutLanguage](internal_.AmazonPayV2ButtonConfig.md#checkoutlanguage)
- [ledgerCurrency](internal_.AmazonPayV2ButtonConfig.md#ledgercurrency)
- [merchantId](internal_.AmazonPayV2ButtonConfig.md#merchantid)
- [placement](internal_.AmazonPayV2ButtonConfig.md#placement)
- [productType](internal_.AmazonPayV2ButtonConfig.md#producttype)
- [sandbox](internal_.AmazonPayV2ButtonConfig.md#sandbox)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`AmazonPayV2ButtonColor`](../enums/internal_.AmazonPayV2ButtonColor.md)

Color of the Amazon Pay button.

___

### checkoutLanguage

• `Optional` **checkoutLanguage**: [`AmazonPayV2CheckoutLanguage`](../enums/internal_.AmazonPayV2CheckoutLanguage.md)

Language used to render the button and text on Amazon Pay hosted pages.

___

### ledgerCurrency

• **ledgerCurrency**: [`AmazonPayV2LedgerCurrency`](../enums/internal_.AmazonPayV2LedgerCurrency.md)

Ledger currency provided during registration for the given merchant identifier.

___

### merchantId

• **merchantId**: `string`

Amazon Pay merchant account identifier.

___

### placement

• **placement**: [`AmazonPayV2Placement`](../enums/internal_.AmazonPayV2Placement.md)

Placement of the Amazon Pay button on your website.

___

### productType

• `Optional` **productType**: [`AmazonPayV2PayOptions`](../enums/internal_.AmazonPayV2PayOptions.md)

Product type selected for checkout. Default is 'PayAndShip'.

___

### sandbox

• `Optional` **sandbox**: `boolean`

Sets button to Sandbox environment. You do not have to set this parameter
if your `publicKeyId` has an environment prefix. Default is false.
