# fortis-integration

This package contains the integration layer for the Fortis provider.
There you can find all implemented strategies, interfaces etc for this payment provider.

## Fortis Documentation
[Fortis overview](https://docs.fortis.tech/v/1_0_0.html#/rest/quick-start-guide/overview)

## Running unit tests

Run `npx nx run fortis-integration:test`
This will run all existing unit test for this package
Or run for single file: `npx nx run fortis-integration:test --testFile="fortis-integration.service.spec.ts"`

## Running lint

Run `npx nx run lint fortis-integration` to execute the lint via [ESLint](https://eslint.org/).
