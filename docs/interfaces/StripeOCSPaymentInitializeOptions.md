[@bigcommerce/checkout-sdk](../README.md) / StripeOCSPaymentInitializeOptions

# Interface: StripeOCSPaymentInitializeOptions

A set of options that are required to initialize the Stripe payment method.

Once Stripe payment is initialized, credit card form fields, provided by the
payment provider as iframes, will be inserted into the current page. These
options provide a location and styling for each of the form fields.

```html
<!-- This is where the credit card component will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    gateway: 'stripeocs',
    id: 'optimized_checkout',
    stripeocs {
        containerId: 'container',
    },
});
```

## Hierarchy

- `default`

  ↳ **`StripeOCSPaymentInitializeOptions`**

## Table of contents

### Properties

- [appearance](StripeOCSPaymentInitializeOptions.md#appearance)
- [containerId](StripeOCSPaymentInitializeOptions.md#containerid)
- [fonts](StripeOCSPaymentInitializeOptions.md#fonts)
- [layout](StripeOCSPaymentInitializeOptions.md#layout)
- [style](StripeOCSPaymentInitializeOptions.md#style)

### Methods

- [handleClosePaymentMethod](StripeOCSPaymentInitializeOptions.md#handleclosepaymentmethod)
- [onError](StripeOCSPaymentInitializeOptions.md#onerror)
- [paymentMethodSelect](StripeOCSPaymentInitializeOptions.md#paymentmethodselect)
- [render](StripeOCSPaymentInitializeOptions.md#render)
- [togglePreloader](StripeOCSPaymentInitializeOptions.md#togglepreloader)

## Properties

### appearance

• `Optional` **appearance**: `StripeAppearanceOptions`

Stripe OCS appearance options for styling the accordion.

___

### containerId

• **containerId**: `string`

The location to insert the credit card number form field.

#### Overrides

StripePaymentInitializeOptions.containerId

___

### fonts

• `Optional` **fonts**: `StripeCustomFont`[]

Stripe OCS fonts options for styling the accordion.

___

### layout

• `Optional` **layout**: `Record`<`string`, `string` \| `number` \| `boolean`\>

Stripe OCS layout options

___

### style

• `Optional` **style**: `Record`<`string`, `StripeAppearanceValues`\>

Checkout styles from store theme

#### Overrides

StripePaymentInitializeOptions.style

## Methods

### handleClosePaymentMethod

▸ `Optional` **handleClosePaymentMethod**(`collapseElement`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `collapseElement` | () => `void` |

#### Returns

`void`

___

### onError

▸ `Optional` **onError**(`error?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `error?` | `Error` |

#### Returns

`void`

#### Overrides

StripePaymentInitializeOptions.onError

___

### paymentMethodSelect

▸ `Optional` **paymentMethodSelect**(`id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`void`

___

### render

▸ **render**(): `void`

#### Returns

`void`

#### Overrides

StripePaymentInitializeOptions.render

___

### togglePreloader

▸ `Optional` **togglePreloader**(`showLoader`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `showLoader` | `boolean` |

#### Returns

`void`
