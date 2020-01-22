type HostedInputStyles = Partial<Pick<
    CSSStyleDeclaration,
    'color' |
    'fontFamily' |
    'fontSize' |
    'fontWeight'
>>;

export default HostedInputStyles;

export interface HostedInputStylesMap {
    default?: HostedInputStyles;
    error?: HostedInputStyles;
    focus?: HostedInputStyles;
}
