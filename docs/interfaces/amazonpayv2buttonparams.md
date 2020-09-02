[@bigcommerce/checkout-sdk](../README.md) › [AmazonPayV2ButtonParams](amazonpayv2buttonparams.md)

# Interface: AmazonPayV2ButtonParams

## Hierarchy

* **AmazonPayV2ButtonParams**

## Index

### Properties

* [checkoutLanguage](amazonpayv2buttonparams.md#optional-checkoutlanguage)
* [createCheckoutSession](amazonpayv2buttonparams.md#createcheckoutsession)
* [ledgerCurrency](amazonpayv2buttonparams.md#ledgercurrency)
* [merchantId](amazonpayv2buttonparams.md#merchantid)
* [placement](amazonpayv2buttonparams.md#placement)
* [productType](amazonpayv2buttonparams.md#optional-producttype)
* [sandbox](amazonpayv2buttonparams.md#optional-sandbox)

## Properties

### `Optional` checkoutLanguage

• **checkoutLanguage**? : *[AmazonPayV2CheckoutLanguage](../enums/amazonpayv2checkoutlanguage.md)*

Language used to render the button and text on Amazon Pay hosted pages.

___

###  createCheckoutSession

• **createCheckoutSession**: *[AmazonPayV2CheckoutSession](amazonpayv2checkoutsession.md)*

Configuration for calling the endpoint to Create Checkout Session.

___

###  ledgerCurrency

• **ledgerCurrency**: *[AmazonPayV2LedgerCurrency](../enums/amazonpayv2ledgercurrency.md)*

Ledger currency provided during registration for the given merchant identifier.

___

###  merchantId

• **merchantId**: *string*

Amazon Pay merchant account identifier.

___

###  placement

• **placement**: *[AmazonPayV2Placement](../enums/amazonpayv2placement.md)*

Placement of the Amazon Pay button on your website.

___

### `Optional` productType

• **productType**? : *[AmazonPayV2PayOptions](../enums/amazonpayv2payoptions.md)*

Product type selected for checkout. Default is 'PayAndShip'.

___

### `Optional` sandbox

• **sandbox**? : *undefined | false | true*

Sets button to Sandbox environment. Default is false.
