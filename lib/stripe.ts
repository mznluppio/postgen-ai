import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

export const priceIds: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO || "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
};
