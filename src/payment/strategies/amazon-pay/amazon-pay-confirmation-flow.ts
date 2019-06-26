export default interface AmazonPayConfirmationFlow {
    success(): () => void;
    error(): () => void;
}
