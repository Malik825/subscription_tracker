import { z } from "zod";

export const subscriptionSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be at most 100 characters"),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    currency: z.enum(['USD', 'EUR', 'GBP', 'CEDI', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'IDR', 'INR', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SGD', 'THB', 'TRY', 'ZAR']).default('USD'),
    frequency: z.enum(['Monthly', 'Yearly', 'Weekly', 'Daily']),
    category: z.enum(['Entertainment', 'Food', 'Travel', 'Shopping', 'Subscription', 'Others']),
    startDate: z.string().or(z.date()),
    renewalDate: z.string().or(z.date()).optional(),
    status: z.enum(['Active', 'Suspended', 'Cancelled', 'Expired']).default('Active'),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
