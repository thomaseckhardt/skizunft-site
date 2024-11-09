export default `<mjml>
  <mj-head>
    <mj-title>Say hello to card</mj-title>
    <mj-attributes>
      <mj-all font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"></mj-all>
      <mj-text font-weight="400" font-size="16px" color="#000000" line-height="24px"></mj-text>
      <mj-section padding="0px"></mj-section>
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f9fafb">
    <mj-section padding="10px 0 20px 0">
      <mj-column>
        <mj-text align="center" color="#9B9B9B" font-size="11px">
          Wir freuen uns auf Dich und deine Familie.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="20px 20px 0 20px" background-color="#FFFFFF" border-radius="16px 16px 0px 0px">
      <mj-column width="50%">
        <mj-image src="https://deploy-preview-1--skizunftkollnau.netlify.app/mailing/logo-skizunft-mailing.png" alt="Skizunft Kollnau" width="62px" height="48px" padding="0px" align="left"></mj-image>
      </mj-column>
      <mj-column width="50%">
        <mj-image src="https://deploy-preview-1--skizunftkollnau.netlify.app/mailing/dsv-skischule-kollnau-mailing.png" alt="DSV-Skischule Skizunft Kollnau" width="194px" height="36px" padding="0px" align="right"></mj-image>
      </mj-column>
    </mj-section>
    <mj-section padding="20px 20px 0 20px" background-color="#FFFFFF">
      <mj-column>
        <mj-text align="center" font-weight="500" font-size="24px" line-height="32px" padding="40px 25px 10px 25px">
          Vielen Dank {{firstName}}!
        </mj-text>
        <mj-text align="center" font-weight="300" font-size="24px" line-height="32px" padding="10px 25px 40px 25px">
          Deine Buchung f&uuml;r unsere Ski- und Snowboardkurse ist
          best&auml;tigt.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#FFFFFF">
      <mj-column width="100%">
        <mj-text font-weight="300" font-size="24px" line-height="32px">
          Buchungs&uuml;bersicht
        </mj-text>
      </mj-column>
      {{#each attendees}}
        <mj-column width="100%">
          <mj-text padding="5px 25px" font-weight="600" font-size="14px" line-height="20px">
            {{firstName}} {{lastName}} ({{age}} Jahre)
          </mj-text>
          {{#each courses}}
            <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px">
              {{name}} am {{date}}
            </mj-text>
          {{/each}}
          <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px" align="right">
            {%if member %}Vereinsmitglied {% endif %} {{price}}
          </mj-text>
          <mj-divider border-width="1px" border-color="lightgrey" />
        </mj-column>
      {{/each}}
    </mj-section>
    <mj-section background-color="#FFFFFF">
      <mj-column width="70%">
        <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px" align="right">
          Zwischensumme
        </mj-text>
      </mj-column>
      <mj-column width="30%">
        <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px" align="right">
          {{subtotal}}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#FFFFFF">
      <mj-column width="70%">
        <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px" align="right">
          Rabatt
        </mj-text>
      </mj-column>
      <mj-column width="30%">
        <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px" align="right">
          {{discount}}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#FFFFFF">
      <mj-column width="70%">
        <mj-text padding="5px 25px" font-weight="600" font-size="14px" line-height="20px" align="right">
          F&auml;lliger Betrag
        </mj-text>
      </mj-column>
      <mj-column width="30%">
        <mj-text padding="5px 25px" font-weight="600" font-size="24px" line-height="32px" align="right">
          {{price}}
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="25px">
      <mj-column padding="20px 25px" border="1px solid #0284c7" background-color="#f0f9ff" border-radius="4px">
        <mj-text font-weight="400" font-size="16px" line-height="24px" color="#0369a1">
          <p style="margin-top: 0">
            Bitte &uuml;berweise den f&auml;lligen Betrag bis sp&auml;testens
            <span style="font-weight: 600">5&nbsp;Tage</span> vor Kursbeginn auf
            unser Bankkonto.
          </p>
          <p style="font-weight: 600">IBAN: DE61680501010012099212</p>
          <p style="font-weight: 600">
            Verwendungszweck:<br />
            {{orderNumber}} {{firstName}} {{lastName}}
          </p>
          <p style="margin-bottom: 0">
            Kontoinhaber: Skizunft Kollnau e.V.<br />
            Bank: Sparkasse Freiburg-N&ouml;rdlicher Breisgau<br />
            BIC: FRSPDE66XXX
          </p>
        </mj-text>
      </mj-column>
    </mj-section>


    <mj-section background-color="#FFFFFF">
      <mj-column width="100%">
        <mj-text font-weight="300" font-size="24px" line-height="32px">
          Kundeninformationen
        </mj-text>
      </mj-column>
      <mj-column width="50%">
        <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px">
          {{firstName}} {{lastName}}<br />
          {{address}}<br />
          {{zip}} {{city}}<br />
          {{country}}
        </mj-text>
      </mj-column>
      <mj-column width="50%">
        <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px">
          {{email}}<br />
          {{phone}}
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#FFFFFF" border-radius="0px 0px 16px 16px">
      <mj-column width="80%">
        <mj-text align="center" padding="50px 25px" font-weight="300">
          <p>
            Wir freuen uns auf Dich und Deine Familie und w&uuml;nschen viel
            Spa&szlig; bei unseren Kursen.
          </p>
          <p style="font-size: 24px">🙌</p>
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="10px 0 20px 0">
      <mj-column>
        <mj-text align="center" color="#9B9B9B" font-size="11px" line-height="16px">
          <p>
            <a href="https://www.szkollnau.de/impressum/" style="color: #9b9b9b">Impressum</a>&nbsp;&middot;&nbsp;<a href="https://www.szkollnau.de/datenschutz/" style="color: #9b9b9b">Datenschutz</a>
            &nbsp;&middot;&nbsp;<a href="https://www.szkollnau.de/agb/" style="color: #9b9b9b">AGB</a>
          </p>
          <p>
            Skizunft Kollnau e.V. &middot; Friedrichstr. 8a &middot; 79183
            Waldkirch<br />
            Vorsitzender: Thomas Eckhardt<br />
            Stellvtr. Vorsitzende: Sabrina Armbruster
          </p>
          <p>
            DSV-Skischule Skizunft Kollnau<br />
            Leitung: Simone Fechti und Theresa Schaller
          </p>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`