SnapSearch-Client-Node-Heroku-Demo
==================================

```sh
# get into the project's directory
cd SnapSearch-Client-Node-Heroku-Demo

# optional, run it locally
SNAPEMAIL=XXXX SNAPKEY=XXXX node index.js

# get heroku CLI and login
heroku login

# create a unique snapsearch demo application, where X is your unique random string
heroku create snapsearch-demo-X

# set your SnapSearch API Email and Key (you need to sign up on heroku)
heroku config:set SNAPEMAIL=XXXX SNAPKEY=XXXX

# deploy on heroku 
git push heroku master

# visit the app with a non-robot-like useragent, you will not see the fully evaluated JS content
curl -A "Meh" https://snapsearch-demo-X.herokuapp.com/

# visit the app with a robot-like useragent, triggering the scrape, you'll see the fully evaluated JS content
curl -A "Googlebot" https://snapsearch-demo-X.herokuapp.com/

# check the logs
heroku logs
```