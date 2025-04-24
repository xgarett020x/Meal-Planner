/**
 * Dashboard.gs
 * High‐level status: cost, planned count, and shopping progress
 */
function generateDashboard() {
  const ss = SpreadsheetApp.getActive();
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) dash = ss.insertSheet('Dashboard', 0);
  else dash.clear();

  dash.getRange('A1').setValue('Metric');
  dash.getRange('B1').setValue('Value');

  dash.getRange('A2').setValue('Total Weekly Cost');
  dash.getRange('B2').setFormula(
    "=SUMIF('Weekly Planner'!D2:D, \">0\", 'Weekly Planner'!D2:D)"
  );

  dash.getRange('A3').setValue('Recipes Planned');
  dash.getRange('B3').setFormula(
    "=COUNTA('Weekly Planner'!C2:C)"
  );

  dash.getRange('A4').setValue('Shopping List Progress');
  dash.getRange('B4').setFormula(
    "=COUNTIF('Shopping List'!G2:G,TRUE)&\" of \"&COUNTA('Shopping List'!A2:A)"
  );

  dash.getRange('A1:B1')
    .setFontWeight('bold')
    .setBackground('#4a86e8')
    .setFontColor('#ffffff');
  dash.autoResizeColumns(1, 2);
}
