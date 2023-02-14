import { PayPalOrderDetails } from '../paypal-commerce-types';

export default function getPayPalCommerceOrderDetails(): PayPalOrderDetails {
    return {
        purchase_units: [
            {
                shipping: {
                    address: {
                        address_line_1: '2 E 61st St',
                        admin_area_2: 'New York',
                        admin_area_1: 'NY',
                        postal_code: '10065',
                        country_code: 'US',
                    },
                },
            },
        ],
        payer: {
            name: {
                given_name: 'John',
                surname: 'Doe',
            },
            email_address: 'john@doe.com',
            address: {
                address_line_1: '1 Main St',
                admin_area_2: 'San Jose',
                admin_area_1: 'CA',
                postal_code: '95131',
                country_code: 'US',
            },
        },
    };
}
