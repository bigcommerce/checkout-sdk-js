import { BraintreeModuleName } from './braintree';
import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './braintree-sdk-verison';

export const BRAINTREE_SDK_SCRIPTS_INTEGRITY = {
    [BRAINTREE_SDK_STABLE_VERSION]: {
        [BraintreeModuleName.Client]:
            'sha384-26BXDNnJI23JYRyFBj4xe4sVNrUSSiSSu11kxVXNM/vEPONm4LuL00w6ZaTgQewt',
        [BraintreeModuleName.PaypalCheckout]:
            'sha384-B+vzbZwnQtzWBthpkT4TXKUibO65tyeK7eCxSvpblgprTep2+IAXB2Cxxjrn710O',
        [BraintreeModuleName.Paypal]:
            'sha384-uyAGL1/3+XJAHnGoNy4eCoXdzJ4f7Ilzp+6w9PNnEjs6DCCz9WMyJjMN1gzc78U+',
        [BraintreeModuleName.LocalPayment]:
            'sha384-LIvOEMkIVEwVuYBdVOQc1AC5YbGGlwyfUheS0ACK218D2STuVYQlZ4FyEPowAEfT',
        [BraintreeModuleName.DataCollector]:
            'sha384-1bo9JDz+Kscthc085cCKWur8CLwUoBpoNyxsDi7932mCl0zFq3A5mv+FQLw9GHpV',
        [BraintreeModuleName.UsBankAccount]:
            'sha384-xmHBVaU+w74V+OebD3AaPONFxHUGMf+QRs8G/JxVPXNNP7MDa2jL0ICWHIe2tTfJ',
        [BraintreeModuleName.GooglePayment]:
            'sha384-WKDJl8mqoP82qZpMGH6AbZxnvXnSW8ILV4M64CyMLiugGMwu7LyP89wjCkHqsiBe',
        [BraintreeModuleName.ThreeDSecure]:
            'sha384-VQUlpGHzsGvs5XeiGFip7EXRsvoHWEXDVmgCacfbyieZI9mdBOqq3NSoyo28OCOB',
        [BraintreeModuleName.VisaCheckout]:
            'sha384-yx7mADfzTN0T43Q6rlH49LIg1EJ0iUZgBp/EczX9LXsUGkySgxrD+nWHQRBkyfoT',
        [BraintreeModuleName.Venmo]:
            'sha384-QX4rPjoj1ZDhuG0aSyKs56lEKDqTMTcjYxUHY1SzO5VZDsqIE2NTkqot7KNSCyov',
        [BraintreeModuleName.HostedFields]:
            'sha384-VvYBACfSu0Cr/J32uKmxG7AXcNOJE1AzIIL3kbikyS7YKp5fz5Is+NzNP/lyauNy',
        [BraintreeModuleName.Fastlane]:
            'sha384-9oGsZMRZwpGtDEDYa/dFt76dECqj1xAni9gIKgc3KfMIiRnR73nEeeUDLiBzxhFa',
    },
    [BRAINTREE_SDK_DEFAULT_VERSION]: {
        [BraintreeModuleName.Client]:
            'sha384-o+nbQGcwNNxIBeXeu3+XmbSq+Cg8R3EN3N0l5hXCgMMU2RGY0t1z0LroSEIAbfAO',
        [BraintreeModuleName.PaypalCheckout]:
            'sha384-WrfbWPBS4mH86GAoycPSgiH8hQ8KH7A67C93Hjhunv/xhNk2YpBn3wbFA4Fhg9U/',
        [BraintreeModuleName.Paypal]:
            'sha384-VF389nvvrRUgDsTXMxTYORDtVegB9IQa3Cxr//DyJnLYnz8/X8VCzEvck2c+Megt',
        [BraintreeModuleName.LocalPayment]:
            'sha384-tZKx2rEQbfmZpoPSY5VPmJEhaq4X75dLvwHMs3VE9U+C8lPyw+hWTIL1+GPvWCIH',
        [BraintreeModuleName.DataCollector]:
            'sha384-E6k3wOpP7syCDDwaRDLF06942Y00NkbwJvWi2OQXwwKzGwG5fd3E7RFUvCCecfvO',
        [BraintreeModuleName.UsBankAccount]:
            'sha384-258FON8LZGG0W9Qaz4Jij83pZHu30YnKjJA7gNulLBh6CclkucgF+tHDQuYFRYfW',
        [BraintreeModuleName.GooglePayment]:
            'sha384-taJ2p/0+n0VH328POAoBiuEbL3tnHUTE9S42hK1V+Txs3X+QYjZOyKW35JgHRFfO',
        [BraintreeModuleName.ThreeDSecure]:
            'sha384-+NSZH4Zj3sO5bdWvPKhU5N16QDxeueTVTnUVeleeESkhLSaz4Ob1hh/5myecc9Ym',
        [BraintreeModuleName.VisaCheckout]:
            'sha384-66DiBjghxk1OmBj8aksN8gbQ+CwoQcx1vPfiXUN08g1iQVM+BwewF0p7toM3i7SS',
        [BraintreeModuleName.Venmo]:
            'sha384-B5UwY42kE4RoLoWbQ7YpqosUlUad2/DlGWiw0HhoZbSPk30CQAaSA10ohyLDTkDU',
        [BraintreeModuleName.HostedFields]:
            'sha384-Aw9EesSaUeWxe36PqEHiOyOyOq8M6CIb1gw7/yHNVPRzGtFXXcd2OQ8qXrIlOj2P',
        [BraintreeModuleName.Fastlane]:
            'sha384-rhBL1hpZ71JqG+2TsT0Dih47mbjx8cjJCpeZjk9tw3df1gFMKfCTmMyZunhr7H4Y',
    },
};
