export default function getPaymentId(): { providerId: string; gatewayId?: string } {
    return {
        providerId: 'foo',
        gatewayId: 'bar',
    };
}
