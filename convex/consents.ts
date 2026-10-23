import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { assertAdminSecret } from './adminSecret'

const category = v.union(v.literal('necessary'), v.literal('maps'))

/**
 * Appends a consent of the cookie consent banner to the consent log. Only
 * the consent log endpoint calls this, after it validated the consent.
 * Entries are never changed, so every change of a consent is a new entry.
 */
export const log = mutation({
  args: {
    secret: v.string(),
    consent: v.object({
      consentId: v.string(),
      action: v.union(v.literal('firstConsent'), v.literal('change')),
      revision: v.number(),
      consentTimestamp: v.string(),
      lastConsentTimestamp: v.string(),
      acceptedCategories: v.array(category),
      rejectedCategories: v.array(category),
    }),
  },
  handler: async (ctx, args) => {
    assertAdminSecret(args.secret)
    await ctx.db.insert('consents', args.consent)
  },
})

/**
 * Deletes the entries of the consent log three years after the end of the
 * year they were created in, as stated in the privacy policy. Runs daily
 * (convex/crons.ts) and deletes in batches, so a backlog shrinks over a few
 * runs.
 */
export const deleteExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.UTC(new Date().getUTCFullYear() - 3, 0, 1)
    const expired = await ctx.db
      .query('consents')
      .withIndex('by_creation_time', (q) => q.lt('_creationTime', cutoff))
      .take(500)
    for (const entry of expired) await ctx.db.delete(entry._id)
  },
})

/** All entries of one consent id, oldest first, e.g. for an inquiry. */
export const byConsentId = query({
  args: { secret: v.string(), consentId: v.string() },
  handler: async (ctx, args) => {
    assertAdminSecret(args.secret)
    return await ctx.db
      .query('consents')
      .withIndex('by_consentId', (q) => q.eq('consentId', args.consentId))
      .collect()
  },
})
