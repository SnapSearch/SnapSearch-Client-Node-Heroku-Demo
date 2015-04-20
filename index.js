var express = require('express');
var snapsearch = require('snapsearch-client-nodejs');

var app = express();

app.set('port', (process.env.PORT || 1337));

app.enable('trust proxy');

app.use(snapsearch.connect(
    new snapsearch.Interceptor(
        new snapsearch.Client(
            process.env.SNAPEMAIL, 
            process.env.SNAPKEY, 
            {}, 
            function (error, debugging) {

                console.log('Oh no SnapSearch node client met an error while trying to intercept the request!');
                console.log(error);
                console.log(debugging);

            }
        ),
        new snapsearch.Detector([], [], false, true)
    ),
    function (data) {

        console.log('SnapSearch node client successfully intercepted a robot!');
        console.log('We are returning the scraped snapshot from the SnapSearch API.');

        //return an object for custom response handling
        return {
            status: data.status,
            html: data.html,
            headers: data.headers
        };

    }
));

app.get('/', function (req, res) {
    res.send('Some static content. <script>document.write("Some javascript injected content, only viewable with SnapSearch and JavaScript enabled clients!");</script>');
});

app.listen(app.get('port'), function () {
    console.log('SnapSearch demo running on localhost:' + app.get('port'));
});