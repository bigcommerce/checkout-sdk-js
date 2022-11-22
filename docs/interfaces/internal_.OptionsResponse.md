[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / OptionsResponse

# Interface: OptionsResponse

[<internal>](../modules/internal_.md).OptionsResponse

When creating your Drop-in instance, you can specify options to trigger different features or functionality.
https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#drop-in-options

## Table of contents

### Properties

- [button](internal_.OptionsResponse.md#button)
- [flow](internal_.OptionsResponse.md#flow)
- [paymentMethodConfiguration](internal_.OptionsResponse.md#paymentmethodconfiguration)
- [showComplianceSection](internal_.OptionsResponse.md#showcompliancesection)
- [showSavePaymentAgreement](internal_.OptionsResponse.md#showsavepaymentagreement)
- [showTermsOfSaleDisclosure](internal_.OptionsResponse.md#showtermsofsaledisclosure)
- [usage](internal_.OptionsResponse.md#usage)

## Properties

### button

• `Optional` **button**: [`ButtonResponse`](internal_.ButtonResponse.md)

Use this option to customize the text of the Drop-in button.

___

### flow

• `Optional` **flow**: `string`

Use this option if you are using Drop-in within a standard checkout flow. Example Value: "checkout"

___

### paymentMethodConfiguration

• `Optional` **paymentMethodConfiguration**: [`BaseElementOptions`](internal_.BaseElementOptions.md)

Additional configuration details for drop-in.

___

### showComplianceSection

• `Optional` **showComplianceSection**: `boolean`

Will show a localized compliance link section as part of Drop-in. This is an important piece for accessing the Digital River business model.

___

### showSavePaymentAgreement

• `Optional` **showSavePaymentAgreement**: `boolean`

When enabled, presents the customer with an option to save their payment details for future use within Drop-in.
Enabling this feature will show the appropriate check boxes and localized disclosure statements and facilitate
any necessary Strong Customer Authentication.
If disabled, Drop-in will not present the customer with an option to save their payment details.

___

### showTermsOfSaleDisclosure

• `Optional` **showTermsOfSaleDisclosure**: `boolean`

Use this option to show the required terms of sale disclosure. These localized terms automatically update if recurring products are purchased.

___

### usage

• `Optional` **usage**: `string`

Use this option to specify the future use of a source.
