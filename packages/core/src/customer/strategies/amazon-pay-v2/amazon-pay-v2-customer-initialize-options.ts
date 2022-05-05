/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, they will be redirected to Amazon to
 * sign in.
 */
export default interface AmazonPayV2CustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
}
