export default interface InternalIncompleteOrder {
    orderId: number;
    token: string;
    payment: {
        id: string;
        redirectUrl: string;
        returnUrl: string;
        status: string;
        helpText: string;
    };
    socialData: {
        [key: string]: {
            name: string;
            description: string;
            image: string;
            url: string;
            shareText: string;
            sharingLink: string;
        },
    };
    status: string;
    customerCreated: boolean;
    hasDigitalItems: boolean;
    isDownloadable: boolean;
    isComplete: boolean;
    callbackUrl: string;
}
