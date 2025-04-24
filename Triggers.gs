/**
 * Triggers.gs
 * Entry‐point triggers, sidebar launcher, and master rebuild routine
 */

// onOpen: add custom menu with “Add Recipe…” and “Refresh All”
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Dinner Planner')
    .addItem('Add Recipe…', 'showSidebar')
    .addSeparator()
    .addItem('Refresh All', 'refreshAll')
    .addToUi();
}

// showSidebar: load Sidebar.html into the Sheets sidebar
function showSidebar() {
  const html = HtmlService
    .createHtmlOutputFromFile('Sidebar')
    .setTitle('Add Recipe');  // uses HtmlService#createHtmlOutputFromFile :contentReference[oaicite:0]{index=0}
  SpreadsheetApp.getUi().showSidebar(html);
}

// onEdit: fires when Weekly Planner col C is edited
// Guard against manual runs (e.event undefined in editor) :contentReference[oaicite:1]{index=1}
function onEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (
    sh.getName() === 'Weekly Planner' &&
    e.range.getColumn() === 3 &&
    e.range.getRow() >= 2
  ) {
    refreshAll();
  }
}

// onSelectionChange: fires when you select Weekly Planner col C
// Guard against manual runs :contentReference[oaicite:2]{index=2}
function onSelectionChange(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (
    sh.getName() === 'Weekly Planner' &&
    e.range.getColumn() === 3 &&
    e.range.getRow() >= 2
  ) {
    refreshAll();
  }
}

// onChange: installable trigger for structural changes
function onChange(e) {
  refreshAll();
}

// refreshAll: master routine driving all sheet updates
function refreshAll() {
  populateIngredientPrices();
  calculateMealCosts();
  generateShoppingList();
  generateWeeklyInstructions();
  ensureShoppingListCheckboxes();
  generateDashboard();
  styleAllSheets(SpreadsheetApp.getActive());
  setupDropdowns();
}
