# Contribution Guide


## Table of contents <!-- omit in toc -->
- [Project overview](#project-overview)
    - [Structure](#structure)
    - [Dependencies](#dependencies)
    - [State management](#state-management)
        - [Actions](#actions)
        - [Reducers](#reducers)
        - [Selectors](#selectors)
    - [Strategies](#strategies)
    - [Errors](#errors)
    - [Tests](#tests)
- [Submit changes](#submit-changes)
    - [Coding guideline](#coding-guideline)
    - [Commit guideline](#commit-guideline)
    - [Developer commands](#developer-commands)
    - [System requirement](#system-requirement)
- [Submit issues](#submit-issues)
- [Release version](#release-version)


## Project overview

### Structure
The entry point of the library is `src/index`, which exposes all the public modules that can be imported by an external consumer. Internal modules are not exported, therefore you cannot import them externally and can only be used internally. We have a special compilation step that puts the restriction in place. Our intention is to hide internal implementation details from the external consumers. This way we can refactor the code with confidence in the future. We will not accept any pull requests that expose internal details.

Internal modules are usually grouped by their respective domain areas, i.e.: `cart`, `checkout`, `order` etc... Modules that are not domain specific are placed in `common` folder. The folder might also contain modules that you intend to extract out into separate repositories later on. For example, `common/utility` folder contains a set of helper functions that work with generic data types and are not specific to a domain area. The grouping is designed specifically to help us navigate the project directory and locate files quickly.

Every top level module should have an `index` file that re-exports all functions and classes that can be imported in a different module. It allows us to better control the internal visibility of submodules, and allows us to import them succinctly. i.e.:

```ts
// order/index.ts
export { default as Order } from './order';
export { default as OrderActionCreator } from './order-action-creator';
```

```ts
// checkout/index.ts
import { Order, OrderActionCreator } from '../order';
```

### Dependencies
Always inject dependencies if they create side effects (i.e.: making a network call) so they can be mocked out easily. Also, consider injecting dependencies if you want to decouple the objects so that they depend on interfaces rather than concrete implementations. You can inject dependencies via constructor or method parameters. For classes that are difficult to construct, you might choose to write a factory function to simplify the construction process. i.e.:

```ts
// checkout/create-checkout-service.ts

export default function createCheckoutService(): CheckoutService {
    const requestSender = createRequestSender();

    return new CheckoutService(
        createCheckoutStore(),
        new CheckoutActionCreator(new CheckoutRequestSender(requestSender)),
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        // Other dependencies
    );
}
```

### State management
We retain the current state in memory because we want to provide synchronous access to it once it is loaded from the remote server. Internally, we use the data to perform certain actions. For example, certain payment integrations require additional information to function. We can provide these information behind the scene without having to ask the consumer of the library to provide. Furthermore, with access to the current state, we can watch for any changes and notifies the consumer to perform corresponding changes.

#### Actions
All asynchronous operations are implemented as observable actions. An action represents the intent of a user, for example, submitting an order. It is observable, meaning you can subscribe to it and get notified when there are events of interest. When actions are dispatched, they are placed in a queue and get executed sequentially. If there are actions that are independent from each other, they can be dispatched in separate queues and be executed concurrently. The emitted values get processed by a set of transformation functions, called the reducers, before they get retained in a central location - the [data store](https://github.com/bigcommerce/data-store-js).

There are several benefits with this approach.
* The sequential execution queue minimises the likelihood of encountering race conditions. If asynchronous calls are not coordinated, their completion callbacks might not be called in the same order as when they are executed.
* The portable nature of actions means that they can be passed around like regular objects. They are not executed until they are dispatched. This means you can easily compose various actions in order to carry out more complicated tasks.
* There is a clear separation between the actions that get executed and the data that gets retained. The separation of read and write operations simplifies the management of a complex data tree.
* All changes are subscribable in a central location. This is particularly important for a library designed for UI development, as you often need to present the latest changes to the user.

There are three types of actions:
1. **Basic actions** - They are plain objects for carrying data. They have the following properties.
    * `type`: The identifier of the action.
    * `payload`: The primary data to be transferred.
    * `meta`: The secondary data to be transferred.
    * `error`: A flag indicating if the action represents a failure.
2. **Observable actions** - They encapsulate asynchronous operations. They emit basic actions whenever there are events of interest. Once they are created, they are inactive until they are dispatched.
3. **Thunk actions** - They are functions responsible for creating observable actions that depend on the current state. Inside the function, you have access to the data store, which you can use to retrieve the current state and create further actions.

When actions are dispatched, they can be intercepted and transformed before they reach the reducers. For example, we have a transformer, `RequestErrorTransformer`, that intercepts all error actions and appends additional meta information to them.

#### Reducers
The root reducer is responsible for transforming the entire state tree. It is formed by combining multiple smaller reducers, i.e.: `cartReducer`, `consignmentReducer` etc... This approach allows us to break down the large state tree into smaller, more manageable chunks. Every reducer has the following signature.

```ts
export default function cartReducer(state: CartState, action: CartAction): CartState {}
```

A reducer is a pure function, meaning it does not create side effects or mutates the original state object. If there is a relevant action, it returns a new state object for the data store to retain. Typically, a sub-reducer has the following properties.
* `data`: The primary data to retain.
* `meta`: The secondary data to retain.
* `statuses`: Flags indicating if certain actions are in progress.
* `errors`: Errors if certain actions have failed.

Not only do we retain the result of an action, we also keep track of its statuses and possible errors. This way, the UI can subscribe to these changes and reflect them in the view.

#### Selectors
You can access the state of the data store synchronously via selectors. Selectors are objects responsible for retrieving or deriving data from multiple sources. They act as access points to the underlying state tree. They only return new objects if the return values are different to the previous values. This is so that UI can determine whether to re-render by doing a simple equality check against the new values. Their returned values are immutable. In fact, they are frozen in development mode unless specified otherwise. We want to discourage external consumers from directly mutating the internal state of the library, which can lead to unexpected behaviours.

When actions are dispatched, they get processed by reducers and eventually reach to the data store and be retained. Reducers are responsible for controlling what and where the information should be retained. When there is a change in the state, all subscribers get notified and receive the latest state.


### Strategies
Different payment methods might have unique integration requirements. They are encapsulated as payment strategies. `PaymentStrategyRegistry` is responsible for registering and retrieving these strategies. i.e.:

```ts
const registry = new PaymentStrategyRegistry();

registry.register('creditcard', () =>
    new CreditCardPaymentStrategy()
);
```

Some of the payment methods have additional capabilities, such as providing shipping and customer information. They are encapsulated as shipping and customer strategies respectively. This pattern allows us to execute a different procedure based on the integration requirement of a payment method in runtime.

### Errors
Specific error objects get thrown when there are identifiable issues. For example, if an error occurred because the required data is missing, you will get a `MissingDataError`. You can catch and inspect `type` property to decide how to handle them. When in development mode, error objects also include additional error messages to help developers debug issues. We do not append debug messages in production because we want to avoid surfacing developer-facing messages to the end-users.

### Tests
We recommend you to mock out the collaborators of your test subject if they are external dependencies, produce non-repeatable results or induce any kind of side effects. In the test, you verify whether or not certain collaborators are interacted with in the expected manner. The downside to this style of testing is that your tests tend to couple with implementation details, therefore might need to be updated if the implementation changes. In certain cases, it might be more useful to write tests that verify the actual result of using the test subject instead.

We use [Jest](https://github.com/facebook/jest) as our test runner. It is a powerful tool that has many magical features, i.e.: snapshot testing and automatic mocking. However, sometimes, overusing or misusing these features might make your tests less manageable. For example, if you use a snapshot to test whether the return value of a function matches your expectation, you forgo the opportunity to communicate the actual expected value in your test body. Therefore, our recommendation is to use these features sparingly at your own discretion.


## Submit changes
To submit changes as a [pull request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/), first you have to fork the repository. Then you have to create a branch and commit your changes to it. Finally, you can submit a pull request from that branch against the master branch of the canonical repository. The master branch should always be stable, meaning it should be in a functional state. If there is a feature that requires multiple PRs to complete and might put the master branch in an unstable state, you should commit to a feature branch instead.

Your code should follow our [coding guideline](#coding-guideline). Your commit messages also need to follow our [guideline](#commit-guideline). All changes must have some unit test coverage and should never lower the overall coverage of the project. Every PR gets verified automatically on Travis. Before they can be merged to the master branch, they must be reviewed and approved by one of the project maintainers. You can ask people to review your PR by requesting individual members or pinging the entire team using `@bigcommerce/checkout` handle.

### Coding guideline
We have enabled a set of [linting rules](https://github.com/bigcommerce/tslint-config) to help us maintain the stylistic consistency of our code. Visit [TSLint](https://palantir.github.io/tslint/rules/) for more information about the enabled rules. It is important to enforce these rules automatically because contributions from different people might vary in style. Nonetheless, there might be a few issues that cannot be caught programmatically because there are no existing rules. Usually these errors will be caught during the code review process. We usually use :tropical_drink: or :beer: in those comments, to indicate that they are stylistic issues only.

### Commit guideline
You should keep your commit messages clear and concise. More importantly, the commits themselves should have a clear focus. Otherwise, it can be difficult for us to examine the commit history if we ever need to investigate for the source of a bug.

We follow a specific format when writing commit messages. The format has annotations that allow us to generate the changelog automatically. i.e.:

```
fix(order): JIRA-1234 Fix order submission method not sending required payment details 
```

Since community contributors do not have access to JIRA, they can use a Github issue number instead. For more information about the format, visit [@bigcommerce/validate-commits](https://github.com/bigcommerce/validate-commits). We recommend you to double check your commit messages before submitting your PR, making sure they do not have any mistakes.

### Developer commands
We have a list of commands that contributors can use while developing.
* `npm run test` - Run all the tests at once.
* `npm run test:watch` - Run the tests in watch mode. Press `w` for more options.
* `npm run test:coverage` - Run the tests and generate a coverage report.
* `npm run lint` - Lint the source code.
* `npm run docs` - Updates the documentation.
* `npm run release` - Release a new version to npm. This command does the following: it runs all the tests, compiles the code, creates a new tag, updates the changelog and documentation, and finally pushes the latest changes to Github and publishes the bundle to NPM.

### System requirement
Please ensure you have the following software installed.
* NodeJS `>=6`
* NPM `>=6`


## Submit issues
Create a Github issue if you find a bug in the source code or if you want to request a new feature. The maintainers of the project will review and triage the issue accordingly. If we decide to take on a task, we will raise a corresponding JIRA ticket to help us track the issue internally.

Please do not raise a Github issue if you just need general support or advice on how to use the library. Instead, submit your questions on StackOverflow. We actively watch that space and will answer your questions when possible.


## Release version
Everytime a PR is merged to the master branch, CircleCI will trigger a build automatically. However, it won't create a new Git release until it is approved by a person with write access to the repository. If you have write access, you can approve a release job by going to [CircleCI](https://circleci.com/gh/bigcommerce/workflows/checkout-sdk-js/tree/master) and look for the job you wish to approve. You can also navigate directly to the release job by clicking on the yellow dot next to the merged commit.

We follow semantic versioning convention when making releases. This means breaking changes can only be introduced in a major version. When we release a new version, we use a tool to automatically determine the version number based on the commit messages made since the last release. This way we can minimise the likelihood of making a mistake. If there is a special reason to override the version, you can do so by running the release command manually and using the `--release-as` flag to specify the version you want.
