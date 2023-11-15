import fs from 'fs'

const credentials = {
  type: process.env.GOOGLE_API_TYPE,
  project_id: process.env.GOOGLE_API_PROJECT_ID,
  private_key_id: process.env.GOOGLE_API_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_API_PRIVATE_KEY,
  client_email: process.env.GOOGLE_API_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_API_CLIENT_ID,
  auth_uri: process.env.GOOGLE_API_AUTH_URI,
  token_uri: process.env.GOOGLE_API_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.GOOGLE_API_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_API_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_API_UNIVERSE_DOMAIN,
}

fs.writeFileSync(
  'google-api-credentials.json',
  JSON.stringify(credentials, null, 2),
)
