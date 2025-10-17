# Astro Starter Kit: Blog

```sh
npm create astro@latest -- --template blog
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/blog)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/blog/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![blog](https://github.com/withastro/astro/assets/2244813/ff10799f-a816-4703-b967-c78997e8323d)

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## � Environment Variables

The following environment variables need to be configured for the application to work properly:

### Required Variables

| Variable                        | Description                                                  | Example                           |
| :------------------------------ | :----------------------------------------------------------- | :-------------------------------- |
| `PUBLIC_CONVEX_URL`            | Convex database URL                                          | `https://xxx.convex.cloud`        |
| `GOOGLE_SHEET_ID`              | Google Spreadsheet ID for booking sync                       | `1y_-G-GcrR_70YL3B1pOFRFiVK...`   |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Service Account email for JWT authentication          | `service@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY`           | Google Service Account private key (include `\n` for newlines) | `-----BEGIN PRIVATE KEY-----\n...` |
| `POSTMARK_API_TOKEN`           | Postmark API token for sending emails                        | `xxxx-xxxx-xxxx-xxxx`             |
| `NETLIFY_EMAILS_SECRET`        | Secret key for Netlify email services                        | Generated with `openssl rand -hex 32` |
| `BREVO_API_KEY`                | Brevo (formerly Sendinblue) API key                         | `xkeysib-xxxxx`                   |

### Setting up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new service account or use an existing one
3. Download the JSON key file
4. Extract the `client_email` and `private_key` values
5. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` to the `client_email` value
6. Set `GOOGLE_PRIVATE_KEY` to the `private_key` value (make sure to keep the `\n` characters)
7. Share your Google Spreadsheet with the service account email address

### Local Development

Create a `.env` file in the root of the project with the above variables.

### Production (Netlify)

Add the environment variables in the Netlify dashboard:

1. Go to Site Settings > Build & Deploy > Environment
2. Add each variable with its corresponding value

## �👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
