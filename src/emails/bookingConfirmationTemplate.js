export default `<mjml>
  <mj-head>
    <mj-title>Deine Buchung ist bestätigt</mj-title>
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
        <mj-image src="https://www.szkollnau.de/mailing/logo-skizunft-mailing.png" alt="Skizunft Kollnau" width="62px" height="48px" padding="0px" align="left"></mj-image>
      </mj-column>
      <mj-column width="50%">
        <mj-image src="https://www.szkollnau.de/mailing/dsv-skischule-kollnau-mailing.png" alt="DSV-Skischule Skizunft Kollnau" width="194px" height="36px" padding="0px" align="right"></mj-image>
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
      <mj-raw>{{#each attendees}}</mj-raw>
        <mj-column width="100%">
          <mj-text padding="5px 25px" font-weight="600" font-size="14px" line-height="20px">
            {{firstName}} {{lastName}} ({{age}} Jahre)
          </mj-text>
          <mj-raw>{{#each courses}}</mj-raw>
            <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px">
              {{name}} am {{date}}
            </mj-text>
          <mj-raw>{{/each}}</mj-raw>
          <mj-text padding="5px 25px" font-weight="400" font-size="14px" line-height="20px" align="right">
            {{#if member}}Vereinsmitglied {{/if}} {{price}}
          </mj-text>
          <mj-divider border-width="1px" border-color="lightgrey" />
        </mj-column>
      <mj-raw>{{/each}}</mj-raw>
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

    <mj-wrapper background-color="#ffffff" padding="25px">
      <mj-section border="1px solid #0284c7" background-color="#f0f9ff" border-radius="4px" padding="20px 0">
        <mj-column width="62%">
          <mj-text font-weight="400" font-size="16px" line-height="24px" color="#0369a1">
            <p style="margin-top: 0">
              {{#if payment.hasDueDate}}
                {{#if payment.dueDate}}
                  Bitte &uuml;berweise <span style="font-weight: 600">{{price}}</span>
                  bis sp&auml;testens <span style="font-weight: 600">{{payment.dueDate}}</span>.
                {{else}}
                  Dein Kurs beginnt bald. Bitte &uuml;berweise
                  <span style="font-weight: 600">{{price}}</span> umgehend.
                {{/if}}
              {{else}}
                Bitte &uuml;berweise den f&auml;lligen Betrag bis sp&auml;testens
                <span style="font-weight: 600">{{payment.daysBeforeCourse}}&nbsp;Tage</span>
                vor Kursbeginn.
              {{/if}}
            </p>
            <p>
              Empf&auml;nger<br />
              <span style="font-weight: 600">{{payment.accountHolder}}</span>
            </p>
            <p>
              IBAN<br />
              <span style="font-weight: 600">{{payment.iban}}</span>
            </p>
            <p>
              Verwendungszweck<br />
              <span style="font-weight: 600">{{payment.reference}}</span>
            </p>
            <p style="margin-bottom: 0; font-size: 13px; line-height: 20px">
              {{payment.bankName}}<br />
              BIC: {{payment.bic}}
            </p>
          </mj-text>
        </mj-column>
        <mj-column width="38%" vertical-align="middle">
          <mj-raw>{{#if payment.giroCodeUrl}}</mj-raw>
          <mj-image src="{{payment.giroCodeUrl}}" alt="GiroCode f&uuml;r die &Uuml;berweisung" width="150px" height="150px" padding="10px 25px 0 25px"></mj-image>
          <mj-text align="center" font-size="12px" line-height="16px" color="#0369a1" padding="8px 25px 0 25px">
            Mit deiner Banking-App scannen
          </mj-text>
          <mj-raw>{{/if}}</mj-raw>
        </mj-column>
      </mj-section>
    </mj-wrapper>

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

    <mj-section background-color="#FFFFFF">
      <mj-column width="100%">
        <mj-text padding="25px 25px 0 25px" font-size="13px" line-height="20px" color="#6b7280">
          F&uuml;r diese Buchung besteht kein Widerrufsrecht (&sect;&nbsp;312g
          Abs.&nbsp;2 Nr.&nbsp;9 BGB). Die Bedingungen f&uuml;r eine Stornierung
          findest du in Ziffer&nbsp;9 unserer
          <a href="https://www.szkollnau.de/agb/#stornierung" style="color: #6b7280">AGB</a>.
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
            <a href="https://www.szkollnau.de/kontakt/" style="color: #9b9b9b">Impressum</a>&nbsp;&middot;&nbsp;<a href="https://www.szkollnau.de/datenschutz/" style="color: #9b9b9b">Datenschutz</a>
            &nbsp;&middot;&nbsp;<a href="https://www.szkollnau.de/agb/" style="color: #9b9b9b">AGB</a>
          </p>
          <p>
            Skizunft Kollnau e.V. &middot; Friedrichstr. 8a &middot; 79183
            Waldkirch<br />
            Amtsgericht Freiburg VR&nbsp;280033 &middot; vertreten durch den
            Vorstand<br />
            <a href="mailto:info@szkollnau.de" style="color: #9b9b9b">info@szkollnau.de</a>
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