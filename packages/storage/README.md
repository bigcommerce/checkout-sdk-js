# @bigcommerce/checkout-sdk/storage

Checkout SDK Storage package contains tools implementation for storing data in browser storage like Local Storage (session storage and cookies implementation might be added in the future).

## Table of contents
- [Features](#features)
- [How to use package](#how-to-use-package)
  - [Using Browser storage](#using-browser-storage)

- [Development commands](#development-commands)
    - [Running unit tests](#running-unit-tests)
    - [Running lint](#running-lint)
- [License](#license)


## Features

The storage package provides tools that might be useful to for storing data in LocalStorage, for example:
* Save some data to use it after customers reloads the page


## How to use package

### Using Browser storage

You can use BrowserStorage implementation inside your integration package. Import BrowserStorage from storage package:

```sh
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

const browserStorage = new BrowserStorage('namespace');

browserStorage.setItem('hello', 'world'); 
browserStorage.getItem('hello');
```

`BrowserStorage` contains different useful method:
* `getItem(key)` is to get an item from the local storage
* `getItemOnce(key)` is a method that returns an item and removes it from local storage
* `setItem(key, value)` is a method that saves the item to the local storage
* `removeItem(key)` is a method that removes the item from local storage



## Development commands

### Running unit tests

Run `nx test storage` to execute the unit tests via [Jest](https://jestjs.io).

### Running lint

Run `nx lint storage` to execute the lint via [ESLint](https://eslint.org/).


## License

MIT

