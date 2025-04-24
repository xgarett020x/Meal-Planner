/**
 * Instructions.gs
 * Rebuilds “Weekly Instructions” sheet by:
 *   1. Deleting any existing sheet (clearing all validations)
 *   2. Inserting a fresh sheet with no rules
 *   3. Writing header row and split-out steps
 */
function generateWeeklyInstructions() {
  const ss        = SpreadsheetApp.getActive();
  const sheetName = 'Weekly Instructions';

  // 1) Delete old sheet entirely to remove all validations 
  const old = ss.getSheetByName(sheetName);
  if (old) ss.deleteSheet(old);

  // 2) Create a new blank sheet at the end (no validations by default) 
  const instr = ss.insertSheet(sheetName, ss.getSheets().length);

  // 3) Build a map: recipe name → instruction text
  const recs    = ss.getSheetByName('Recipes').getDataRange().getValues();
  const textMap = {};
  recs.slice(1).forEach(r => {
    const [name,,,, stepsText] = r;
    if (name && stepsText) textMap[name] = stepsText;
  });

  // 4) Read Weekly Planner rows [Day, Meal, Recipe]
  const planSh   = ss.getSheetByName('Weekly Planner');
  const rowCount = planSh.getLastRow() - 1;
  const planData = rowCount > 0
    ? planSh.getRange(2, 1, rowCount, 3).getValues()
    : [];

  // 5) Determine maximum number of steps across all selected recipes
  const splitRx = /[.?!]\s*|\r?\n|;\s*/;
  let maxSteps = 0;
  planData.forEach(([, , recipe]) => {
    const steps = (textMap[recipe] || '').split(splitRx).filter(s => s.trim());
    maxSteps = Math.max(maxSteps, steps.length);
  });

  // 6) Write header row: Day | Meal | Recipe Name | Step 1 … Step N :contentReference[oaicite:2]{index=2}
  const headers = ['Day', 'Meal', 'Recipe Name'];
  for (let i = 1; i <= maxSteps; i++) headers.push('Step ' + i);
  instr.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 7) Populate each planner row with its sequence of steps 
  planData.forEach((row, idx) => {
    const [day, meal, recipe] = row;
    const steps = (textMap[recipe] || '')
      .split(splitRx)
      .map(s => s.trim())
      .filter(Boolean);

    const out = [day, meal, recipe]
      .concat(steps)
      .concat(Array(maxSteps - steps.length).fill(''));

    instr.getRange(idx + 2, 1, 1, out.length)
         .setValues([out]);
  });

  // 8) Auto-resize columns for clarity :contentReference[oaicite:3]{index=3}
  instr.autoResizeColumns(1, headers.length);
}
