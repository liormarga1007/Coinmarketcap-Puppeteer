
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
    maxAge: 1000 * 60 *3 , // 3 minute
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
   /*  for (let i=0; i<coins.length; i++){  
        newdom.window.document.body.querySelectorAll('div')[i+1].appendChild(newdom.window.document.createElement(`p${i}`));
        newdom.window.document.body.querySelectorAll(`p${i}`)[i].innerHTML=`Supply: ${coins[i].ammount} Price: ${coins[i].price} USD`;
        total = total + coins[i].price;
    } */
    newdom.window.document.body.querySelectorAll('h1')[0].innerHTML=`Total: ${total} USD`;
    total =0;
    res.write(newdom.serialize());
    res.end();
}

async function coinsTotal(res) {
    let total=0;
    for (let i=0; i<coins.length; i++){  
        total = total + coins[i].price;
    }       
    res.write(`Total: ${total.toString()} USD`);
    res.end();
}

async function displaydetailes(res,coinName) {
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
                        
                    }
                    
                    await page.waitForSelector('body > div.container > div > div.col-lg-10 > div:nth-child(5)',{timeout:5000});
                    const element = await page.$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
                    const oldBoundingBox = await element.boundingBox();
                    oldBoundingBox.width= 700;


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
                //fs.readFile(`${coinName}.jpg`, function (err, buffer) {
                    res.writeHead(200, {
                        'Content-Type': 'image',
                            'Content-Length': (buffer) ?buffer.length : 0
                        });
                    res.write(buffer);
                    res.end(); 
                    //}); 
                })();          
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