export interface MollieClient {
    createComponent(type: string, options?: object): MollieElement;
    createToken(): Promise<MollieToken>;
}

export interface MollieToken {
    token: string;
    error: object;
}

export interface MollieConfigurationOptions {
    locale: string;
    testmode: boolean;
}

export interface MollieHostWindow extends Window {
    Mollie(
        publishableKey: string,
        options: MollieConfigurationOptions
    ): MollieClient;
}

export interface MollieElement {
    /**
     * The `element.mount` method attaches your element to the DOM.
     */
    mount(domElement: string | HTMLElement): void;

    /**
     * Unmounts the element from the DOM.
     * Call `element.mount` to re-attach it to the DOM.
     */
    unmount(): void;

    /**
     * Components can listen to several events.
     * The callback receives an object with all the related information.
     * blur | focus | change
     */
    addEventListener(event: 'blur' | 'focus' | 'change', callback: () => void): void;
}
