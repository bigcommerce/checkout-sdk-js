[@bigcommerce/checkout-sdk](../README.md) › [DigitalRiverElementClasses](digitalriverelementclasses.md)

# Interface: DigitalRiverElementClasses

Custom classes
You can specify custom classes as part of a Class object included within the Options object when you create or
update an element. If you do not provide custom classes, the system uses the default options.
https://docs.digitalriver.com/digital-river-api/payment-integrations-1/digitalriver.js/reference/elements#custom-classes

## Hierarchy

* **DigitalRiverElementClasses**

## Index

### Properties

* [base](digitalriverelementclasses.md#optional-base)
* [complete](digitalriverelementclasses.md#optional-complete)
* [empty](digitalriverelementclasses.md#optional-empty)
* [focus](digitalriverelementclasses.md#optional-focus)
* [invalid](digitalriverelementclasses.md#optional-invalid)
* [webkitAutofill](digitalriverelementclasses.md#optional-webkitautofill)

## Properties

### `Optional` base

• **base**? : *undefined | string*

The Element is in its base state. The user either has not entered anything into the input field or is currently typing.

___

### `Optional` complete

• **complete**? : *undefined | string*

The Element is in its complete state. The user has input value, and it meets the basic validation requirements of that field.

___

### `Optional` empty

• **empty**? : *undefined | string*

The Element is empty. The Element once had value but is now empty.

___

### `Optional` focus

• **focus**? : *undefined | string*

The Element has focus.

___

### `Optional` invalid

• **invalid**? : *undefined | string*

The Element has value, but it does not meet the basic validation requirements of the field.

___

### `Optional` webkitAutofill

• **webkitAutofill**? : *undefined | string*

The element has a value that has been automatically filled by the browser.
