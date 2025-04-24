/**
 * UI.gs
 * Sidebar launcher and form-handlers for adding recipes,
 * including unit abbreviation and auto-refresh.
 */

/**
 * abbreviateUnit
 * Normalizes common unit names to standard abbreviations.
 */
function abbreviateUnit(unit) {
  if (!unit) return '';
  const map = {
    tablespoon: 'tbsp', tablespoons: 'tbsp',
    teaspoon:   'tsp',  teaspoons:   'tsp',
    cup:        'cup',  cups:        'cup',
    ounce:      'oz',   ounces:      'oz',
    pound:      'lb',   pounds:      'lb',
    gram:       'g',    grams:       'g',
    kilogram:   'kg',   kilograms:   'kg',
    liter:      'l',    liters:      'l',
    pinch:      'pinch',
    clove:      'clove', cloves:     'clove',
    package:    'pkg',  packages:    'pkg',
    can:        'can',  cans:        'can',
    slice:      'slice', slices:     'slice',
    piece:      'pc',   pieces:      'pc'
  };
  const key = unit.toString().toLowerCase().trim();
  return map[key] || unit;
}

/**
 * showSidebar
 * Opens the HTML sidebar for recipe entry.
 */
function showSidebar() {
  const html = HtmlService
    .createHtmlOutputFromFile('Sidebar')
    .setTitle('Add Recipe');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * addRecipe(data)
 * Appends a single ingredient row to the Recipes sheet,
 * abbreviating the unit, then triggers a full refresh.
 */
function addRecipe(data) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('Recipes');
  if (!sh) throw new Error('Recipes sheet not found');

  sh.appendRow([
    data.name,
    data.ingredient,
    data.quantity,
    abbreviateUnit(data.unit),
    data.instructions
  ]);

  refreshAll();
  return `Added ingredient row for "${data.name}"`;
}

/**
 * parseAndAddRecipe(raw)
 * Bulk-imports a pasted recipe text by:
 * 1. Ensuring raw is a non-empty string
 * 2. Splitting into lines and finding the Ingredients/Instructions headers
 * 3. Parsing each ingredient line into qty, unit, name (with abbreviation)
 * 4. Appending one row per ingredient carrying full instructions
 * 5. Triggering a full refresh
 */
function parseAndAddRecipe(raw) {
  // 1) Validate input
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('No recipe text provided. Paste the recipe into the sidebar.');
  }
  // 2) Normalize newlines
  raw = raw.replace(/\r\n/g, '\n');

  // 3) Split and trim lines
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0];

  // 4) Locate section headers
  const ingRegex = /^(Ingredients?|Directions?)\s*[:\-]?\s*$/i;
  const insRegex = /^(Instructions?|Directions?)\s*[:\-]?\s*$/i;
  const idxIng = lines.findIndex(l => ingRegex.test(l));
  const idxIns = idxIng >= 0
    ? lines.findIndex((l,i) => i > idxIng && insRegex.test(l))
    : -1;
  if (idxIng < 0 || idxIns < 0) {
    throw new Error(
      'Could not locate both “Ingredients” and “Instructions” headings. ' +
      'Ensure your pasted text includes lines like “Ingredients:” and “Instructions:”'
    );
  }

  // 5) Extract ingredient and instruction blocks
  const ingLines = lines.slice(idxIng + 1, idxIns);
  const insLines = lines.slice(idxIns + 1);
  if (ingLines.length === 0) {
    throw new Error('No ingredients found between the headings.');
  }
  const instructions = insLines.join('\n');

  // 6) Parse and append
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('Recipes');
  ingLines.forEach(line => {
    const m = line.match(/^([\d\s\/\.\-½¼¾]+)\s*([^\d\s\/\.\-½¼¾]+)?\s+(.+)$/);
    let quantity = '', unit = '', ingredient = line;
    if (m) {
      quantity   = m[1].trim();
      unit       = abbreviateUnit(m[2] || '');
      ingredient = m[3].trim();
    }
    sh.appendRow([title, ingredient, quantity, unit, instructions]);
  });

  // 7) Refresh everything
  refreshAll();
  return `Imported recipe "${title}" with ${ingLines.length} ingredients.`;
}
