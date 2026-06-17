import { NextResponse } from "next/server";
import { newsletterSubscribeSchema } from "@/lib/validations/newsletter-schema";
import emailService from "@/lib/services/email-service";

const DEFAULT_NEWSLETTER_TO = "support@hammadbuckle.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterSubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const to = process.env.NEWSLETTER_NOTIFY_EMAIL || DEFAULT_NEWSLETTER_TO;
    const result = await emailService.sendEmail({
      to,
      subject: "New newsletter subscription",
      html: `
        <p>A user subscribed to the newsletter.</p>
        <p><strong>Email:</strong> ${parsed.data.email}</p>
      `,
    });

    if (!result.success) {
      return NextResponse.json(
        { ok: false, message: "Subscription could not be completed right now." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, message: "Subscribed successfully." });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Subscription could not be completed right now." },
      { status: 500 }
    );
  }
}
