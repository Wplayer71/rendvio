import urllib.request

url1 = "https://raw.githubusercontent.com/Nutlope/roomGPT/main/public/original-pic.jpg"
url2 = "https://raw.githubusercontent.com/Nutlope/roomGPT/main/public/generated-pic-2.jpg"

try:
    urllib.request.urlretrieve(url1, "e:/rendvio/public/images/interior-before.png")
    urllib.request.urlretrieve(url2, "e:/rendvio/public/images/interior-after.png")
    print("Success")
except Exception as e:
    print("Error:", e)
