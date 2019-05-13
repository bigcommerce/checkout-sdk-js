export interface StripeFormElement {
    /**
     * The ID of the container which the form element should insert into.
     */
    elementId: string;
}

export interface StripeFormOptions {
    inputStyles?: {
        base?: string[],
        invalid?: string[],
    };
    cardElement: StripeFormElement;
}
