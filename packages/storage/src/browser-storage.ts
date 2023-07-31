import LocalStorage from 'local-storage-fallback';

export default class BrowserStorage {
    constructor(private namespace: string) {}

    getItem<TValue = unknown>(key: string): TValue | null {
        const rawValue = LocalStorage.getItem(this.withNamespace(key));

        if (rawValue === null) {
            return null;
        }

        try {
            return JSON.parse(rawValue);
        } catch (error) {
            this.removeItem(this.withNamespace(key));

            return null;
        }
    }

    getItemOnce<TValue = unknown>(key: string): TValue | null {
        const value = this.getItem<TValue>(key);

        this.removeItem(key);

        return value;
    }

    setItem<TValue = unknown>(key: string, value: TValue): void {
        return LocalStorage.setItem(this.withNamespace(key), JSON.stringify(value));
    }

    removeItem(key: string): void {
        return LocalStorage.removeItem(this.withNamespace(key));
    }

    private withNamespace(key: string): string {
        return `${this.namespace}.${key}`;
    }
}
