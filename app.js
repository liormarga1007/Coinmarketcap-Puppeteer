
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const LRU = require('lru-cache');
const coins = require('./CoinDescriptors');
const counter = require('./counter.js')
const { JSDOM } = jsdom;

const port = process.env.PORT || 8080;



const cache = LRU({
    max: 12 ,
    maxAge: 1000 * 60 *60 , // 1 hour
    noDisposeOnSet: true,    
  });


let total = 0;

var server = http.createServer(async function (req, res) {
    const [_, coinname, suffix] = req.url.match(/^\/(ripple|binance|cardano|tron|funfair|poe|enj|xlm|xvg|pac|eth|bitcoin|favicon|total)?\/?(.*)/i) || ['', '', ''];
    
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
            if (suffix=='.jpg')
                await displaycoin(res,coinname);
            if (suffix=='.json')
                await displaydetailes(res,coinname);
            break;
        case 'favicon':
            res.writeHead(200, {
            'Content-Type': 'image',
                'Content-Length': 0
            });
            res.end();
            break;  
        case 'total':
            coinsTotal(res)
            break;
        default: 
            displayGrid(res);            
    }
});

async function displayGrid(res) {
    const newdom = await JSDOM.fromFile("coins.html")
    newdom.window.document.body.querySelectorAll('h1')[0].innerHTML=`Total: ${total} USD`;
    total =0;
    res.write(newdom.serialize());
    res.end();
}

async function coinsTotal(res) {
    let total=0;
    let basetotal= 0;
    for (let i=0; i<coins.length; i++){  
        total = total + coins[i].price;
        basetotal = basetotal + coins[i].baseprice;
    }   
    console.log(basetotal)    
    res.write(total.toString());
    res.end();
}

async function displaydetailes(res,coinName) {
    coins[coinName].toJSON = function(){
        let result ={};
        for (let x in this){
            if (x != "buff"){
                result[x] = this[x]
            }
        }
            
            return result;
    }        
    res.write(JSON.stringify(coins[coinName]));
    res.end();
}


function displaycoin(res,coinName) {
    if (counter.get() < 2){  
        if (!cache.has(coinName)){
            (async() => {
                counter.increment();
                const browser = await puppeteer.launch({
                    headless: true,
                    gpu: false,
                    scrollbars: false,
                    args: ['--reduce-security-for-testing', '--deterministic-fetch', `–-process-per-site` ,'--no-sandbox', '--disable-setuid-sandbox' ]
                });
                const page = await browser.newPage();                        
                try {                
                    try {                  
                        await page.goto(coins[coinName].url,{timeout:3000});
                    } catch (error) {
                        console.log(error);
                    }
                    
                    try {
                        await page.waitForSelector('body > div.banner-alert.banner-alert-fixed-bottom.js-cookie-policy-banner > div.banner-alert-close > button > span');
                        await page.click('body > div.banner-alert.banner-alert-fixed-bottom.js-cookie-policy-banner > div.banner-alert-close > button > span');
                    }
                    catch (error) {
                        console.log(error);
                    }

                    await page.waitForSelector('body > div.container.main-section.padding-top-1x > div.cmc-main-content > div.cmc-main-content__main > div.details-panel.flex-container.bottom-margin-2x > div.details-panel-item--header.flex-container',{timeout:5000});
                    const element = await page.$('body > div.container.main-section.padding-top-1x > div.cmc-main-content > div.cmc-main-content__main > div.details-panel.flex-container.bottom-margin-2x > div.details-panel-item--header.flex-container');
                    
                    const oldBoundingBox = await element.boundingBox();
                    oldBoundingBox.width= 750;
                    oldBoundingBox.x =0;


                    const quote_price = await page.$$('#quote_price');
                    const innerText = await quote_price[0].getProperty('innerText')
                    let pricestring= await innerText.jsonValue();
                    innerText.dispose();
                    
                    console.log(`${coinName}: ${pricestring}`)
                    pricestring = pricestring.replace(/\,/g,'');
                    const pricenumber = pricestring.match(/(\d[\d\.\,]*)/g)
                    
                    coins[coinName].price = Math.round(pricenumber*coins[coinName].ammount)
                        
                    await page.screenshot({clip: oldBoundingBox}).then(function(buffer) {
                        res.writeHead(200, {
                            'Content-Type': 'image',
                                'Content-Length': (buffer) ?buffer.length : 0
                            });
                            cache.set(coinName,buffer,1000 * 60 *3);
                            coins[coinName].buff= buffer;
                            var d = new Date();
                            coins[coinName].time = d.toLocaleTimeString();
                        res.write(buffer);
                        res.end();
                    });
                    element.dispose();
                    
                } catch (error) {
                    console.log(error)
                }            
                await browser.close();
                counter.decrement();
                })();
        }
        else {
            (async() => {
                const buffer = await coins[coinName].buff;                
                    res.writeHead(200, {
                        'Content-Type': 'image',
                            'Content-Length': (buffer) ?buffer.length : 0
                        });
                    res.write(buffer);
                    res.end(); 
                })();          
            }
            if (cache.length  > 10)
            {
                let name = coins[Math.floor(Math.random() * 12)].name;
                console.log(`remove: ${name}`)
                cache.del(name)
            }
        }
    else{
        (async() => {
            const buffer = await coins[coinName].buff;
            if (buffer== null){
                res.writeHead(200, {
                    'Content-Type': 'image',
                        'Content-Length': 0
                    });
                res.end();
            }
            else{
                res.writeHead(200, {
                    'Content-Type': 'image',
                        'Content-Length': (buffer) ?buffer.length : 0
                    });
                res.write(buffer);
                res.end();
            }
        })();
        
    }
}

server.listen(port);
console.log(`server listening on ${port}`);
