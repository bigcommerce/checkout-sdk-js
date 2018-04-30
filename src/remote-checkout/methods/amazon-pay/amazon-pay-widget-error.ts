export default interface AmazonPayWidgetError extends Error {
    getErrorCode(): string;
}
