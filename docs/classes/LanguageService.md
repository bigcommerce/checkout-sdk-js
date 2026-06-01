[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / LanguageService

# Class: LanguageService

Responsible for getting language strings.

This object can be used to retrieve language strings that are most
appropriate for a given locale.

The language strings provided to the object should follow [ICU
MessageFormat](http://userguide.icu-project.org/formatparse/messages) syntax.

## Constructors

### Constructor

> **new LanguageService**(): `LanguageService`

#### Returns

`LanguageService`

## Methods

### getLocale()

> **getLocale**(): `string`

Gets the preferred locale of the current customer.

#### Returns

`string`

The preferred locale code.

***

### mapKeys()

> **mapKeys**(`maps`): `void`

Remaps a set of language strings with a different set of keys.

```js
service.mapKeys({
    'new_key': 'existing_key',
});

console.log(service.translate('new_key'));
```

#### Parameters

##### maps

The set of language strings.

#### Returns

`void`

***

### translate()

> **translate**(`key`, `data?`): `string`

Gets a language string by a key.

```js
service.translate('language_key');
```

If the language string contains a placeholder, you can replace it by
providing a second argument.

```js
service.translate('language_key', { placeholder: 'Hello' });
```

#### Parameters

##### key

`string`

The language key.

##### data?

[`TranslationData`](../interfaces/TranslationData.md)

Data for replacing placeholders in the language string.

#### Returns

`string`

The translated language string.
