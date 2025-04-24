/**
 * MealCosts.gs
 * Calculates per‐recipe cost in Weekly Planner col D
 */
function calculateMealCosts() {
  const ss    = SpreadsheetApp.getActive();
  const recSh = ss.getSheetByName('Recipes');
  const plan  = ss.getSheetByName('Weekly Planner');
  if (!recSh || !plan) return;

  const numRows = plan.getLastRow() - 1;
  if (numRows < 1) return;
  const picks = plan.getRange(2, 3, numRows, 1).getValues().flat();
  const recipeData = recSh.getDataRange().getValues();
  const retailer = 'walmart_us';

  picks.forEach((recipeName, idx) => {
    let total = 0;
    if (recipeName) {
      recipeData.slice(1).forEach(row => {
        const [name, ingredient, qtyRaw] = row;
        if (name === recipeName) {
          const qty   = parseFraction(qtyRaw);
          const price = fetchPriceFromIDP(retailer, ingredient) || 0;
          total += price * qty;
        }
      });
    }
    plan.getRange(idx + 2, 4)
        .setValue(total ? '$' + total.toFixed(2) : 'N/A');
  });
}
