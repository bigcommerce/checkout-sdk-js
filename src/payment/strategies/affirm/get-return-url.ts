export default function getReturnURL(): string {
    return `${window.location.origin}/checkout.php?action=set_external_checkout&provider=affirm`;
}