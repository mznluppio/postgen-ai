import { NextRequest, NextResponse } from "next/server";
import { stripe, priceIds } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { plan, orgId } = await req.json();
    const priceId = priceIds[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url:
        process.env.NEXT_PUBLIC_APP_URL +
        `/dashboard/billing?success=1&plan=${plan}&orgId=${orgId}`,
      cancel_url:
        process.env.NEXT_PUBLIC_APP_URL + "/dashboard/billing?canceled=1",
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}

