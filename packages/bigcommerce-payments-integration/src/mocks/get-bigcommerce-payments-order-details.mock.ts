import { PayPalOrderDetails } from '../bigcommerce-payments-types';

export default function getBigCommercePaymentsOrderDetails(): PayPalOrderDetails {
    return {
        purchase_units: [
            {
                shipping: {
                    address: {
                        address_line_1: '2 E 61st St',
                        address_line_2: 'Apt.1',
                        admin_area_2: 'New York',
                        admin_area_1: 'NY',
                        postal_code: '10065',
                        country_code: 'US',
                    },
                    name: {
                        full_name: 'Full Name',
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
                address_line_2: 'Apt.2',
                admin_area_2: 'San Jose',
                admin_area_1: 'CA',
                postal_code: '95131',
                country_code: 'US',
            },
            phone: {
                phone_number: {
                    national_number: '123456789',
                },
            },
        },
    };
}
