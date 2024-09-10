import { json2csv } from 'json-2-csv'

/*
 *
 *https://developer.paypal.com/docs/api/transaction-search/v1/#search_get
 https://developer.paypal.com/sdk/js/
 https://developer.paypal.com/dashboard/applications/live
 https://www.paypal.com/unifiedtransactions
 **/

const clientId = process.env.PAYPAL_API_KEY
const clientSecret = process.env.PAYPAL_API_SECRET

if (!clientId || !clientSecret) throw new Error('Missing PAYPAL_API_KEY OR PAYPAL_API_SECRET')

/** Returns a string with an access token or throws an error */
const getPayPalAccessToken = async (clientId, clientSecret) => {
  const url = 'https://api-m.paypal.com/v1/oauth2/token'
  const credentials = btoa(`${clientId}:${clientSecret}`)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://uri.paypal.com/services/reporting/search/read'
    }).toString()
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
  }

  const data = await response.json()
  return data.access_token
}

/** Returns the JSON response from the PayPal transactions API */
async function fetchTransactions(accessToken) {
  const formatDate = (date) => {
    return date.toISOString()
  }
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 31 * 24 * 60 * 60 * 1000)

  const query = new URLSearchParams({
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    transaction_amount: '[3800 TO 4100]', // not correct syntax
    // fields: 'cart_info', //'transaction_info,payer_info,shipping_info,auction_info,cart_info,incentive_info,store_info',
    fields: 'all', //'transaction_info,payer_info,shipping_info,auction_info,cart_info,incentive_info,store_info',
    page_size: '500', // 500 is max
    page: '1',

  })
  const url = `https://api-m.paypal.com/v1/reporting/transactions?${query}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Full response:', response)  // Log the full response object
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
  }

  return await response.json()
}

async function main() {
  try {
    console.log('Obtaining access token...')
    const accessToken = await getPayPalAccessToken(clientId, clientSecret)
    console.log('Access Token obtained successfully')

    console.log('Fetching transactions...')
    const transactions = await fetchTransactions(accessToken)
    // console.log(JSON.stringify(transactions, null, 2))
    console.log('Transactions fetched successfully', 'items: ', transactions.total_items, 'pages', transactions.total_pages)

    console.log('Parsing transactions...')
    // Pick only the data we need.
    const data = transactions.transaction_details.map(item => {
      const obj = {
        name: item.payer_info.payer_name.alternate_full_name,
        // name: item.shipping_info.name,
        email: item.payer_info.email_address,
        amount: item.transaction_info.transaction_amount.value,
        note: item.transaction_info.transaction_note || ''
        // fee_amount: item.transaction_info.fee_amount.value,
      }
      if (item.cart_info.item_details) {
        obj.products = item.cart_info.item_details.map(x => x.item_code).at(0)
      }
      return obj
    })
    const csv = json2csv(data)
    const file = await Bun.write('transactions.csv', csv)
    console.log('Parsed transactions saved to ./transactions.csv')
  } catch (error) {
    console.error('Error in main function:', error)
  }
}

await main()

