[@bigcommerce/checkout-sdk](../README.md) › [OptionsResponse](optionsresponse.md)

# Interface: OptionsResponse

When creating your Drop-in instance, you can specify options to trigger different features or functionality.
https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#drop-in-options

## Hierarchy

* **OptionsResponse**

## Index

### Properties

* [button](optionsresponse.md#optional-button)
* [flow](optionsresponse.md#optional-flow)
* [paymentMethodConfiguration](optionsresponse.md#optional-paymentmethodconfiguration)
* [showComplianceSection](optionsresponse.md#optional-showcompliancesection)
* [showSavePaymentAgreement](optionsresponse.md#optional-showsavepaymentagreement)
* [showTermsOfSaleDisclosure](optionsresponse.md#optional-showtermsofsaledisclosure)
* [usage](optionsresponse.md#optional-usage)

## Properties

### `Optional` button

• **button**? : *[ButtonResponse](buttonresponse.md)*

Use this option to customize the text of the Drop-in button.

___

### `Optional` flow

• **flow**? : *undefined | string*

Use this option if you are using Drop-in within a standard checkout flow. Example Value: "checkout"

___

### `Optional` paymentMethodConfiguration

• **paymentMethodConfiguration**? : *[BaseElementOptions](baseelementoptions.md)*

Additional configuration details for drop-in.

___

### `Optional` showComplianceSection

• **showComplianceSection**? : *undefined | false | true*

Will show a localized compliance link section as part of Drop-in. This is an important piece for accessing the Digital River business model.

___

### `Optional` showSavePaymentAgreement

• **showSavePaymentAgreement**? : *undefined | false | true*

When enabled, presents the customer with an option to save their payment details for future use within Drop-in.
Enabling this feature will show the appropriate check boxes and localized disclosure statements and facilitate
any necessary Strong Customer Authentication.
If disabled, Drop-in will not present the customer with an option to save their payment details.

___

### `Optional` showTermsOfSaleDisclosure

• **showTermsOfSaleDisclosure**? : *undefined | false | true*

Use this option to show the required terms of sale disclosure. These localized terms automatically update if recurring products are purchased.

___

### `Optional` usage

• **usage**? : *undefined | string*

Use this option to specify the future use of a source.
