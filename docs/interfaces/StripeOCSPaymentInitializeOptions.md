[**@bigcommerce/checkout-sdk**](../README.md)

***

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

## Extends

- `default`

## Properties

### appearance?

> `optional` **appearance?**: `StripeAppearanceOptions`

Stripe OCS appearance options for styling the accordion.

***

### containerId

> **containerId**: `string`

The location to insert the credit card number form field.

#### Overrides

`StripePaymentInitializeOptions.containerId`

***

### currencySelectorContainerId?

> `optional` **currencySelectorContainerId?**: `string`

The location to insert the currency selector form field.

***

### fonts?

> `optional` **fonts?**: `StripeCustomFont`[]

Stripe OCS fonts options for styling the accordion.

***

### layout?

> `optional` **layout?**: `Record`\<`string`, `string` \| `number` \| `boolean`\>

Stripe OCS layout options

***

### style?

> `optional` **style?**: `Record`\<`string`, `StripeAppearanceValues`\>

Checkout styles from store theme

#### Overrides

`StripePaymentInitializeOptions.style`

## Methods

### handleClosePaymentMethod()?

> `optional` **handleClosePaymentMethod**(`collapseElement`): `void`

#### Parameters

##### collapseElement

() => `void`

#### Returns

`void`

***

### onError()?

> `optional` **onError**(`error?`): `void`

#### Parameters

##### error?

`Error`

#### Returns

`void`

#### Overrides

`StripePaymentInitializeOptions.onError`

***

### paymentMethodSelect()?

> `optional` **paymentMethodSelect**(`id`): `void`

#### Parameters

##### id

`string`

#### Returns

`void`

***

### render()

> **render**(): `void`

#### Returns

`void`

#### Overrides

`StripePaymentInitializeOptions.render`

***

### togglePreloader()?

> `optional` **togglePreloader**(`showLoader`): `void`

#### Parameters

##### showLoader

`boolean`

#### Returns

`void`
