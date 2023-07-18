import { BraintreeConnectProfileData } from '../braintree';

export const mockedProfileData: BraintreeConnectProfileData = {
    "connectCustomerAuthAssertionToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmc24iOiJaZWUiLCJhdF9oYXNoIjoieWloWkhfTHdfdDNiQkhKRUxUb25EdyIsInN1YiI6Imh0dHBzOi8vd3d3LnBheXBhbC5jb20vd2ViYXBwcy9hdXRoL2lkZW50aXR5L3VzZXIvazZYNFFSdGJSWWlhelNqb0h1V3NaQ2wzaWE1R205emhQb1VEb1o4MVhROCIsImFkZHJlc3MiOnsiY291bnRyeSI6IlVTIn0sImxzbiI6IkFicmFoYW1zIiwiaXNzIjoiaHR0cHM6Ly9hcGkucGF5cGFsLmNvbSIsIm5zbiI6IlplZSBBYnJhaGFtcyIsInNlc3Npb25faW5kZXgiOiIwVXZIUFJDUTdYb24xa21rSkx5bXYwaFg0M0ciLCJub25jZSI6Ik4yM0FBZkxPRkRGdDl1MlljVUtVUHJQRloybVBtUVlFQ0dOTVNSbkVFcGNtRnEyNERhMktjWkduMUUzRmdoQWNXa2JXblZadm9jYWloQ3RVa3dHam0xSWNvcGszbkJlN050VGVFcEoySkYtTVUzT0ptQTVYbUJMcy1vb2oxbzlUZyIsImF1ZCI6IkJfQW5DX0FpU0VRb21oeko3UHNzU0ZGN2ZwdlhiNk1pVk1OalZEZ2J6SVdqaUNqa0lwMHRGQ1g4aEhDQ2ZuaVdCN1lSbzRwblVIQnJET0hZVlEiLCJwaG9uZSI6IjEgNDA4MzA3OTIzOSIsImF1dGhfdGltZSI6MTY4NjU5MjUxMiwiZXhwIjoxNjg2NTkzNDEyLCJlbWFpbCI6InplZS0zLWdhcnlAdGVzdC5jb20ifQ.adffSj0qQfaRG8F-7AF0vOjZuSO",
    "connectCustomerId": "MOCK8JHMJM2R6",
    "addresses": [
        {
            company: undefined,
            extendedAddress: undefined,
            "firstName": "Ryan",
            "lastName": "Onecard",
            "streetAddress": "Hello World 123",
            "locality": "Bellingham",
            "region": "WA",
            "postalCode": "98225",
            "countryCodeNumeric": 0,
            "countryCodeAlpha2": "US",
            "countryCodeAlpha3": ""
        }
    ],
    "cards": [
        {
            "id": "657397db-fe4b-16bb-413c-173fde83b61b",
            "paymentSource": {
                "card": {
                    "brand": "VISA",
                    "expiry": "02/2037",
                    "lastDigits": "1111",
                    "billingAddress": {
                        company: undefined,
                        extendedAddress: undefined,
                        firstName: undefined,
                        lastName: undefined,
                        "streetAddress": "Hello World 123",
                        "locality": "Bellingham",
                        "region": "WA",
                        "postalCode": "98225",
                        "countryCodeNumeric": 0,
                        "countryCodeAlpha2": "US",
                        "countryCodeAlpha3": ""
                    }
                }
            }
        }
    ]
}


// PP Connect OTP response example
// {
//     "authenticationState": "succeeded",
//     "profileData": {
//         "connectCustomerAuthAssertionToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmc24iOiJaZWUiLCJhdF9oYXNoIjoieWloWkhfTHdfdDNiQkhKRUxUb25EdyIsInN1YiI6Imh0dHBzOi8vd3d3LnBheXBhbC5jb20vd2ViYXBwcy9hdXRoL2lkZW50aXR5L3VzZXIvazZYNFFSdGJSWWlhelNqb0h1V3NaQ2wzaWE1R205emhQb1VEb1o4MVhROCIsImFkZHJlc3MiOnsiY291bnRyeSI6IlVTIn0sImxzbiI6IkFicmFoYW1zIiwiaXNzIjoiaHR0cHM6Ly9hcGkucGF5cGFsLmNvbSIsIm5zbiI6IlplZSBBYnJhaGFtcyIsInNlc3Npb25faW5kZXgiOiIwVXZIUFJDUTdYb24xa21rSkx5bXYwaFg0M0ciLCJub25jZSI6Ik4yM0FBZkxPRkRGdDl1MlljVUtVUHJQRloybVBtUVlFQ0dOTVNSbkVFcGNtRnEyNERhMktjWkduMUUzRmdoQWNXa2JXblZadm9jYWloQ3RVa3dHam0xSWNvcGszbkJlN050VGVFcEoySkYtTVUzT0ptQTVYbUJMcy1vb2oxbzlUZyIsImF1ZCI6IkJfQW5DX0FpU0VRb21oeko3UHNzU0ZGN2ZwdlhiNk1pVk1OalZEZ2J6SVdqaUNqa0lwMHRGQ1g4aEhDQ2ZuaVdCN1lSbzRwblVIQnJET0hZVlEiLCJwaG9uZSI6IjEgNDA4MzA3OTIzOSIsImF1dGhfdGltZSI6MTY4NjU5MjUxMiwiZXhwIjoxNjg2NTkzNDEyLCJlbWFpbCI6InplZS0zLWdhcnlAdGVzdC5jb20ifQ.adffSj0qQfaRG8F-7AF0vOjZuSO",
//         "connectCustomerId": "MOCK8JHMJM2R6",
//         "addresses": [
//             {
//                 "firstName": "Ryan",
//                 "lastName": "Onecard",
//                 "streetAddress": "123 Main St",
//                 "locality": "Bellingham",
//                 "region": "WA",
//                 "postalCode": "98225",
//                 "countryCodeNumeric": 0,
//                 "countryCodeAlpha2": "US",
//                 "countryCodeAlpha3": ""
//             }
//         ],
//             "cards": [
//             {
//                 "id": "657397db-fe4b-16bb-413c-173fde83b61b",
//                 "paymentSource": {
//                     "card": {
//                         "brand": "VISA",
//                         "expiry": "02/2037",
//                         "lastDigits": "1111",
//                         "billingAddress": {
//                             "streetAddress": "123 Main St",
//                             "locality": "Bellingham",
//                             "region": "WA",
//                             "postalCode": "98225",
//                             "countryCodeNumeric": 0,
//                             "countryCodeAlpha2": "US",
//                             "countryCodeAlpha3": ""
//                         }
//                     }
//                 }
//             }
//         ]
//     }
// }
