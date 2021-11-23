export function getMockApplePaySession() {
    class MockApplePaySession {
        static supportsVersion: () => boolean;
        static canMakePayments: () => boolean;

        completePayment = jest.fn();

        completeMerchantValidation() {
            return true;
        }

        begin() {
            console.log('it begins');
        }
    }
  
    return MockApplePaySession;
  };