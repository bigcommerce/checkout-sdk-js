[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AmazonPayV2NewButtonParams

# Interface: AmazonPayV2NewButtonParams

[<internal>](../modules/internal_.md).AmazonPayV2NewButtonParams

## Hierarchy

- [`AmazonPayV2ButtonConfig`](internal_.AmazonPayV2ButtonConfig.md)

  ↳ **`AmazonPayV2NewButtonParams`**

## Table of contents

### Properties

- [buttonColor](internal_.AmazonPayV2NewButtonParams.md#buttoncolor)
- [checkoutLanguage](internal_.AmazonPayV2NewButtonParams.md#checkoutlanguage)
- [createCheckoutSessionConfig](internal_.AmazonPayV2NewButtonParams.md#createcheckoutsessionconfig)
- [estimatedOrderAmount](internal_.AmazonPayV2NewButtonParams.md#estimatedorderamount)
- [ledgerCurrency](internal_.AmazonPayV2NewButtonParams.md#ledgercurrency)
- [merchantId](internal_.AmazonPayV2NewButtonParams.md#merchantid)
- [placement](internal_.AmazonPayV2NewButtonParams.md#placement)
- [productType](internal_.AmazonPayV2NewButtonParams.md#producttype)
- [publicKeyId](internal_.AmazonPayV2NewButtonParams.md#publickeyid)
- [sandbox](internal_.AmazonPayV2NewButtonParams.md#sandbox)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`AmazonPayV2ButtonColor`](../enums/internal_.AmazonPayV2ButtonColor.md)

Color of the Amazon Pay button.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[buttonColor](internal_.AmazonPayV2ButtonConfig.md#buttoncolor)

___

### checkoutLanguage

• `Optional` **checkoutLanguage**: [`AmazonPayV2CheckoutLanguage`](../enums/internal_.AmazonPayV2CheckoutLanguage.md)

Language used to render the button and text on Amazon Pay hosted pages.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[checkoutLanguage](internal_.AmazonPayV2ButtonConfig.md#checkoutlanguage)

___

### createCheckoutSessionConfig

• `Optional` **createCheckoutSessionConfig**: [`AmazonPayV2CheckoutSessionConfig`](internal_.AmazonPayV2CheckoutSessionConfig.md)

Create Checkout Session configuration.

___

### estimatedOrderAmount

• `Optional` **estimatedOrderAmount**: [`AmazonPayV2Price`](internal_.AmazonPayV2Price.md)

It does not have to match the final order amount if the buyer updates
their order after starting checkout. Amazon Pay will use this value to
assess transaction risk and prevent buyers from selecting payment methods
that can't be used to process the order.

___

### ledgerCurrency

• **ledgerCurrency**: [`AmazonPayV2LedgerCurrency`](../enums/internal_.AmazonPayV2LedgerCurrency.md)

Ledger currency provided during registration for the given merchant identifier.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[ledgerCurrency](internal_.AmazonPayV2ButtonConfig.md#ledgercurrency)

___

### merchantId

• **merchantId**: `string`

Amazon Pay merchant account identifier.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[merchantId](internal_.AmazonPayV2ButtonConfig.md#merchantid)

___

### placement

• **placement**: [`AmazonPayV2Placement`](../enums/internal_.AmazonPayV2Placement.md)

Placement of the Amazon Pay button on your website.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[placement](internal_.AmazonPayV2ButtonConfig.md#placement)

___

### productType

• `Optional` **productType**: [`AmazonPayV2PayOptions`](../enums/internal_.AmazonPayV2PayOptions.md)

Product type selected for checkout. Default is 'PayAndShip'.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[productType](internal_.AmazonPayV2ButtonConfig.md#producttype)

___

### publicKeyId

• `Optional` **publicKeyId**: `string`

Credential provided by Amazon Pay. You must also set the `sandbox`
parameter if your `publicKeyId` does not have an environment prefix.

___

### sandbox

• `Optional` **sandbox**: `boolean`

Sets button to Sandbox environment. You do not have to set this parameter
if your `publicKeyId` has an environment prefix. Default is false.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[sandbox](internal_.AmazonPayV2ButtonConfig.md#sandbox)
