import requests

url = "https://api.coolapk.com/v6/page/dataList?url=%23%2Fproduct%2FproductList%3Ftype%3Dcategory%26id%3D1000%26sortField%3Dv4_score_item_6_owner_average_score%26limitField%3Dv4_score_item_6_owner_total_count-200%3Brank_status-0-0%26ratingUI%3D1%26withConfigCard%3D1%26configCardExtraData%3D%257B%2522withRanking%2522%253A1%257D%26rightStyle%3Dtext%26rightBottomText%3D%E6%80%A7%E4%BB%B7%E6%AF%94%E5%88%86%26rightTopField%3Dv4_score_item_6_owner_average_score&title=%E6%80%A7%E4%BB%B7%E6%AF%94%E6%A6%9C&page=1&firstItem=4068"

headers = {
  'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 13; 23049RAD8C Build/TKQ1.221114.001) (#Build; Redmi; 23049RAD8C; TKQ1.221114.001 test-keys; 13) +CoolMarket/14.0.0-2401171-universal",
  'Connection': "Keep-Alive",
  'Accept-Encoding': "gzip",
  'X-Requested-With': "XMLHttpRequest",
  'X-Sdk-Int': "33",
  'X-Sdk-Locale': "zh-CN",
  'X-App-Id': "com.coolapk.market",
  'X-App-Token': "v3JDJ5JDEwJE5qaGpOemMxWldVdk9USmtaR1kzTXU3U3lLanVDVnJIR3RoMUdoNzhVT1dKNFlpdmxGL3l5",
  'X-App-Version': "14.0.0",
  'X-App-Code': "2401171",
  'X-Api-Version': "14",
  'X-App-Device': "0UzMjlTZ1MWZyYDNlVTM3AyOzlXZr1CdzVGdgEDMw4CNxETMyIjLxE1SUByODhDRBJVO0AzMyAyOp1GZlJFI7kWbvFWaYByOgsDI7AyOhV2TqNXYVdWR3cXQ6hjZYNTWORkY5IXajZzbOl0bfpkaIVFR",
  'X-Dark-Mode': "1",
  'X-App-Channel': "yyb",
  'X-App-Mode': "universal",
  'X-App-Supported': "2401171",
  'Cookie': "ddid=763cdbda-df79-485a-b4ac-92df073f1df5"
}

response = requests.get(url, headers=headers)

print(response.text)