/**
 * Styling.gs
 * Sheet header, banding, wrapping, auto-resize helpers
 */
 
/**
 * styleSheetGeneric: safely style a sheet if it exists
 * — Guard against undefined sheet objects
 */
function styleSheetGeneric(sheet, cols) {
  // If sheet is missing, do nothing
  if (!sheet) return;

  const last = sheet.getLastRow();
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, cols)
    .setBackground('#4a86e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  // Remove any existing bandings
  sheet.getBandings().forEach(b => b.remove());
  
  if (last > 2) {
    const rng = sheet.getRange(3, 1, last - 2, cols);
    rng.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
    rng.setWrap(true);
  }
  
  sheet.autoResizeColumns(1, cols);
}

/**
 * styleAllSheets: apply uniform styling & replicate C3 format to C2:C1000
 */
function styleAllSheets(ss) {
  const names = [
    'Recipes',
    'Ingredient Prices',
    'Weekly Planner',
    'Shopping List',
    'Weekly Instructions'
  ];
  
  names.forEach(name => {
    const sh = ss.getSheetByName(name);
    // styleSheetGeneric now guards against undefined
    styleSheetGeneric(sh, sh ? sh.getLastColumn() : 0);
    
    if (name === 'Weekly Planner' && sh) {
      const lr = Math.max(1000, sh.getLastRow());
      sh.getRange('C3')
        .copyTo(sh.getRange(2, 3, lr - 1, 1), { formatOnly: true });
    }
  });
}
