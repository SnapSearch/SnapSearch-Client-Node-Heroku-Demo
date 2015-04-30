var express = require('express'),
    snapsearch = require('snapsearch-client-nodejs'), 
    logger = require ('morgan'),
    compress = require ('compression'), 
    methodOverride = require ('method-override');

var app = express();

app.set('port', (process.env.PORT || 1337));

app.enable('trust proxy');

app.use(logger('dev'));    // will log out incoming requests
app.use(methodOverride()); // augments the req.method with non-standard PUT & DELETE
app.use(compress());       // conditionally gzip compresses the response body

// the snapsearch middleware should be after any kind of augmentation of the request or response
// in fact it should be as close to kernel of your software as possible
// any middleware added after the snapsearch middleware WILL NOT run during an interception, beware of this!
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
        new snapsearch.Detector([
            '/sitemap.xml'
        ], [], false, true)
    ),
    function (data) {

        console.log('SnapSearch node client successfully intercepted a robot!');
        console.log('We are returning the scraped snapshot from the SnapSearch API.');

        // it is important to understand the purpose of this function here
        // by default SnapSearch only passes through the Location header
        // you can add this custom function to control exactly how the snapshot is returned to the client
        // that means it's possible to pass through ALL the headers
        // this can mean big problems however!
        // if you pass through all the headers, the headers may introduce new errors
        // for example, if your snapshot has gzipped headers
        // and you return the gzipped headers, then the content returned better be gzipped
        // but there's a possibility that it might be not be gzipped because the content is being returned
        // in the SnapSearch express middleware layer
        // if you put your SnapSearch express middleware layer in the wrong place
        // this could cause the content not to be gzipped
        // below is an example of this exact problem
        // the snapshot returned will have `Content-Encoding` header indicating gzipped content
        // but the compression middleware will not gzip compress the content if it already detects a 
        // preset `Content-Encoding` header
        // this means we need to remove that header specifically, before returning here
        // so the upstream compression middleware can then gzip the content, and readd the `Content-Encoding` header

        // remove the content-encoding header here
        var contentEncodingIndex;
        data.headers.forEach(function (header, index) {
            if (header.name.toLowerCase() == 'content-encoding') {
                contentEncodingIndex = index;
            }
        });
        if (contentEncodingIndex) {
            data.headers.splice(contentEncodingIndex, 1);
        }

        // return an object for custom response handling
        return {
            status: data.status,
            html: data.html,
            headers: data.headers
        };

    }
));

app.use(express.static('public'));

app.get('/', function (req, res) {

    // content-type and content-length is required in order to trigger compression
    // content-length needs to be greater than 1024
    res.type('html');

    var output = 'Some static content. <script>document.write("Some javascript injected content, only viewable with SnapSearch and JavaScript enabled clients!");</script>',
        buffer = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet urna eget neque eleifend suscipit. Mauris id quam non tortor pretium hendrerit eu at ligula. Morbi neque leo, imperdiet a metus ut, auctor fringilla turpis. Etiam ut augue ultricies lacus rutrum laoreet. Aenean consectetur nisi vel dui rutrum, hendrerit congue felis ultricies. Suspendisse a lacus nibh. Cras et diam vel metus lacinia cursus eget ut turpis. Maecenas eu tempor elit. In scelerisque interdum orci, at lobortis lacus dapibus eu. Maecenas auctor lacus ac venenatis efficitur. Integer non vulputate velit. Etiam congue imperdiet est, ac porta tellus pharetra eu. Curabitur ut laoreet est. Donec porta, sapien eu porttitor laoreet, augue sapien faucibus dui, eu convallis nisl sem a lorem. Mauris neque orci, placerat eget pharetra ullamcorper, suscipit at justo. Aliquam mauris elit, sollicitudin sit amet odio vitae, cursus consequat magna. Nam tristique neque ipsum, quis dictum lorem ullamcorper non. Pellentesque iaculis sapien id nullam.';

    // we need some extra content to trigger the compress middleware
    output = output + ' ' + buffer;

    // res.send is a magic function that will auto-add content-length
    res.send(output);

    // do not use res.write(); res.end() without explicitly adding content-length

});

app.listen(app.get('port'), function () {
    console.log('SnapSearch demo running on localhost:' + app.get('port'));
});