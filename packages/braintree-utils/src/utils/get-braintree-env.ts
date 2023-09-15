import { BraintreeEnv } from '../types';

export default function getBraintreeEnv(isTestMode = false): BraintreeEnv {
    return isTestMode ? BraintreeEnv.Sandbox : BraintreeEnv.Production;
}
