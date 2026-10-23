/**
 * Consent categories of the cookie consent banner. `necessary` is always
 * accepted; `maps` covers the MapTiler maps of the meeting points.
 */
export const consentCategories = ['necessary', 'maps'] as const

export type ConsentCategory = (typeof consentCategories)[number]

/**
 * Revision of the consent texts and categories. Raise it whenever they
 * change in a way that needs a new consent: every visitor is asked again,
 * and the consent log tells which revision someone agreed to.
 */
export const consentRevision = 1

/** Path of the endpoint that stores each consent in the consent log. */
export const consentLogPath = '/einwilligung'
