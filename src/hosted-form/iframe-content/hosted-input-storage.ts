import { BrowserStorage } from '../../common/storage';

export default class HostedInputStorage {
    constructor(
        private _storage: BrowserStorage
    ) {}

    setNonce(nonce: string): void {
        this._storage.setItem('nonce', nonce);
    }

    getNonce(): string | null {
        return this._storage.getItem('nonce');
    }
}
