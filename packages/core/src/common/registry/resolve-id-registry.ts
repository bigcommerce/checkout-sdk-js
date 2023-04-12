import Factory from './factory';
import Registry from './registry';

export default class ResolveIdRegistry<TType, TToken extends { [key: string]: unknown }> {
    private _registry: Registry<TType>;

    constructor(private _useFallback = false) {
        this._registry = new Registry({
            tokenResolver: this._resolveToken.bind(this),
            useFallback: this._useFallback,
        });
    }

    get(resolveId: TToken): TType {
        return this._registry.get(this._encodeToken(resolveId));
    }

    register(resolveId: TToken, factory: Factory<TType>): void {
        this._registry.register(this._encodeToken(resolveId), factory);
    }

    private _encodeToken(resolveId: TToken): string {
        return btoa(JSON.stringify(resolveId));
    }

    private _decodeToken(token: string): TToken {
        return JSON.parse(atob(token));
    }

    private _resolveToken(token: string, registeredTokens: string[]): string | undefined {
        const query = this._decodeToken(token);

        const results: Array<{ token: string; matches: number; default: boolean }> = [];

        registeredTokens.forEach((registeredToken) => {
            const resolverId = this._decodeToken(registeredToken);

            const result = { token: registeredToken, matches: 0, default: false };

            for (const [key, value] of Object.entries(query)) {
                if (key in query && resolverId[key] !== value) {
                    result.matches = 0;
                    break;
                }

                if (key in query && resolverId[key] === value) {
                    result.matches++;
                }
            }

            if (resolverId.default) {
                result.default = true;
                results.push(result);
            }

            results.push(result);
        });

        const matched = results
            .sort((a, b) => b.matches - a.matches)
            .filter((result) => result.matches > 0)[0];

        if (matched && matched.token) {
            return matched.token;
        }

        if (this._useFallback) {
            const defaultToken = results.find((result) => result.default)?.token;

            if (defaultToken) {
                return defaultToken;
            }
        }

        throw new Error('Unable to resolve to a registered token with the provided token.');
    }
}
