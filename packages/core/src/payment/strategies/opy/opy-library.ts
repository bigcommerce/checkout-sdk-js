export enum OpyRegion {
    AU = 'AU',
    UK = 'UK',
    US = 'US',
}

/**
 * https://widgets.openpay.com.au/config
 */
export interface OpyWidgetConfig {
    /**
     * The region your store is located in.
     */
    region: OpyRegion;
    /**
     * The currency symbol used in the widgets.
     */
    currency: '$' | '£';
    /**
     * An array of available plan tiers you have available in months.
     */
    planTiers: number[];
    /**
     * The minimum eligible amount required before Opy is eligible.
     */
    minEligibleAmount: number;
    /**
     * The maximum eligible amount required before Opy is eligible.
     */
    maxEligibleAmount: number;
    /**
     * Type of your store.
     */
    type: 'Online';
}

export interface OpyWidget {
    /**
     * Initialize the library.
     *
     * @param config Properties with the correct purchase limits, plan tiers, etc.
     */
    Config(config: OpyWidgetConfig): void;
}

export interface OpyHostWindow extends Window {
    /**
     * The Opy widgets library.
     */
    OpenpayWidgets?: OpyWidget;
}
