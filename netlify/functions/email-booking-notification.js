export default `<mjml>
  <mj-head>
    <mj-title>Say hello to card</mj-title>
    <mj-attributes>
      <mj-all font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"></mj-all>
      <mj-text font-weight="400" font-size="16px" color="#000000" line-height="24px"></mj-text>
    </mj-attributes>
  </mj-head>
  <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            <h1>Kursbuchung #{{orderNumber}}</h1>
            <h2>{{price}}</h2>
            <p>
              <strong>{{firstName}} {{lastName}}</strong><br />
              {{address}}<br />
              {{zip}} {{city}}<br />
              {{country}}
            </p>
            <p>
              Mail: {{email}}<br />
              Phone: {{phone}}
            </p>
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section>
        <mj-column>
          <mj-table>
            <tr style="border-bottom:1px solid #999999;text-align:left;">
              <th style="padding: 5px 0px">Name</th>
              <th style="padding: 5px 0px; width: 21%;">Mitglied</th>
              <th style="padding: 5px 0px; width: 21%">Kurse</th>
              <th style="padding: 5px 0px;text-align:right; width: 22%">Gebühren</th>
            </tr>
            <mj-raw>{{#each attendees}}</mj-raw>
              <tr>
                <td style="padding: 5px 0px">{{firstName}}</td>
                <td style="padding: 5px 0px">{{#if member}}Ja{{else}}nein{{/if}}</td>
                <td style="padding: 5px 0px">{{courses.length}} Kurse</td>
                <td style="padding: 5px 0px;text-align:right;">{{price}}</td>
              </tr>
            <mj-raw>{{/each}}</mj-raw>
            <tr style="border-top:1px solid #999999;text-align:left;">
              <td style="padding: 5px 0px"></td>
              <td style="padding: 5px 0px" colspan="2">Zwischensumme</td>
              <td style="padding: 5px 0px;text-align:right;">{{subtotal}}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0px"></td>
              <td style="border-top:1px solid #ecedee;padding: 5px 0px" colspan="2">Rabatt</td>
              <td style="border-top:1px solid #ecedee;padding: 5px 0px;text-align:right;">{{discount}}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0px"></td>
              <td style="border-top:1px solid #ecedee;padding: 5px 0px;font-weight:600;" colspan="2">Fälliger Betrag</td>
              <td style="border-top:1px solid #ecedee;padding: 5px 0px;text-align:right;font-weight:600;">{{price}}</td>
            </tr>
          </mj-table>
        </mj-column>
      </mj-section>
      <mj-section>
        <mj-column>
          <mj-divider border-width="1px" border-style="dashed" border-color="lightgrey" />
        </mj-column>
      </mj-section>
      <mj-section>
        <mj-column>
          <mj-text>
            <h2><span style="color: grey">{{attendees.length}}</span> Kursteilnehmer</h2>
          </mj-text>
          <mj-raw>{{#each attendees}}</mj-raw>
            <mj-text>
              <h3>{{firstName}} {{lastName}}, <span style="font-weight:normal;">{{age}} Jahre</span></h3>
              <p>
                Mitglied: <mj-raw>{{#if member}}</mj-raw>ja<mj-raw>{{else}}</mj-raw>nein<mj-raw>{{/if}}</mj-raw><br />
                Gebühren: {{price}}
              </p>
              <p><strong>Kurse</strong></p>
              <p>
                {{#each courses}}
                  <span>{{name}} · {{date}}</span><br/>
                {{/each}}
              </p>
            </mj-text>
          <mj-raw>{{/each}}</mj-raw>
        </mj-column>
      </mj-section>
  </mj-body>
</mjml>`