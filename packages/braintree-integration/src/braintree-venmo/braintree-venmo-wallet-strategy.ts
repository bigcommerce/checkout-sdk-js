import {
    BraintreeInitializationData,
    BraintreeVenmoWalletService,
    isBraintreeError,
    PaypalButtonStyleColorOption,
    PaypalStyleOptions,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    StandardError,
    UnsupportedBrowserError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

const VenmoButtonImage = {
    [PaypalButtonStyleColorOption.WHITE]:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTE4IiBoZWlnaHQ9IjI5IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiPgogICAgPGRlZnM+CiAgICAgICAgPGNsaXBQYXRoIGlkPSJjbGlwMCI+CiAgICAgICAgICAgIDxyZWN0IHdpZHRoPSIxOTgiIGhlaWdodD0iMzgiIGZpbGw9IndoaXRlIiBpZD0ic3ZnXzEiLz4KICAgICAgICA8L2NsaXBQYXRoPgogICAgPC9kZWZzPgogICAgPGc+CiAgICAgICAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogICAgICAgIDxnIHN0cm9rZT0ibnVsbCIgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwKSIgaWQ9InN2Z18yIj4KICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSJudWxsIiBkPSJtMjAuMDM2ODgsNGMwLjc1NDU4LDEuMjY3NTEgMS4wOTQ4NSwyLjU3Mjk0IDEuMDk0ODUsNC4yMjIwOGMwLDUuMjU5ODUgLTQuNDE0OTYsMTIuMDkyNzEgLTcuOTk4MjMsMTYuODkwNzVsLTguMTg0NDMsMGwtMy4yODI0LC0xOS45NjExN2w3LjE2NjM0LC0wLjY5MmwxLjczNTQ1LDE0LjIwMzY1YzEuNjIxNTQsLTIuNjg2NjQgMy42MjI1OSwtNi45MDg3MSAzLjYyMjU5LC05Ljc4NzMzYzAsLTEuNTc1NjMgLTAuMjY1NCwtMi42NDg4IC0wLjY4MDE3LC0zLjUzMjQzbDYuNTI2LC0xLjM0MzU0eiIgZmlsbD0id2hpdGUiIGlkPSJzdmdfMyIvPgogICAgICAgICAgICA8cGF0aCBzdHJva2U9Im51bGwiIGQ9Im0yOS4zMjQ3NCwxMi43ODk3NGMxLjMxODgsMCA0LjYzODc0LC0wLjYxMzUzIDQuNjM4NzQsLTIuNTMyNThjMCwtMC45MjE0NiAtMC42NDA2MiwtMS4zODEyIC0xLjM5NTY1LC0xLjM4MTJjLTEuMzIwODgsMCAtMy4wNTQxOCwxLjYxMDk0IC0zLjI0MzA5LDMuOTEzNzhsLTAuMDAwMDEsMHptLTAuMTUxMDgsMy44MDA2M2MwLDIuMzQzMyAxLjI4MTE0LDMuMjYyNTkgMi45Nzk1OCwzLjI2MjU5YzEuODQ5NjEsMCAzLjYyMDQ3LC0wLjQ1OTY1IDUuOTIyMjMsLTEuNjQ5MzFsLTAuODY3MDEsNS45ODcyNWMtMS42MjE2OCwwLjgwNTg4IC00LjE0OTExLDEuMzQzNTQgLTYuNjAyMzEsMS4zNDM1NGMtNi4yMjI5NCwwIC04LjQ1MDAyLC0zLjgzODEgLTguNDUwMDIsLTguNjM2MzJjMCwtNi4yMTg5NyAzLjYyMjczLC0xMi44MjIyOCAxMS4wOTE2OSwtMTIuODIyMjhjNC4xMTIxOCwwIDYuNDExNTksMi4zNDMwMyA2LjQxMTU5LDUuNjA1NjJjMC4wMDAzNiw1LjI1OTU4IC02LjYzNzI2LDYuODcwODggLTEwLjQ4NTc1LDYuOTA4OWwwLjAwMDAxLDB6IiBmaWxsPSJ3aGl0ZSIgaWQ9InN2Z180Ii8+CiAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0ibnVsbCIgZD0ibTYwLjM0MDQ5LDguNjg0MDdjMCwwLjc2NzY3IC0wLjExNDUsMS44ODEwMyAtMC4yMjgzOCwyLjYwODdsLTIuMTUwNDEsMTMuODIwMDRsLTYuOTc4MDcsMGwxLjk2MTQ5LC0xMi42Njg2N2MwLjAzNzIxLC0wLjM0MzYxIDAuMTUxNTMsLTEuMDM1MzQgMC4xNTE1MywtMS40MTkxM2MwLC0wLjkyMTU1IC0wLjU2NjEyLC0xLjE1MTQ3IC0xLjI0NjY0LC0xLjE1MTQ3Yy0wLjkwMzk1LDAgLTEuODEwMDUsMC40MjE4MSAtMi40MTM1NiwwLjcyOTg0bC0yLjIyNDgyLDE0LjUwOTQzbC03LjAxNzM1LDBsMy4yMDU4OSwtMjAuNjkwODNsNi4wNzM0OSwwbDAuMDc2OTQsMS42NTE0OGMxLjQzMjg1LC0wLjk1OTQ4IDMuMzE5NTgsLTEuOTk3MjYgNS45OTY1NSwtMS45OTcyNmMzLjU0NjcsLTAuMDAwMzYgNC43OTMzNCwxLjg0Mjg0IDQuNzkzMzQsNC42MDc4NmwwLjAwMDAxLDB6IiBmaWxsPSJ3aGl0ZSIgaWQ9InN2Z181Ii8+CiAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0ibnVsbCIgZD0ibTgxLjA1NjI0LDYuMzQwODZjMS45OTg1MiwtMS40NTcyMyAzLjg4NTcsLTIuMjY1MDEgNi40ODc3MiwtMi4yNjUwMWMzLjU4MzA5LDAgNC44Mjg5MiwxLjg0MzIgNC44Mjg5Miw0LjYwODIyYzAsMC43Njc2NyAtMC4xMTM3OCwxLjg4MTAzIC0wLjIyNzU3LDIuNjA4N2wtMi4xNDc5NywxMy44MTk4N2wtNi45Nzk5NiwwbDEuOTk4OTcsLTEyLjkzNjI0YzAuMDM2NzYsLTAuMzQ1NzcgMC4xMTQwNSwtMC43Njc1OCAwLjExNDA1LC0xLjAzNTE2YzAsLTEuMDM3NTkgLTAuNTY2MywtMS4yNjc2OSAtMS4yNDY2NCwtMS4yNjc2OWMtMC44NjY3NCwwIC0xLjczMzEyLDAuMzgzNzkgLTIuMzc2MzUsMC43Mjk3NWwtMi4yMjQzNywxNC41MDk2OWwtNi45NzgyNSwwbDEuOTk4ODgsLTEyLjkzNjQyYzAuMDM2ODQsLTAuMzQ1NzcgMC4xMTE3OSwtMC43Njc1OCAwLjExMTc5LC0xLjAzNTE2YzAsLTEuMDM3NSAtMC41NjY0OCwtMS4yNjc2OSAtMS4yNDQ0OCwtMS4yNjc2OWMtMC45MDU5MywwIC0xLjgxMDA1LDAuNDIxODEgLTIuNDEzNTYsMC43Mjk4NGwtMi4yMjY1NCwxNC41MDk0M2wtNy4wMTUwOSwwbDMuMjA1NTIsLTIwLjY5MDgzbDUuOTk5MjYsMGwwLjE4ODU1LDEuNzI3MzRjMS4zOTU2NSwtMS4wMzUxNiAzLjI4MDg0LC0yLjA3Mjg0IDUuODA4MDksLTIuMDcyODRjMi4xODgxNiwtMC4wMDA4MSAzLjYyMDgzLDAuOTU4ODUgNC4zMzkwMiwyLjI2NDE5bDAuMDAwMDEsMC4wMDAwMXoiIGZpbGw9IndoaXRlIiBpZD0ic3ZnXzYiLz4KICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSJudWxsIiBkPSJtMTA2LjI2MDc1LDEyLjM2ODNjMCwtMS42ODkxNCAtMC40MTU0LC0yLjg0MDY5IC0xLjY1ODg4LC0yLjg0MDY5Yy0yLjc1NDI3LDAgLTMuMzE5NTgsNC45NTE0NyAtMy4zMTk1OCw3LjQ4NDRjMCwxLjkyMTY3IDAuNTI4MjgsMy4xMTA4OCAxLjc3MTc2LDMuMTEwODhjMi42MDM0NywwIDMuMjA2NywtNS4yMjE4NCAzLjIwNjcsLTcuNzU0NTl6bS0xMi4wNzAwNCw0LjMzNzk0YzAsLTYuNTI0OTIgMy4zOTQ1MywtMTIuNjMwMzggMTEuMjAzMTMsLTEyLjYzMDM4YzUuODg1MTIsMCA4LjAzNjE2LDMuNTMyNTEgOC4wMzYxNiw4LjQwODMxYzAsNi40NDkzNCAtMy4zNTc1MSwxMy4xMjgxMyAtMTEuMzU1NzMsMTMuMTI4MTNjLTUuOTIyMTQsMCAtNy44ODM1NSwtMy45NTQzMyAtNy44ODM1NSwtOC45MDYwNmwtMC4wMDAwMSwweiIgZmlsbD0id2hpdGUiIGlkPSJzdmdfNyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==',
    [PaypalButtonStyleColorOption.BLUE]:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTE4IiBoZWlnaHQ9IjI5IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiPgogICAgPGRlZnM+CiAgICAgICAgPGNsaXBQYXRoIGlkPSJjbGlwMCI+CiAgICAgICAgICAgIDxyZWN0IHdpZHRoPSIxOTgiIGhlaWdodD0iMzgiIGZpbGw9IiMwMDhDRkYiIGlkPSJzdmdfMSIvPgogICAgICAgIDwvY2xpcFBhdGg+CiAgICA8L2RlZnM+CiAgICA8Zz4KICAgICAgICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgICAgICAgPGcgc3Ryb2tlPSJudWxsIiBjbGlwLXBhdGg9InVybCgjY2xpcDApIiBpZD0ic3ZnXzIiPgogICAgICAgICAgICA8cGF0aCBzdHJva2U9Im51bGwiIGQ9Im0yMC4wMzY4OCw0YzAuNzU0NTgsMS4yNjc1MSAxLjA5NDg1LDIuNTcyOTQgMS4wOTQ4NSw0LjIyMjA4YzAsNS4yNTk4NSAtNC40MTQ5NiwxMi4wOTI3MSAtNy45OTgyMywxNi44OTA3NWwtOC4xODQ0MywwbC0zLjI4MjQsLTE5Ljk2MTE3bDcuMTY2MzQsLTAuNjkybDEuNzM1NDUsMTQuMjAzNjVjMS42MjE1NCwtMi42ODY2NCAzLjYyMjU5LC02LjkwODcxIDMuNjIyNTksLTkuNzg3MzNjMCwtMS41NzU2MyAtMC4yNjU0LC0yLjY0ODggLTAuNjgwMTcsLTMuNTMyNDNsNi41MjYsLTEuMzQzNTR6IiBmaWxsPSIjMDA4Q0ZGIiBpZD0ic3ZnXzMiLz4KICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSJudWxsIiBkPSJtMjkuMzI0NzQsMTIuNzg5NzRjMS4zMTg4LDAgNC42Mzg3NCwtMC42MTM1MyA0LjYzODc0LC0yLjUzMjU4YzAsLTAuOTIxNDYgLTAuNjQwNjIsLTEuMzgxMiAtMS4zOTU2NSwtMS4zODEyYy0xLjMyMDg4LDAgLTMuMDU0MTgsMS42MTA5NCAtMy4yNDMwOSwzLjkxMzc4bC0wLjAwMDAxLDB6bS0wLjE1MTA4LDMuODAwNjNjMCwyLjM0MzMgMS4yODExNCwzLjI2MjU5IDIuOTc5NTgsMy4yNjI1OWMxLjg0OTYxLDAgMy42MjA0NywtMC40NTk2NSA1LjkyMjIzLC0xLjY0OTMxbC0wLjg2NzAxLDUuOTg3MjVjLTEuNjIxNjgsMC44MDU4OCAtNC4xNDkxMSwxLjM0MzU0IC02LjYwMjMxLDEuMzQzNTRjLTYuMjIyOTQsMCAtOC40NTAwMiwtMy44MzgxIC04LjQ1MDAyLC04LjYzNjMyYzAsLTYuMjE4OTcgMy42MjI3MywtMTIuODIyMjggMTEuMDkxNjksLTEyLjgyMjI4YzQuMTEyMTgsMCA2LjQxMTU5LDIuMzQzMDMgNi40MTE1OSw1LjYwNTYyYzAuMDAwMzYsNS4yNTk1OCAtNi42MzcyNiw2Ljg3MDg4IC0xMC40ODU3NSw2LjkwODlsMC4wMDAwMSwweiIgZmlsbD0iIzAwOENGRiIgaWQ9InN2Z180Ii8+CiAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0ibnVsbCIgZD0ibTYwLjM0MDQ5LDguNjg0MDdjMCwwLjc2NzY3IC0wLjExNDUsMS44ODEwMyAtMC4yMjgzOCwyLjYwODdsLTIuMTUwNDEsMTMuODIwMDRsLTYuOTc4MDcsMGwxLjk2MTQ5LC0xMi42Njg2N2MwLjAzNzIxLC0wLjM0MzYxIDAuMTUxNTMsLTEuMDM1MzQgMC4xNTE1MywtMS40MTkxM2MwLC0wLjkyMTU1IC0wLjU2NjEyLC0xLjE1MTQ3IC0xLjI0NjY0LC0xLjE1MTQ3Yy0wLjkwMzk1LDAgLTEuODEwMDUsMC40MjE4MSAtMi40MTM1NiwwLjcyOTg0bC0yLjIyNDgyLDE0LjUwOTQzbC03LjAxNzM1LDBsMy4yMDU4OSwtMjAuNjkwODNsNi4wNzM0OSwwbDAuMDc2OTQsMS42NTE0OGMxLjQzMjg1LC0wLjk1OTQ4IDMuMzE5NTgsLTEuOTk3MjYgNS45OTY1NSwtMS45OTcyNmMzLjU0NjcsLTAuMDAwMzYgNC43OTMzNCwxLjg0Mjg0IDQuNzkzMzQsNC42MDc4NmwwLjAwMDAxLDB6IiBmaWxsPSIjMDA4Q0ZGIiBpZD0ic3ZnXzUiLz4KICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSJudWxsIiBkPSJtODEuMDU2MjQsNi4zNDA4NmMxLjk5ODUyLC0xLjQ1NzIzIDMuODg1NywtMi4yNjUwMSA2LjQ4NzcyLC0yLjI2NTAxYzMuNTgzMDksMCA0LjgyODkyLDEuODQzMiA0LjgyODkyLDQuNjA4MjJjMCwwLjc2NzY3IC0wLjExMzc4LDEuODgxMDMgLTAuMjI3NTcsMi42MDg3bC0yLjE0Nzk3LDEzLjgxOTg3bC02Ljk3OTk2LDBsMS45OTg5NywtMTIuOTM2MjRjMC4wMzY3NiwtMC4zNDU3NyAwLjExNDA1LC0wLjc2NzU4IDAuMTE0MDUsLTEuMDM1MTZjMCwtMS4wMzc1OSAtMC41NjYzLC0xLjI2NzY5IC0xLjI0NjY0LC0xLjI2NzY5Yy0wLjg2Njc0LDAgLTEuNzMzMTIsMC4zODM3OSAtMi4zNzYzNSwwLjcyOTc1bC0yLjIyNDM3LDE0LjUwOTY5bC02Ljk3ODI1LDBsMS45OTg4OCwtMTIuOTM2NDJjMC4wMzY4NCwtMC4zNDU3NyAwLjExMTc5LC0wLjc2NzU4IDAuMTExNzksLTEuMDM1MTZjMCwtMS4wMzc1IC0wLjU2NjQ4LC0xLjI2NzY5IC0xLjI0NDQ4LC0xLjI2NzY5Yy0wLjkwNTkzLDAgLTEuODEwMDUsMC40MjE4MSAtMi40MTM1NiwwLjcyOTg0bC0yLjIyNjU0LDE0LjUwOTQzbC03LjAxNTA5LDBsMy4yMDU1MiwtMjAuNjkwODNsNS45OTkyNiwwbDAuMTg4NTUsMS43MjczNGMxLjM5NTY1LC0xLjAzNTE2IDMuMjgwODQsLTIuMDcyODQgNS44MDgwOSwtMi4wNzI4NGMyLjE4ODE2LC0wLjAwMDgxIDMuNjIwODMsMC45NTg4NSA0LjMzOTAyLDIuMjY0MTlsMC4wMDAwMSwwLjAwMDAxeiIgZmlsbD0iIzAwOENGRiIgaWQ9InN2Z182Ii8+CiAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0ibnVsbCIgZD0ibTEwNi4yNjA3NSwxMi4zNjgzYzAsLTEuNjg5MTQgLTAuNDE1NCwtMi44NDA2OSAtMS42NTg4OCwtMi44NDA2OWMtMi43NTQyNywwIC0zLjMxOTU4LDQuOTUxNDcgLTMuMzE5NTgsNy40ODQ0YzAsMS45MjE2NyAwLjUyODI4LDMuMTEwODggMS43NzE3NiwzLjExMDg4YzIuNjAzNDcsMCAzLjIwNjcsLTUuMjIxODQgMy4yMDY3LC03Ljc1NDU5em0tMTIuMDcwMDQsNC4zMzc5NGMwLC02LjUyNDkyIDMuMzk0NTMsLTEyLjYzMDM4IDExLjIwMzEzLC0xMi42MzAzOGM1Ljg4NTEyLDAgOC4wMzYxNiwzLjUzMjUxIDguMDM2MTYsOC40MDgzMWMwLDYuNDQ5MzQgLTMuMzU3NTEsMTMuMTI4MTMgLTExLjM1NTczLDEzLjEyODEzYy01LjkyMjE0LDAgLTcuODgzNTUsLTMuOTU0MzMgLTcuODgzNTUsLTguOTA2MDZsLTAuMDAwMDEsMHoiIGZpbGw9IiMwMDhDRkYiIGlkPSJzdmdfNyIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==',
};

import BraintreeVenmoWalletInitializeOptions, {
    WithBraintreeVenmoWalletInitializeOptions,
} from './braintree-venmo-wallet-initialize-options';

const getVenmoButtonStyle = (styles: PaypalStyleOptions): Record<string, string> => {
    const { color, height } = styles;

    const colorParser = (c: string) => {
        if (c === PaypalButtonStyleColorOption.WHITE) {
            return '#FFFFFF';
        }

        return '#3D95CE';
    };

    return {
        backgroundColor: colorParser(color || ''),
        backgroundPosition: '50% 50%',
        backgroundSize: '80px auto',
        backgroundImage: `url("${
            VenmoButtonImage[
                color === PaypalButtonStyleColorOption.WHITE
                    ? PaypalButtonStyleColorOption.BLUE
                    : PaypalButtonStyleColorOption.WHITE
            ]
        }")`,
        backgroundRepeat: 'no-repeat',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: '0.2s ease',
        minHeight: `${height || 40}px`,
        minWidth: '150px',
        height: '100%',
        border: color === PaypalButtonStyleColorOption.WHITE ? '1px solid black' : 'none',
    };
};

const venmoButtonStyleHover = {
    backgroundColor: '#0a7fc2',
};

export default class BraintreeVenmoWalletStrategy implements CheckoutButtonStrategy {
    constructor(private braintreeVenmoWalletService: BraintreeVenmoWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBraintreeVenmoWalletInitializeOptions,
    ): Promise<void> {
        const { braintreevenmo, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!braintreevenmo) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreevenmo" argument is not provided.`,
            );
        }

        let parsedPaymentMethod: PaymentMethod<BraintreeInitializationData>;

        try {
            parsedPaymentMethod = JSON.parse(atob(braintreevenmo.initializationData));
        } catch (error) {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const { initializationData, config } = parsedPaymentMethod;

        if (!braintreevenmo.clientToken || !initializationData || !config) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeVenmoWalletService.initialize(braintreevenmo.clientToken);

        try {
            await this.braintreeVenmoWalletService.loadVenmoCheckout(containerId);
        } catch (error) {
            this.handleInitializationError(error, braintreevenmo);

            return;
        }

        this.renderButton(braintreevenmo, containerId, methodId, initializationData);
    }

    async deinitialize(): Promise<void> {
        await this.braintreeVenmoWalletService.teardown();
    }

    private handleInitializationError(
        error: unknown,
        braintreevenmo: BraintreeVenmoWalletInitializeOptions,
    ): void {
        const { onError, onEligibilityFailure } = braintreevenmo;

        if (error instanceof UnsupportedBrowserError) {
            onEligibilityFailure?.();

            return;
        }

        if (isBraintreeError(error) || error instanceof StandardError) {
            onError?.(error);
        }
    }

    private renderButton(
        braintreevenmo: BraintreeVenmoWalletInitializeOptions,
        containerId: string,
        methodId: string,
        initializationData: BraintreeInitializationData,
    ): void {
        const { style, onEligibilityFailure } = braintreevenmo;
        const { cartButtonStyles } = initializationData.paymentButtonStyles || {};
        const buttonStyles = style || cartButtonStyles || {};
        const { color } = buttonStyles;

        const venmoButton = document.getElementById(containerId);

        if (!venmoButton) {
            this.braintreeVenmoWalletService.removeElement(containerId);

            onEligibilityFailure?.();

            return;
        }

        venmoButton.setAttribute('aria-label', 'Venmo');
        Object.assign(venmoButton.style, getVenmoButtonStyle(buttonStyles));

        venmoButton.addEventListener('click', async () => {
            venmoButton.setAttribute('disabled', 'true');

            try {
                await this.braintreeVenmoWalletService.proxyTokenizationPayment(
                    methodId,
                    braintreevenmo.cartId,
                );
            } catch (error) {
                if (isBraintreeError(error) || error instanceof StandardError) {
                    braintreevenmo.onAuthorizeError?.(error);
                }
            } finally {
                venmoButton.removeAttribute('disabled');
            }
        });

        if (color === PaypalButtonStyleColorOption.BLUE) {
            venmoButton.addEventListener('mouseenter', () => {
                venmoButton.style.backgroundColor = venmoButtonStyleHover.backgroundColor;
            });

            venmoButton.addEventListener('mouseleave', () => {
                venmoButton.style.backgroundColor =
                    getVenmoButtonStyle(buttonStyles).backgroundColor;
            });
        }
    }
}
