/**
 * A set of options that are required to initialize the customer step of
 * checkout to support Bolt.
 */
export default interface BoltCustomerInitializeOptions {
    /**
     * A callback that gets called on initialize the strategy
     *
     * @param hasBoltAccount - The hasBoltAccount variable handle the result of checking user account availability on Bolt.
     */
    onInit?(hasBoltAccount: boolean): void;
}
