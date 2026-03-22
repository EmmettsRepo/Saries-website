"use client";

import AnimatedSection from "@/components/AnimatedSection";

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-28 px-6">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Legal</p>
          <h1 className="font-heading text-4xl text-dark font-normal mb-10">Privacy Policy</h1>
          <p className="text-xs text-muted mb-8">Last updated: March 2026</p>

          <div className="space-y-8 text-sm text-muted leading-relaxed">
            <section>
              <h2 className="font-heading text-lg text-dark mb-3">1. Information We Collect</h2>
              <p>When you use our website, create an account, or submit a booking, we may collect the following information:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Name, email address, and phone number</li>
                <li>Event details (type, guest count, preferred dates, special requests)</li>
                <li>Account credentials (email and encrypted password)</li>
                <li>Payment information (processed securely by Stripe — we never see or store your full card number)</li>
                <li>Usage data (pages visited, time on site)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Respond to your booking inquiries and tour requests</li>
                <li>Manage your account and booking history</li>
                <li>Communicate with you about your events and reservations</li>
                <li>Improve our website and services</li>
                <li>Send relevant updates about ANEW (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">3. Payment Processing</h2>
              <p>All payments are processed by <a href="https://stripe.com/privacy" className="text-dark underline hover:text-accent" target="_blank" rel="noopener noreferrer">Stripe, Inc.</a> When you make a payment, your card details are sent directly to Stripe and are never stored on our servers. Stripe may collect additional information as described in their privacy policy. We receive only a payment confirmation, transaction ID, and the last four digits of your card.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">4. Data Storage & Security</h2>
              <p>Your data is stored securely using Google Firebase services, which employs industry-standard encryption and security measures. We do not sell, trade, or share your personal information with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
              </ul>
              <p className="mt-2">You can delete your account at any time from your profile settings.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">6. Cookies</h2>
              <p>We use essential cookies for authentication and site functionality. We do not use tracking cookies for advertising purposes.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-dark mb-3">7. Contact</h2>
              <p>For privacy-related inquiries, contact us at <a href="mailto:info@anew-estate.com" className="text-dark underline hover:text-accent">info@anew-estate.com</a> or call <a href="tel:+14255550199" className="text-dark underline hover:text-accent">(425) 555-0199</a>.</p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
