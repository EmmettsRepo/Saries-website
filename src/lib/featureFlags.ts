/**
 * Feature flags. Flip these to true to re-enable.
 * Source code for disabled features stays intact for fast revival.
 */
export const FEATURES = {
  /**
   * Boutique store. Hidden until product photos + inventory pipeline are ready.
   * When enabled: shows in Navbar/Footer, /boutique route renders, booking flow
   * shows boutique add-ons section.
   */
  BOUTIQUE: false,

  /**
   * Real Hospitable availability data (central hub for Airbnb, VRBO, direct).
   * When false, AvailabilityCalendar shows mock seeded data.
   * Flip to true once HOSPITABLE_API_TOKEN is set in env and the
   * getAvailability Cloud Function is deployed.
   */
  HOSPITABLE_LIVE: false,
} as const;
