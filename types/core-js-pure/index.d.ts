declare var URLClass: {
    prototype: URL;
    new(url: string | URL, base?: string | URL): URL;
    createObjectURL(object: any): string;
    revokeObjectURL(url: string): void;
};

declare module 'core-js-pure/web/url' {
    const URL: URLClass;
    export = URL;
}
