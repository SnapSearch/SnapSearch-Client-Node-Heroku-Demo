SnapSearch-Client-Node-Heroku-Demo
==================================

This repository shows a simple Express application deployed with SnapSearch-Client-Node as an intercetor middleware.

Heroku like other PAAS systems are behind a reverse proxy, which means certain flags needs to be turned true for SnapSearch to work. These flags allow SnapSearch-Client-Node to acquire the original hostnames, ports and protocol that was used between the client and the reverse proxy.

See the `index.js` for the example source code.

The below shell snippet shows how to deploy this on your own Heroku. Note the usage of environment variables to pass the SnapSearch API credentials.

```sh
# clone the project
git clone https://github.com/SnapSearch/SnapSearch-Client-Node-Heroku-Demo.git

# get into the project's directory
cd SnapSearch-Client-Node-Heroku-Demo

# optional, run it locally
SNAPEMAIL=XXXX SNAPKEY=XXXX node index.js

# get heroku CLI and login
heroku login

# create a unique snapsearch demo application, where X is your unique random string
heroku create snapsearch-demo-X

# set your SnapSearch API Email and Key (you need to sign up on heroku) for this app
heroku config:set SNAPEMAIL=XXXX SNAPKEY=XXXX

# deploy on heroku 
git push heroku master

# visit the app with a non-robot-like useragent, you will not see the fully evaluated JS content
curl -A "Meh" https://snapsearch-demo-X.herokuapp.com/

# visit the app with a robot-like useragent, triggering the scrape, you'll see the fully evaluated JS content
curl -A "Googlebot" https://snapsearch-demo-X.herokuapp.com/

# compare the difference between the output!

# check the logs
heroku logs
```