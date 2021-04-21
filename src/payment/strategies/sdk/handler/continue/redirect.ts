export interface Redirect {
    type: 'continue';
    code: 'redirect';
    url: string;
    // Record type might not be accurate
    formFields: Record<string, string | number | boolean> | undefined;
}

export const isRedirect = (x: unknown): x is Redirect => {
    // some type checking
    return true;
};

export const handleRedirect = (redirect: Redirect): Promise<void> => {
    const action = redirect.formFields ? 'POST' : 'GET';

    // Perform redirect etc based on the action and payload etc
    window.location.assign(redirect.url);

    // Will never resolve, we've redirected away
    return new Promise<never>(() => {});
};
