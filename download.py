import requests
import bs4
import json
import random

data = json.load(open('data.json'))

users = [following for user in data.values() for following in user]

random.shuffle(users)

for user in users:
    print(user)

    if '[email protected]' in user:
        continue
    if '@' not in user:
        continue

    _, username, server = user.split('@')

    if user in data:
        continue

    data[user] = []
    page = 1
    while True:
        try:
            url = f'https://{server}/users/{username}/following?page={page}'
            print(url)
            resp = requests.get(url, timeout=1)
        except:
            print('fail to get', url)
            break
        soup = bs4.BeautifulSoup(resp.text, 'lxml')

        prev_len = len(data[user])
        for name in soup.select('.display-name > span'):
            data[user].append(name.text.strip())
        if prev_len == len(data[user]):
            break
        print(len(data[user]))
        page += 1

    open('data.json', 'w').write(json.dumps(data, indent=2))