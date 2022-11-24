[@bigcommerce/checkout-sdk](../README.md) / BlueSnapV2PaymentInitializeOptions

# Interface: BlueSnapV2PaymentInitializeOptions

A set of options that are required to initialize the BlueSnap V2 payment
method.

The payment step is done through a web page via an iframe provided by the
strategy.

```html
<!-- This is where the BlueSnap iframe will be inserted. It can be an in-page container or a modal -->
<div id="container"></div>

<!-- This is a cancellation button -->
<button type="button" id="cancel-button"></button>
```

```js
service.initializePayment({
    methodId: 'bluesnapv2',
    bluesnapv2: {
        onLoad: (iframe) => {
            document.getElementById('container')
                .appendChild(iframe);

            document.getElementById('cancel-button')
                .addEventListener('click', () => {
                    document.getElementById('container').innerHTML = '';
                });
        },
    },
});
```

## Table of contents

### Properties

- [style](BlueSnapV2PaymentInitializeOptions.md#style)

### Methods

- [onLoad](BlueSnapV2PaymentInitializeOptions.md#onload)

## Properties

### style

• `Optional` **style**: [`BlueSnapV2StyleProps`](BlueSnapV2StyleProps.md)

A set of CSS properties to apply to the iframe.

## Methods

### onLoad

▸ **onLoad**(`iframe`, `cancel`): `void`

A callback that gets called when the iframe is ready to be added to the
current page. It is responsible for determining where the iframe should
be inserted in the DOM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iframe` | `HTMLIFrameElement` | The iframe element containing the payment web page provided by the strategy. |
| `cancel` | () => `void` | A function, when called, will cancel the payment process and remove the iframe. |

#### Returns

`void`
