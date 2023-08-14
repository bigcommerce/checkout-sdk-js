# @bigcommerce/checkout-sdk/storage

Checkout SDK Storage package contains tools implementation for storing data in browser storage like Local Storage (session storage and cookies implementation might be added in the future).

## Table of contents
- [Features](#features)
- [How to use package](#how-to-use-package)
    - [Using Braintree Utils package](#using-braintree-utils-package)

- [Development commands](#development-commands)
    - [Running unit tests](#running-unit-tests)
    - [Running lint](#running-lint)
- [License](#license)


## Features

The braintree-utils package provides sharable braintree implementation that can be useful in other integration packages like Google Pay, Apple Pay, or etc., for example:
* get braintree sdk version;


## How to use package

### Using Braintree utils package

You can use Braintree utils implementation inside your integration package. Import that what you need from braintree-utils package:

```sh
import { BRAINTREE_SDK_STABLE_VERSION } from '@bigcommerce/checkout-sdk/braintree-utils';

someOtherPackage.setBraintreeSdkVersion(BRAINTREE_SDK_STABLE_VERSION);
```


## Development commands

### Running unit tests

Run `nx test braintree-utils` to execute the unit tests via [Jest](https://jestjs.io).

### Running lint

Run `nx lint braintree-utils` to execute the lint via [ESLint](https://eslint.org/).


## License

MIT

