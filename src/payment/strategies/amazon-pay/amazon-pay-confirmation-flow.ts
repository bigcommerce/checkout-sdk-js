export default interface AmazonPayConfirmationFlow {
    success(): () => void;
    failure(): () => void;
}
