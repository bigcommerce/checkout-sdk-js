import { getScriptLoader } from '@bigcommerce/script-loader';
import 'current-script-polyfill';

import * as checkoutButtonBundle from './bundles/checkout-button';
import * as mainBundle from './bundles/checkout-sdk';
import * as embeddedCheckoutBundle from './bundles/embedded-checkout';
import * as headlessCheckoutWalletBundle from './bundles/headless-checkout-wallet';
import * as hostedFormBundle from './bundles/hosted-form';
import { parseUrl } from './common/url';

export type CheckoutButtonBundle = typeof checkoutButtonBundle & { version: string };
export type HeadlessCheckoutWalletBundle = typeof headlessCheckoutWalletBundle & {
    version: string;
};
export type EmbeddedCheckoutBundle = typeof embeddedCheckoutBundle & { version: string };
export type HostedFormBundle = typeof hostedFormBundle & { version: string };
export type MainBundle = typeof mainBundle & { version: string };

export enum BundleType {
    CheckoutButton = 'checkout-button',
    HeadlessCheckoutWallet = 'headless-checkout-wallet',
    EmbeddedCheckout = 'embedded-checkout',
    HostedForm = 'hosted-form',
    Main = 'checkout-sdk',
}

const scriptOrigin = isScriptElement(document.currentScript)
    ? parseUrl(document.currentScript.src).origin
    : '';

export function load(moduleName?: BundleType.Main): Promise<MainBundle>;
export function load(moduleName: BundleType.CheckoutButton): Promise<CheckoutButtonBundle>;
export function load(
    moduleName: BundleType.HeadlessCheckoutWallet,
): Promise<HeadlessCheckoutWalletBundle>;
export function load(moduleName: BundleType.EmbeddedCheckout): Promise<EmbeddedCheckoutBundle>;
export function load(moduleName: BundleType.HostedForm): Promise<HostedFormBundle>;

export async function load(
    moduleName: string = BundleType.Main,
): Promise<
    | MainBundle
    | CheckoutButtonBundle
    | HeadlessCheckoutWalletBundle
    | EmbeddedCheckoutBundle
    | HostedFormBundle
> {
    const { version, js } = MANIFEST_JSON;
    const manifestPath = js.find((path) => path.indexOf(moduleName) !== -1);

    if (!manifestPath) {
        throw new Error('Unable to load the script because its URL cannot be determined.');
    }

    await getScriptLoader().loadScript(`${scriptOrigin}/${manifestPath}`);

    return {
        version,
        ...(window as any)[LIBRARY_NAME],
    };
}

function isScriptElement(element: HTMLOrSVGScriptElement | null): element is HTMLScriptElement {
    return !!(element && 'src' in element);
}
