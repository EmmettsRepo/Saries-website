"use client";

import AnimatedSection from "@/components/AnimatedSection";

export default function TermsPage() {
  return (
    <div className="pt-32 pb-28 px-6">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Legal</p>
          <h1 className="font-heading text-4xl text-dark font-normal mb-10">Terms of Service</h1>
          <p className="text-xs text-muted mb-8">Last updated: March 2026</p>

          <div className="space-y-8 text-sm text-muted leading-relaxed">
            <section>
              <h2 className="font-heading text-lg text-dark mb-3">1. Booking & Payment</h2>
              <p>Booking through our website requires payment in full via Stripe to secure your dates. Your reservation is confirmed once payment is successfully processed.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>All prices are listed in USD and include applicable taxes unless stated otherwise</li>
                <li>Payment is processed securely through Stripe. ANEW does not store your credit card information</li>
                <li>A confirmation email will be sent upon successful payment</li>
                <li>Final pricing is confirmed after consultation for custom packages</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">2. Booking & Cancellation Policy</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reservations require a minimum of 3 days advance notice</li>
                <li>All bookings are non-refundable once payment has been processed</li>
                <li>Date changes may be accommodated based on availability at no additional charge</li>
                <li>Weather-related issues are handled on a case-by-case basis</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">3. Disputes</h2>
              <p>If you believe a charge is incorrect, contact us at <a href="mailto:hello@anewretreatandspa.com" className="text-dark underline hover:text-accent">hello@anewretreatandspa.com</a> before filing a dispute with your bank. We are committed to resolving billing issues promptly and directly.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">4. Property Use</h2>
              <p>Guests and event attendees agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Respect the property, grounds, and natural surroundings</li>
                <li>Comply with noise restrictions (amplified music until 10 PM)</li>
                <li>No smoking on the property</li>
                <li>Not exceed the agreed-upon guest count</li>
                <li>Follow all house guidelines provided at booking confirmation</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">5. Liability</h2>
              <p>ANEW is not liable for personal injury, property damage, or loss of belongings during your event or stay. Guests assume responsibility for their party and any damage caused to the property beyond normal wear and tear.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">6. Vendors</h2>
              <p>Outside vendors are welcome but must be approved by ANEW prior to the event. All vendors must carry their own liability insurance. ANEW maintains a preferred vendor list available upon request.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">7. User Accounts</h2>
              <p>You are responsible for maintaining the security of your account credentials. ANEW reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">8. Chef Bookings</h2>
              <p>Private chef bookings are subject to chef availability and confirmation. Pricing is based on per-person rates and may vary based on menu customization. Dietary accommodations should be communicated at the time of booking.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">9. Changes to Terms</h2>
              <p>ANEW reserves the right to update these terms at any time. Continued use of the website after changes constitutes acceptance of the updated terms.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">10. Contact</h2>
              <p>For questions about these terms, contact us at <a href="mailto:hello@anewretreatandspa.com" className="text-dark underline hover:text-accent">hello@anewretreatandspa.com</a>.</p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
