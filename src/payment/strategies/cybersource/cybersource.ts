export interface CyberSourceCardinal {
    load(): void;
}

export interface CardinalWindow extends Window {
    Cardinal?: CyberSourceCardinal;
}
