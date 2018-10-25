export default interface EmbeddedCheckoutStyles {
    // Base
    body?: BodyStyles;
    text?: InlineElementStyles;
    heading?: BlockElementStyles;
    secondaryHeading?: BlockElementStyles;
    link?: LinkStyles;
    secondaryText?: InlineElementStyles;

    // Form
    button?: ButtonStyles;
    secondaryButton?: ButtonStyles;
    input?: TextInputStyles;
    select?: InputStyles;
    radio?: CheckableInputStyles;
    checkbox?: CheckableInputStyles;
    label?: LabelStyles;

    // Components
    checklist?: ChecklistStyles;
    discountBanner?: BlockElementStyles;
    loadingBanner?: BlockElementStyles;
    loadingIndicator?: LoadingIndicatorStyles;
    orderSummary?: BlockElementStyles;
    step?: StepStyles;
}

export interface InlineElementStyles {
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
}

export interface BlockElementStyles extends InlineElementStyles {
    backgroundColor?: string;
    boxShadow?: string;
    borderColor?: string;
    borderWidth?: string;
}

export interface BodyStyles {
    backgroundColor?: string;
}

export interface LinkStyles extends InlineElementStyles {
    active?: InlineElementStyles;
    focus?: InlineElementStyles;
    hover?: InlineElementStyles;
}

export interface ButtonStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

export interface InputStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    error?: InputStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

export interface TextInputStyles extends InputStyles {
    placeholder?: InlineElementStyles;
}

export interface CheckableInputStyles extends InputStyles {
    error?: InputStyles;
    checked?: BlockElementStyles;
}

export interface LabelStyles extends InlineElementStyles {
    error?: InlineElementStyles;
}

export interface ChecklistStyles extends BlockElementStyles {
    hover?: BlockElementStyles;
    checked?: BlockElementStyles;
}

export interface StepStyles extends BlockElementStyles {
    icon?: BlockElementStyles;
}

export interface LoadingIndicatorStyles {
    size?: number;
    color?: string;
    backgroundColor?: string;
}
