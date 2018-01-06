
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');

const rippleURL= 'https://coinmarketcap.com/currencies/ripple/';
const bitcoinURL='https://coinmarketcap.com/currencies/bitcoin/';

const coins = [{
                name:'ripple',
                url: rippleURL
                },
                {
                name:'bitcoin',
                url: bitcoinURL
                }
]

async function getCoinsScreen() {
    const browser = await puppeteer.launch({
        headless: true,
        gpu: false,
        scrollbars: false,
        args: ['--reduce-security-for-testing', '--deterministic-fetch','--disable-background-networking' ]
    });

    const page = await browser.newPage();
    for (coin in coins){
        try {
            await page.goto(`${coins[coin].url}`,{timeout: 3000,waitUntil:'load'});
        } catch (error) {
            
        }
        await page.waitFor('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
        const element = await page.$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
        const oldBoundingBox = await element.boundingBox();
        oldBoundingBox.width= 500;
        await page.screenshot({ path: `${coins[coin].name}.jpg` ,clip: oldBoundingBox});
    }
    
    browser.close();
}
//getCoinsScreen();

var server = http.createServer(async function (req, res) {
    const [_, lior, url] = req.url.match(/^\/(ripple|bitcoin|pdf)?\/?(.*)/i) || ['', '', ''];
    if (req.url.search('ripple.jpg|bitcoin')>0)
    {
        switch(lior){
            case 'ripple':{
                await displayripple(res);
                break;
            }                
            case 'bitcoin':{
                await displaybitcoin(res)
                break;
            }
                
        }
        
    }
    else{
        await getCoinsScreen();
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
    fs.readFile('ripple.jpg', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'image',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}
function displaybitcoin(res) {
    fs.readFile('bitcoin.jpg', function (err, data) {
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