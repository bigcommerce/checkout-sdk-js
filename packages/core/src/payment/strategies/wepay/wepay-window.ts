import WepayRisk from './wepay-risk';

export default interface WepayWindow extends Window {
    WePay: {
        risk: WepayRisk;
    };
}
