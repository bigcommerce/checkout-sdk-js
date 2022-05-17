import { default as storage } from 'local-storage-fallback';

export default class BrowserStorage {
    constructor(
        private _namespace: string
    ) {}

    getItem<TValue = any>(key: string): TValue | null {
        const rawValue = storage.getItem(this.withNamespace(key));

        if (rawValue === null) {
            return null;
        }

        try {
            return JSON.parse(rawValue);
        } catch (error) {
            // Clean up invalid values
            this.removeItem(this.withNamespace(key));

            return null;
        }
    }

    getItemOnce<TValue = any>(key: string): TValue | null {
        const value = this.getItem(key);

        this.removeItem(key);

        return value;
    }

    setItem<TValue = any>(key: string, value: TValue): void {
        return storage.setItem(this.withNamespace(key), JSON.stringify(value));
    }

    removeItem(key: string): void {
        return storage.removeItem(this.withNamespace(key));
    }

    private withNamespace(key: string): string {
        return `${this._namespace}.${key}`;
    }
}
