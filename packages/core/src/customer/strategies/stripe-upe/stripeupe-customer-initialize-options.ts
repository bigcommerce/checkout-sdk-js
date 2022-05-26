export default interface StripeupeCustomerInitializeOptions {
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;

    /**
     * A callback that gets called whenever the Stripe Link Authentication Element's value changes.
     *
     * @param email - The new value of the email.
     */
    onEmailChange(email: string): void;
}
