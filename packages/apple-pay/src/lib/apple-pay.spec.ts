import { applePay } from "./apple-pay";

describe("applePay", () => {
    it("should work", () => {
        expect(applePay()).toEqual("apple-pay");
    });
});
