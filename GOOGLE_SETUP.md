# Google Service Account Setup für Netlify

## Problem: "invalid_grant: account not found"

Dieser Fehler tritt auf, wenn die Google Service Account Credentials nicht korrekt konfiguriert sind.

## Lösung: Schritt-für-Schritt Anleitung

### 1. Service Account erstellen (Google Cloud Console)

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Wähle dein Projekt aus oder erstelle ein neues
3. Navigiere zu **IAM & Admin** > **Service Accounts**
4. Klicke auf **CREATE SERVICE ACCOUNT**
5. Gib einen Namen ein (z.B. "netlify-sheets-sync")
6. Klicke auf **CREATE AND CONTINUE**
7. Wähle die Rolle **Editor** (oder nur **Sheets Editor** für minimale Berechtigungen)
8. Klicke auf **CONTINUE** und dann **DONE**

### 2. Service Account Key herunterladen

1. Klicke auf den neu erstellten Service Account
2. Gehe zum Tab **KEYS**
3. Klicke auf **ADD KEY** > **Create new key**
4. Wähle **JSON** als Key-Typ
5. Klicke auf **CREATE**
6. Die JSON-Datei wird automatisch heruntergeladen

### 3. JSON-Datei öffnen

Die heruntergeladene JSON-Datei hat folgendes Format:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "netlify-sheets-sync@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 4. Umgebungsvariablen in Netlify setzen

Gehe zu deiner Netlify Site: **Site Settings** > **Build & Deploy** > **Environment Variables**

#### GOOGLE_SERVICE_ACCOUNT_EMAIL

- **Key**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Value**: Der Wert von `client_email` aus der JSON-Datei
- Beispiel: `netlify-sheets-sync@your-project.iam.gserviceaccount.com`

#### GOOGLE_PRIVATE_KEY

- **Key**: `GOOGLE_PRIVATE_KEY`
- **Value**: Der komplette Wert von `private_key` aus der JSON-Datei

**WICHTIG**: Den Private Key **genau so kopieren**, wie er in der JSON-Datei steht, **einschließlich**:

- `-----BEGIN PRIVATE KEY-----\n`
- Alle Zeilen mit `\n` am Ende
- `-----END PRIVATE KEY-----\n`

**Beispiel** (gekürzt):

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...\n-----END PRIVATE KEY-----\n
```

**Häufige Fehler:**

- ❌ Die `\n` durch echte Zeilenumbrüche ersetzen (in Netlify bleiben die `\n` als Text!)
- ❌ Den Anfang oder das Ende des Keys vergessen
- ❌ Anführungszeichen am Anfang/Ende hinzufügen
- ✅ **Richtig**: Genau den Text zwischen den Anführungszeichen aus der JSON kopieren

#### GOOGLE_SHEET_ID

- **Key**: `GOOGLE_SHEET_ID`
- **Value**: Die ID deines Google Spreadsheets

Die Sheet-ID findest du in der URL deines Spreadsheets:

```
https://docs.google.com/spreadsheets/d/HIER_IST_DIE_ID/edit
```

### 5. Google Spreadsheet freigeben

1. Öffne dein Google Spreadsheet
2. Klicke auf **Share** (Teilen)
3. Füge die `client_email` (Service Account E-Mail) hinzu
4. Gib der E-Mail **Editor**-Rechte
5. Klicke auf **Share** / **Send**

**Beispiel E-Mail**: `netlify-sheets-sync@your-project.iam.gserviceaccount.com`

### 6. API aktivieren

Stelle sicher, dass die Google Sheets API in deinem Google Cloud Project aktiviert ist:

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Navigiere zu **APIs & Services** > **Library**
3. Suche nach "Google Sheets API"
4. Klicke auf **ENABLE**, falls noch nicht aktiviert

### 7. Testen

1. Gehe zu Netlify: **Deploys** > **Trigger deploy** > **Clear cache and deploy site**
2. Warte auf den Deploy
3. Überprüfe die Function Logs unter **Functions** > `sync-booking`

### Debugging

Wenn der Fehler weiterhin auftritt, überprüfe die Logs in Netlify. Die Funktion gibt jetzt zusätzliche Debug-Informationen aus:

- Service Account Email
- Anfang des Private Keys (erste 50 Zeichen)
- Ende des Private Keys (letzte 50 Zeichen)

**Vergleiche diese Werte** mit deiner JSON-Datei, um sicherzustellen, dass alles korrekt übertragen wurde.

## Alternative: Umgebungsvariablen als Base64

Falls das Problem weiterhin besteht, kannst du die gesamte JSON-Datei als Base64-String speichern:

### Lokale Kodierung

```bash
cat your-service-account-key.json | base64
```

### In Netlify

- **Key**: `GOOGLE_SERVICE_ACCOUNT_BASE64`
- **Value**: Der Base64-String

### Im Code ändern

```typescript
// Dekodiere Base64
const serviceAccountJson = Buffer.from(
  Netlify.env.get('GOOGLE_SERVICE_ACCOUNT_BASE64'),
  'base64'
).toString('utf-8')

const credentials = JSON.parse(serviceAccountJson)

const serviceAccountAuth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: SCOPES,
})
```

## Weitere Hilfe

Bei weiteren Problemen:

1. Überprüfe die [Google Auth Library Dokumentation](https://github.com/googleapis/google-auth-library-nodejs)
2. Überprüfe die [google-spreadsheet Dokumentation](https://theoephraim.github.io/node-google-spreadsheet/)
