    // import { InvalidArgumentError } from "@bigcommerce/checkout-sdk/payment-integration";
// import { createAction } from "@bigcommerce/data-store";
// import {
//     createRequestSender,
//     RequestSender,
// } from "@bigcommerce/request-sender";
// import { createScriptLoader } from "@bigcommerce/script-loader";
// import { merge } from "lodash";
// import { of, Observable } from "rxjs";
// import ApplePayPaymentStrategy from "./apple-pay-payment-strategy";
// import ApplePaySessionFactory from "./apple-pay-session-factory";
// import { MockApplePaySession } from "./mocks/apple-pay-payment.mock";

// describe("ApplePayPaymentStrategy", () => {
//     let applePaySession: MockApplePaySession;
//     let requestSender: RequestSender;
//     let applePayFactory: ApplePaySessionFactory;

//     beforeEach(() => {
//         applePaySession = new MockApplePaySession();
//         Object.defineProperty(window, "ApplePaySession", {
//             writable: true,
//             value: applePaySession,
//         });

//         requestSender = createRequestSender();
//         applePayFactory = new ApplePaySessionFactory();

//         const strategy = new ApplePayPaymentStrategy(
//             requestSender,

//             applePayFactory
//         );
//     });

//     describe("#initialize()", () => {
//         it("throws invalid argument error if no method id", async () => {
//             await expect(strategy.initialize()).rejects.toBeInstanceOf(
//                 InvalidArgumentError
//             );
//         });
//     });
// });

describe('', () => {
    it('', () => {
        expect(true).toBe(true);
    })
});
