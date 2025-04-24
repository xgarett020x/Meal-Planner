/**
 * SyncPrices.gs
 * Syncs new ingredient→unit pairs from Recipes into Ingredient Prices
 */
function populateIngredientPrices() {
  const ss      = SpreadsheetApp.getActive();
  const recSh   = ss.getSheetByName('Recipes');
  const priceSh = ss.getSheetByName('Ingredient Prices');
  if (!recSh || !priceSh) return;

  const recLast = recSh.getLastRow();
  if (recLast < 2) return;

  const recs = recSh.getRange(2, 2, recLast - 1, 3).getValues();
  const unitMap = {};
  recs.forEach(([ing, , unit]) => {
    if (ing && unit && !unitMap[ing]) unitMap[ing] = unit;
  });

  const priceLast = priceSh.getLastRow();
  const priceData = priceLast > 1
    ? priceSh.getRange(2, 1, priceLast - 1, 4).getValues()
    : [];
  const exist = new Set(), pos = {};
  priceData.forEach((row, i) => {
    exist.add(row[0]);
    pos[row[0]] = i + 2;
  });

  const toAppend = [];
  Object.keys(unitMap).forEach(ing => {
    if (exist.has(ing)) {
      const r = pos[ing];
      if (!priceSh.getRange(r, 4).getValue()) {
        priceSh.getRange(r, 4).setValue(unitMap[ing]);
      }
    } else {
      toAppend.push([ing, '', '', unitMap[ing]]);
    }
  });

  if (toAppend.length) {
    priceSh.getRange(priceLast + 1, 1, toAppend.length, 4)
      .setValues(toAppend);
  }
}
