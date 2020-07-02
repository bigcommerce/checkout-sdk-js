import { BrowserStorage } from '../../common/storage';

import HostedInputStorage from './hosted-input-storage';

const STORAGE_NAMESPACE = 'BigCommerce.HostedInput';

let storage: HostedInputStorage | null;

export default function getHostedInputStorage(): HostedInputStorage {
    storage = storage || new HostedInputStorage(
        new BrowserStorage(STORAGE_NAMESPACE)
    );

    return storage;
}
