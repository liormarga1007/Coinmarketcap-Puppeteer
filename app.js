
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const LRU = require('lru-cache');
const coins = require('./CoinDescriptors');
const { JSDOM } = jsdom;

const port = process.env.PORT || 8080;



const cache = LRU({
    max: 12 ,
    maxAge: 1000 * 60*5 , // 5 minute
    noDisposeOnSet: true,    
  });


let total = 0;

var server = http.createServer(async function (req, res) {
    const [_, coinname, suffix] = req.url.match(/^\/(ripple|binance|cardano|tron|funfair|poe|enj|xlm|xvg|pac|eth|bitcoin|favicon)?\/?(.*)/i) || ['', '', ''];
    
    switch(coinname){
        case 'ripple':
        case 'binance':
        case 'cardano':
        case 'tron':
        case 'funfair':
        case 'poe':
        case 'enj':
        case 'xlm':
        case 'xvg':
        case 'pac':
        case 'eth':
        case 'bitcoin':
            await displaycoin(res,coinname);
            break;
        case 'favicon':
            break;        
        default: 
            displayGrid(res);            
    }
});

async function displayGrid(res) {
    const newdom = await JSDOM.fromFile("coins.html")
    for (let i=0; i<coins.length; i++){  
        newdom.window.document.body.querySelectorAll('div')[i+1].appendChild(newdom.window.document.createElement("p"));
        newdom.window.document.body.querySelectorAll('p')[i].innerHTML=`Supply: ${coins[i].ammount} Price: ${coins[i].price} USD`;
        total = total + coins[i].price;
    }
    newdom.window.document.body.querySelectorAll('h1')[0].innerHTML=`Total: ${total} USD`;
    total =0;
    res.write(newdom.serialize());
    res.end();
}

function displaycoin(res,coinName) {    
        if (!cache.has(coinName)){
        (async() => {
            const browser = await puppeteer.launch({
                headless: true,
                gpu: false,
                scrollbars: false,
                args: ['--reduce-security-for-testing', '--deterministic-fetch', `–-process-per-site` ,'--no-sandbox', '--disable-setuid-sandbox' ]
            });
            const page = await browser.newPage();                        
            try {                
                try {                  
                    await page.goto(coins[coinName].url,{timeout:1500});
                } catch (error) {
                    
                }
                
                await page.waitForSelector('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
                const element = await page.$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
                const oldBoundingBox = await element.boundingBox();
                oldBoundingBox.width= 700;


                const quote_price = await page.$$('#quote_price');
                const innerText = await quote_price[0].getProperty('innerText')
                let pricestring= await innerText.jsonValue();
                innerText.dispose();
                
                console.log(pricestring)
                pricestring = pricestring.replace(/\,/g,'');
                const pricenumber = pricestring.match(/(\d[\d\.\,]*)/g)
                
                coins[coinName].price = Math.round(pricenumber*coins[coinName].ammount)
                    
                await page.screenshot({path: `${coins[coinName]}.jpg` ,clip: oldBoundingBox}).then(function(buffer) {
                    res.writeHead(200, {
                        'Content-Type': 'image',
                            'Content-Length': (buffer) ?buffer.length : 0
                    });
                    res.write(buffer);
                    res.end();
                });
                element.dispose();
                await cache.set(coinName,'true');
            } catch (error) {
                console.log(error)
            }            
            await browser.close();
        })();
    }
    else {
        (async() => {
            fs.readFile(`${coinName}.jpg`, function (err, buffer) {
                res.writeHead(200, {
                    'Content-Type': 'image',
                        'Content-Length': (buffer) ?buffer.length : 0
                });
                res.write(buffer);
                res.end(); 
            }); 
        })();          
    }
    
}
server.listen(port);
console.log(`server listening on ${port}`);