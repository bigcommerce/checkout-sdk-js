export interface SignInEmail {
    sent_email: string;
    expiry: number;
}

export interface SignInEmailRequestBody {
    email: string;
    redirectUrl?: string;
}
