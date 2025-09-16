import requests

url = "https://api.coolapk.com/v6/page/dataList?url=%23%2Ftopic%2FtagList%3FfilterId%3D9%26keywords%3D%E6%89%8B%E6%9C%BA%E5%A4%84%E7%90%86%E5%99%A8%26ratingUI%3D1&title=SoC%E6%A6%9C&page=1&firstItem=132485"

headers = {
  'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 13; 23049RAD8C Build/TKQ1.221114.001) (#Build; Redmi; 23049RAD8C; TKQ1.221114.001 test-keys; 13) +CoolMarket/14.0.0-2401171-universal",
  'Connection': "Keep-Alive",
  'Accept-Encoding': "gzip",
  'X-Requested-With': "XMLHttpRequest",
  'X-Sdk-Int': "33",
  'X-Sdk-Locale': "zh-CN",
  'X-App-Id': "com.coolapk.market",
  'X-App-Token': "v3JDJ5JDEwJE5qaGpOemMyTUdRdllUWm1PVEZqWU8wemJjdWhNRHFEYm5URi84TG5yLnRnYkVjTVlWd2JD",
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