/**
 * PricingAPI.gs
 * Fetches unit prices via Instacart Partner API
 */
function fetchPriceFromIDP(retailerId, productName) {
  const apiKey   = 'YOUR_PARTNER_API_KEY';
  const endpoint = 'https://connect.instacart.com/idp/v1/catalog/items/search';
  const params   = '?retailer=' + encodeURIComponent(retailerId)
                 + '&query='    + encodeURIComponent(productName)
                 + '&limit=1';
  try {
    const resp = UrlFetchApp.fetch(endpoint + params, {
      method: 'get',
      headers: { Authorization: 'Bearer ' + apiKey },
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() !== 200) return null;
    const data = JSON.parse(resp.getContentText()).data;
    return data && data.length
      ? parseFloat(data[0].availability.price.regular)
      : null;
  } catch (e) {
    return null;
  }
}
