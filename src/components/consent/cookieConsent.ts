import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import './cookieConsent.css'
import {
  consentLogPath,
  consentRevision,
  type ConsentCategory,
} from '@/data/consent'
import type { ConsentAction } from '@/server/consent/parseConsentLog'

/**
 * Cookie consent (https://cookieconsent.orestbida.com), self-hosted.
 * Every consent and every change of it is sent to the consent log together
 * with the consent id that CookieConsent stores in its cookie.
 *
 * The only service that needs consent are the maps of the meeting points,
 * which ask for it in their own placeholder. So the banner doesn't show on
 * its own; the preferences open from the footer link on every page. Set
 * `autoShow` to true once a service runs on every page.
 */

const logConsent = (action: ConsentAction, cookie: CookieConsent.CookieValue) => {
  fetch(consentLogPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Visitors may leave the page right after their choice.
    keepalive: true,
    body: JSON.stringify({
      consentId: cookie.consentId,
      action,
      revision: cookie.revision,
      consentTimestamp: cookie.consentTimestamp,
      lastConsentTimestamp: cookie.lastConsentTimestamp,
      acceptedCategories: cookie.categories,
    }),
  }).catch((error) => console.error('[CookieConsent]', error))
}

/** Shows the consent id in the preferences, so visitors can refer to it. */
const showConsentId = () => {
  const consentId = CookieConsent.validConsent()
    ? CookieConsent.getCookie('consentId')
    : 'noch keine Einwilligung erteilt'
  document
    .querySelectorAll('[data-consent-id]')
    .forEach((element) => (element.textContent = consentId))
}

/** Resolves once the stored consent has been read. */
export const consentReady = CookieConsent.run({
  autoShow: false,
  revision: consentRevision,
  cookie: { name: 'cc_cookie', expiresAfterDays: 182 },
  guiOptions: {
    consentModal: {
      layout: 'box',
      position: 'bottom right',
      equalWeightButtons: true,
    },
    preferencesModal: { layout: 'box', equalWeightButtons: true },
  },
  onFirstConsent: ({ cookie }) => logConsent('firstConsent', cookie),
  onChange: ({ cookie }) => logConsent('change', cookie),
  onModalShow: ({ modalName }) => {
    if (modalName === 'preferencesModal') showConsentId()
  },
  categories: {
    necessary: { enabled: true, readOnly: true },
    maps: {},
  } satisfies Record<ConsentCategory, CookieConsent.Category>,
  language: {
    default: 'de',
    translations: {
      de: {
        consentModal: {
          title: 'Karten auf unserer Website',
          description:
            'Wir verwenden keine Tracking- oder Werbe-Cookies. Für die Karten unserer Treffpunkte laden wir Kartendaten von MapTiler. Dabei wird deine IP-Adresse an MapTiler übertragen. Das machen wir nur, wenn du einverstanden bist. Du kannst deine Auswahl jederzeit über „Cookie-Einstellungen“ unten auf der Seite ändern. {{revisionMessage}}',
          revisionMessage:
            '<br><br>Seit deinem letzten Besuch haben sich unsere Hinweise geändert. Bitte triff deine Auswahl erneut.',
          acceptAllBtn: 'Alle akzeptieren',
          acceptNecessaryBtn: 'Nur notwendige',
          showPreferencesBtn: 'Einstellungen',
          footer:
            '<a href="/datenschutz">Datenschutz</a><a href="/kontakt">Impressum</a>',
        },
        preferencesModal: {
          title: 'Cookie-Einstellungen',
          acceptAllBtn: 'Alle akzeptieren',
          acceptNecessaryBtn: 'Nur notwendige',
          savePreferencesBtn: 'Auswahl speichern',
          closeIconLabel: 'Schließen',
          sections: [
            {
              description:
                'Hier legst du fest, welche externen Dienste wir laden dürfen. Mehr dazu in unserer <a href="/datenschutz">Datenschutzerklärung</a>.',
            },
            {
              title: 'Notwendig',
              description:
                'Speichert deine Auswahl (Cookie „cc_cookie“, 6 Monate). Ohne sie müssten wir dich bei jedem Besuch erneut fragen.',
              linkedCategory: 'necessary',
            },
            {
              title: 'Karten (MapTiler)',
              description:
                'Zeigt die Treffpunkte unserer Skikurse auf einer Karte. Beim Laden der Karte wird deine IP-Adresse an die MapTiler AG (Schweiz) übertragen.',
              linkedCategory: 'maps',
            },
            {
              title: 'Deine Einwilligungs-ID',
              description:
                'Mit dieser ID können wir deine Einwilligung nachweisen. Gib sie an, wenn du uns zu deiner Einwilligung kontaktierst: <code data-consent-id></code>',
            },
          ],
        },
      },
    },
  },
})

export const hasConsent = (category: ConsentCategory) =>
  CookieConsent.acceptedCategory(category)

/** Adds a category to the categories accepted so far. */
export const acceptConsent = (category: ConsentCategory) =>
  CookieConsent.acceptCategory([
    ...CookieConsent.getUserPreferences().acceptedCategories,
    category,
  ])
