export default class HostedInputStorage {
    private _nonce?: string;

    setNonce(nonce: string): void {
        this._nonce = nonce;
    }

    getNonce(): string | undefined {
        return this._nonce;
    }
}
