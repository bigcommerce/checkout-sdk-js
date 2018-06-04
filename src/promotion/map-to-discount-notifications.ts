import { DiscountNotification } from '../discount';

import { Promotion } from '.';

export default function mapToDiscountNotifications(promotions?: Promotion[]): DiscountNotification[] {
    const notifications: DiscountNotification[] = [];

    (promotions || []).forEach(promotion => {
        (promotion.banners || []).forEach(banner => {
            notifications.push({
                placeholders: [],
                discountType: null,
                message: '',
                messageHtml: banner.text,
            });
        });
    });

    return notifications;
}
