
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');

const rippleURL= 'https://coinmarketcap.com/currencies/ripple/';
const bitcoinURL='https://coinmarketcap.com/currencies/bitcoin/';
const cardanoURL = 'https://coinmarketcap.com/currencies/cardano/';
const tronURL = 'https://coinmarketcap.com/currencies/tron/';

const coins = [{
                    name:'ripple',
                    url: rippleURL
                },
                {
                    name:'bitcoin',
                    url: bitcoinURL
                },
                {
                    name:'cardano',
                    url: cardanoURL
                },
                {
                    name:'tron',
                    url: tronURL
                }
]
let browser =null;
async function getCoinsScreen() {
    if (browser == null)
        browser = await puppeteer.launch({
            headless: false,
            gpu: false,
            scrollbars: false,
            args: ['--reduce-security-for-testing', '--deterministic-fetch','--disable-background-networking' ]
        });

    const page = await browser.newPage();
    for (coin in coins){
        try {
            try {
                await page.goto(`${coins[coin].url}`,{timeout: 1700,waitUntil:'load'});
            } catch (error) {
            }
            await page.waitForSelector('body > div.container > div > div.col-lg-10 > div:nth-child(5)',{timeout:1000});
            const element = await page.$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
            const oldBoundingBox = await element.boundingBox();
            oldBoundingBox.width= 700;
            await page.screenshot({ path: `${coins[coin].name}.jpg` ,clip: oldBoundingBox});
        } catch (error) {
            console.log(coins[coin].name)
            continue;
        }
        
    }
    await page.close();
   
}


var server = http.createServer(async function (req, res) {
    const [_, coinname, url] = req.url.match(/^\/(ripple|bitcoin|cardano|tron|favicon)?\/?(.*)/i) || ['', '', ''];

    switch(coinname){
        case 'ripple':{
            await displayripple(res);
            break;
        }                
        case 'bitcoin':{
            await displaybitcoin(res)
            break;
        }
        case 'cardano':{
            await displaycardano(res)
            break;
        }
        case 'tron':{
            await displaytron(res)
            break;
        }
        case 'favicon':{
            break;
        }
        default: {
            await getCoinsScreen();
            displayGrid(res);
        }
            
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
function displaycardano(res) {
    fs.readFile('cardano.jpg', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'image',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}
function displaytron(res) {
    fs.readFile('tron.jpg', function (err, data) {
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