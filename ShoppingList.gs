/**
 * ShoppingList.gs
 * Ensures checkboxes and builds the shopping list
 */

function ensureShoppingListCheckboxes() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('Shopping List');
  if (!sh) return;

  if (sh.getRange(1, 7).getValue() !== 'Purchased') {
    sh.insertColumnAfter(6);
    sh.getRange(1, 7).setValue('Purchased');
    const rule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .build();
    sh.getRange(2, 7, sh.getMaxRows() - 1, 1).setDataValidation(rule);
  }
}

function generateShoppingList() {
  const ss    = SpreadsheetApp.getActive();
  const recSh = ss.getSheetByName('Recipes');
  const plan  = ss.getSheetByName('Weekly Planner');
  const shop  = ss.getSheetByName('Shopping List');
  if (!recSh || !plan || !shop) return;

  const n = plan.getLastRow() - 1;
  if (n < 1) return;
  const picks = plan.getRange(2, 3, n, 1).getValues().flat();

  const recLast     = recSh.getLastRow() - 1;
  if (recLast < 1) return;
  const recData     = recSh.getRange(2, 1, recLast, 5).getValues();
  const qtyDisplay  = recSh.getRange(2, 3, recLast, 1).getDisplayValues().flat();
  const unitDisplay = recSh.getRange(2, 4, recLast, 1).getDisplayValues().flat();

  const tally = {};
  recData.forEach((row, i) => {
    const [recipeName, ingredient] = row;
    if (picks.includes(recipeName)) {
      let qty  = parseFraction(qtyDisplay[i]);
      let unit = unitDisplay[i] || '';
      if (qty === 0) {
        const alt = parseFraction(unitDisplay[i]);
        if (alt > 0) {
          qty = alt;
          unit = unitDisplay[i].replace(/^[\d\s\/\.\-½¼¾]+/, '').trim();
        }
      }
      if (!tally[ingredient]) tally[ingredient] = { qty: 0, unit };
      tally[ingredient].qty += qty;
    }
  });

  shop.getRange(2, 1, shop.getMaxRows() - 1, 6).clearContent();
  let row = 2;
  const retailer = 'walmart_us';
  for (const ing in tally) {
    const { qty, unit } = tally[ing];
    const price = fetchPriceFromIDP(retailer, ing) || 0;
    const total = price * qty;
    shop.getRange(row++, 1, 1, 6).setValues([[
      ing,
      formatFraction(qty),
      unit,
      retailer,
      price ? '$' + price.toFixed(2) : 'N/A',
      total ? '$' + total.toFixed(2) : 'N/A'
    ]]);
  }
}
