import type { Context } from '@netlify/functions';
import { createTransport, getTestMessageUrl } from 'nodemailer';
import { nodemailerMjmlPlugin } from 'nodemailer-mjml';
import { join } from 'path';

// type RequestBody = {
//   postalCode: string;
//   name: string;
//   email: string;
//   phone: string;
//   message: string;
//   occupationalGroup: string;
//   originalSourceFirstPerson: string;
//   preferredLanguage: string;
//   language: string;
//   locale: string;
//   newsletter: boolean;
//   appointment: boolean;
//   url: string;
// };

export default async (req: Request) => {
  const isDev = !(Netlify.env.get('PUBLIC_SMTP_VERSION') === 'production');
  console.log('Hello', __dirname);
  console.log('Netlify: send confirmation', req);

  if (!req) {
    return Response.json({ error: 'Payload required' }, { status: 400 });
  }
  let reqBody;

  try {
    reqBody = await req.json();
  } catch (e) {
    return Response.json(
      { error: 'Invalid JSON', message: e.message },
      { status: 400 }
    );
  }

  console.log('Netlify: send confirmation JSON', reqBody);

  if (!reqBody.email) {
    return Response.json(
      { error: 'Recipient email required' },
      { status: 400 }
    );
  }

  const host = isDev
    ? Netlify.env.get('SMTP_TEST_HOST')
    : Netlify.env.get('SMTP_HOST');
  const port = isDev
    ? parseInt(String(Netlify.env.get('SMTP_TEST_PORT')))
    : parseInt(String(Netlify.env.get('SMTP_PORT')));
  const user = isDev
    ? Netlify.env.get('SMTP_TEST_USER')
    : Netlify.env.get('SMTP_USER');
  const pass = isDev
    ? Netlify.env.get('SMTP_TEST_PASS')
    : Netlify.env.get('SMTP_PASS');
  const mailFrom = isDev
    ? Netlify.env.get('SMTP_TEST_FROM')
    : Netlify.env.get('SMTP_FROM');
  const mailNotification = isDev
    ? Netlify.env.get('SMTP_TEST_NOTIFICATION')
    : Netlify.env.get('SMTP_NOTIFICATION');
  const mailReply = isDev
    ? Netlify.env.get('SMTP_TEST_REPLY')
    : Netlify.env.get('SMTP_REPLY');

  const transportConfig = {
    pool: true,
    host,
    port,
    // NOTE: secure=true leads to an SSL3 error. Therefore leave deactivated.
    // secure: true,
    auth: {
      user,
      pass
    },
    ...(isDev
      ? {
          logger: true,
          debug: true
        }
      : {})
  };
  console.log('transportConfig', transportConfig);
  const transport = createTransport(transportConfig);
  transport.use(
    'compile',
    nodemailerMjmlPlugin({
      templateFolder: join(__dirname, '../../../emails/emails')
    })
  );

  let connectionTest = undefined;
  transport.verify(function (error, success) {
    if (error) {
      connectionTest = error;
      console.error('Server connection error', error);
    } else {
      connectionTest = success;
      console.log('Server is ready to take our messages');
    }
  });
  console.log('connectionTest', connectionTest);

  const email = {
    from: '"Skizunft Kollnau" <buchung@szkollnau.de>',
    to: reqBody.email,
    replyTo: '"Skizunft Kollnau" <info@szkollnau.de>',
    subject: `Deine Buchung ist bestätigt 🥳 #${reqBody.orderNumber}`,
    templateName: 'booking-confirmation',
    templateData: reqBody
  };
  const sendEmail = async () => {
    return await transport.sendMail(email);
  };
  const info = await sendEmail();

  const previewUrl = getTestMessageUrl(info);

  console.log('Preview User: ' + previewUrl);

  return Response.json(
    {
      previewUrl
    },
    { status: 200 }
  );
};
