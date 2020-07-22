[@bigcommerce/checkout-sdk](../README.md) › [StripeElementStyle](stripeelementstyle.md)

# Interface: StripeElementStyle

Customize the appearance of an element using CSS properties passed in a `Style` object,
which consists of CSS properties nested under objects for each variant.

## Hierarchy

* **StripeElementStyle**

## Index

### Properties

* [base](stripeelementstyle.md#optional-base)
* [complete](stripeelementstyle.md#optional-complete)
* [empty](stripeelementstyle.md#optional-empty)
* [invalid](stripeelementstyle.md#optional-invalid)

## Properties

### `Optional` base

• **base**? : *[StripeElementStyleVariant](stripeelementstylevariant.md)*

Base variant—all other variants inherit from these styles.

___

### `Optional` complete

• **complete**? : *[StripeElementStyleVariant](stripeelementstylevariant.md)*

Applied when the element has valid input.

___

### `Optional` empty

• **empty**? : *[StripeElementStyleVariant](stripeelementstylevariant.md)*

Applied when the element has no customer input.

___

### `Optional` invalid

• **invalid**? : *[StripeElementStyleVariant](stripeelementstylevariant.md)*

Applied when the element has invalid input.
