import HostedInputStorage from './hosted-input-storage';

let storage: HostedInputStorage | null;

export default function getHostedInputStorage(): HostedInputStorage {
    storage = storage || new HostedInputStorage();

    return storage;
}
