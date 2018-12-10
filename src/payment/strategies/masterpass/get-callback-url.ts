export default function getCallbackUrl(origin: string): string {
    return `${window.location.origin}/checkout.php?action=set_external_checkout&provider=masterpass&gateway=stripe&origin=${origin}`;
}
