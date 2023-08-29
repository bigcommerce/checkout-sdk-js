[@bigcommerce/checkout-sdk](../README.md) / DigitalRiverElementClasses

# Interface: DigitalRiverElementClasses

Custom classes
You can specify custom classes as part of a Class object included within the Options object when you create or
update an element. If you do not provide custom classes, the system uses the default options.
https://docs.digitalriver.com/digital-river-api/payment-integrations-1/digitalriver.js/reference/elements#custom-classes

## Table of contents

### Properties

- [base](DigitalRiverElementClasses.md#base)
- [complete](DigitalRiverElementClasses.md#complete)
- [empty](DigitalRiverElementClasses.md#empty)
- [focus](DigitalRiverElementClasses.md#focus)
- [invalid](DigitalRiverElementClasses.md#invalid)
- [webkitAutofill](DigitalRiverElementClasses.md#webkitautofill)

## Properties

### base

• `Optional` **base**: `string`

The Element is in its base state. The user either has not entered anything into the input field or is currently typing.

___

### complete

• `Optional` **complete**: `string`

The Element is in its complete state. The user has input value, and it meets the basic validation requirements of that field.

___

### empty

• `Optional` **empty**: `string`

The Element is empty. The Element once had value but is now empty.

___

### focus

• `Optional` **focus**: `string`

The Element has focus.

___

### invalid

• `Optional` **invalid**: `string`

The Element has value, but it does not meet the basic validation requirements of the field.

___

### webkitAutofill

• `Optional` **webkitAutofill**: `string`

The element has a value that has been automatically filled by the browser.
