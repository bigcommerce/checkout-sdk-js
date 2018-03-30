declare namespace amazon {
    class Login {
        static authorize(options: LoginOptions, redirectUrl: string): void;
        static setClientId(clientId: string): void;
        static setUseCookie(useCookie: boolean): void;
    }

    interface LoginOptions {
        popup: boolean;
        scope: string;
        state: string;
    }

    interface HostWindow extends Window {
        amazon?: {
            Login: Login,
        };
        onAmazonLoginReady?: () => void;
    }
}
