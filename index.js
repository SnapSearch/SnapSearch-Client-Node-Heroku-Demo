var express = require('express');
var snapsearch = require('snapsearch-client-nodejs');

var app = express();

app.enable('trust proxy');

app.use(snapsearch.connect(
    new snapsearch.Interceptor(
        new snapsearch.Client(
            'william@the-newshub.com', 
            '327UomZfp2j8y1JCz87p3Sm2xfg71vggLbC0E9G2NA1FQIT2yC', 
            {}, 
            function (error, debugging) {
                //custom exception handling
                console.log(error);
                console.log(debugging);
            }
        ),
        new snapsearch.Detector([], [], false, true)
    ),
    function (data) {

        //return an object for custom response handling
        return {
            status: data.status,
            html: data.html,
            headers: data.headers
        };

    }
));

app.get('/', function (req, res) {
    res.send('Was not a robot and we are here inside app');
});

app.listen(1337);

console.log('Server running at http://127.0.0.1:1337/');