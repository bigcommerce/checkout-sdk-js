export default interface Promotion {
    banners: Banner[];
}

export interface Banner {
    type: string;
    text: string;
}
