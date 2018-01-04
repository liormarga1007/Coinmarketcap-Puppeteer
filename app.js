
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');

const rippleURL= 'https://coinmarketcap.com/currencies/ripple/';

async function getCoinsScreen() {
    const browser = await puppeteer.launch({
        headless: false,
        gpu: false,
        scrollbars: false,
        args: ['--reduce-security-for-testing', '--deterministic-fetch','--disable-background-networking' ]
    });

    const page = await browser.newPage();
    await page.goto(rippleURL,{waitUntil: 'networkidle2'});

    const element = await page.$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
    const oldBoundingBox = await element.boundingBox();
    oldBoundingBox.width= 500;
    await page.screenshot({ path: 'ripple.jpg' ,clip: oldBoundingBox});
    browser.close();
}
//getCoinsScreen();

var server = http.createServer(function (req, res) {
    if (req.url.search('ripple.jpg')>0)
    {
        displayripple(res);
    }
    else{
        displayGrid(res);
    }
    
});

function displayGrid(res) {
    fs.readFile('coins.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}
function displayripple(res) {
    getCoinsScreen();
    fs.readFile('ripple.jpg', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'image',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

server.listen(8880);
console.log("server listening on 8888");