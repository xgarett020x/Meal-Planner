/**
 * SetupDropdowns.gs
 * Defines named ranges & applies dropdown validation
 */
function setupDropdowns() {
  const ss    = SpreadsheetApp.getActive();
  const recSh = ss.getSheetByName('Recipes');
  if (recSh && recSh.getLastRow() > 1) {
    ss.setNamedRange(
      'RecipesList',
      recSh.getRange(2, 1, recSh.getLastRow() - 1, 1)
    );
  }

  const ingSh = ss.getSheetByName('Ingredient Prices');
  if (ingSh && ingSh.getLastRow() > 1) {
    ss.setNamedRange(
      'IngredientsList',
      ingSh.getRange(2, 1, ingSh.getLastRow() - 1, 1)
    );
  }

  const recipeRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(ss.getRange('RecipesList'), true)
    .setAllowInvalid(false)
    .build();
  const ingRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(ss.getRange('IngredientsList'), true)
    .setAllowInvalid(false)
    .build();

  const planSh = ss.getSheetByName('Weekly Planner');
  if (planSh) {
    planSh.getRange(2, 3, planSh.getMaxRows() - 1, 1)
      .setDataValidation(recipeRule);
  }

  const shopSh = ss.getSheetByName('Shopping List');
  if (shopSh) {
    shopSh.getRange(2, 1, shopSh.getMaxRows() - 1, 1)
      .setDataValidation(ingRule);
  }
}
