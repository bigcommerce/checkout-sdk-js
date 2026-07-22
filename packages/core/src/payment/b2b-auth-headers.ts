export interface B2BAuthTokens {
    b2bToken?: string;
    bcToken?: string;
}

export function getB2BAuthHeaders({ b2bToken, bcToken }: B2BAuthTokens): {
    authToken?: string;
    Authorization?: string;
} {
    if (b2bToken) {
        return { authToken: b2bToken, Authorization: `Bearer ${b2bToken}` };
    }

    if (bcToken) {
        return { authToken: bcToken };
    }

    return {};
}
