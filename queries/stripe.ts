import stripeLib from 'stripe';

// Initialize Stripe client
const stripe = new stripeLib(process.env.STRIPE_API_KEY as string, { typescript: true, apiVersion: '2023-08-16' });

export async function startSubscription(discordUserId: string) {
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PLAN_ID,
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: { discord_id: discordUserId },
    success_url: `${process.env.STRIPE_PAYMENT_BRIDGE_BASEURL}/success`,
    cancel_url: `${process.env.STRIPE_PAYMENT_BRIDGE_BASEURL}/cancel`,
  });

  // Payment URL
  return checkoutSession.url;
}