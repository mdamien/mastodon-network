import json

data = json.load(open('data.json'))

for user in data:
    for following in data[user]:
        if following in data and user in data[following]:
            print(user, ';', following, sep='')