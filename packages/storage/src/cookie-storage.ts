interface CookieOptions {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
}

export default class CookieStorage {
    static get(name: string): string | null {
        const cookieValue = `${encodeURIComponent(`${name}`)}=`;
        const cookie = document.cookie;

        let value = null;

        const firstIndex = cookie.indexOf(cookieValue);

        if (firstIndex > -1) {
            let lastIndex = cookie.indexOf(';', firstIndex);

            if (lastIndex === -1) {
                lastIndex = cookie.length;
            }

            value = decodeURIComponent(
                cookie.substring(firstIndex + cookieValue.length, lastIndex),
            );
        }

        return value;
    }

    static set(name: string, value: string, options: CookieOptions = { secure: true }) {
        let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        const { expires, path, domain, secure } = options;

        if (expires) {
            cookieText += `; expires=${expires.toUTCString()}`;
        }

        if (path) {
            cookieText += `; path=${path}`;
        }

        if (domain) {
            cookieText += `; domain=${domain}`;
        }

        if (secure) {
            cookieText += '; secure';
        }

        document.cookie = cookieText;
    }

    static remove(name: string, options?: CookieOptions) {
        CookieStorage.set(name, '', { expires: new Date(0), ...options });
    }
}
