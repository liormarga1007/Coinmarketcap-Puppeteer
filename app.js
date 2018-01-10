
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const LRU = require('lru-cache');
const { JSDOM } = jsdom;

const port = process.env.PORT || 8080;

const rippleURL= 'https://coinmarketcap.com/currencies/ripple/';
const binanceURL='https://coinmarketcap.com/currencies/binance-coin/';
const cardanoURL = 'https://coinmarketcap.com/currencies/cardano/';
const tronURL = 'https://coinmarketcap.com/currencies/tron/';
const funfairURL = 'https://coinmarketcap.com/currencies/funfair/';
const poeURL = 'https://coinmarketcap.com/currencies/poet/';
const enjURL = 'https://coinmarketcap.com/currencies/enjin-coin/';
const xlmURL = 'https://coinmarketcap.com/currencies/stellar/';
const xvgURL = 'https://coinmarketcap.com/currencies/verge/';
const pacURL = 'https://coinmarketcap.com/currencies/paccoin/';
const ethURL = 'https://coinmarketcap.com/currencies/ethereum/';
const bitcoinURL = 'https://coinmarketcap.com/currencies/bitcoin/';

let coins = [{
                    name:'ripple',
                    url: rippleURL,
                    price:0,
                    ammount:242
                },
                {
                    name:'binance',
                    url: binanceURL,
                    price:0,
                    ammount:68
                },
                {
                    name:'cardano',
                    url: cardanoURL,
                    price:0,
                    ammount:1048
                },
                {
                    name:'tron',
                    url: tronURL,
                    price:0,
                    ammount:4365
                },
                {
                    name:'funfair',
                    url: funfairURL,
                    price:0,
                    ammount:1299
                },
                {
                    name:'poe',
                    url: poeURL,
                    price:0,
                    ammount:800
                },
                {
                    name:'enj',
                    url: enjURL,
                    price:0,
                    ammount:400
                },
                {
                    name:'xlm',
                    url: xlmURL,
                    price:0,
                    ammount:440
                },
                {
                    name:'xvg',
                    url: xvgURL,
                    price:0,
                    ammount:509
                },
                {
                    name:'pac',
                    url: pacURL,
                    price:0,
                    ammount:206531
                },
                {
                    name:'eth',
                    url: ethURL,
                    price:0,
                    ammount:1.19528776
                },
                {
                    name:'bitcoin',
                    url: bitcoinURL,
                    price:0,
                    ammount:0.01595059
                }              
]

const cache = LRU({
    max: 12 ,
    maxAge: 1000 * 60*5 , // 5 minute
    noDisposeOnSet: true,    
  });

let browser =null;
let total = 0;
let pages= [];
async function getCoinsScreen() {
    if (browser == null)
        browser = await puppeteer.launch({
            headless: true,
            gpu: false,
            scrollbars: false,
            args: ['--reduce-security-for-testing', '--deterministic-fetch', `–-process-per-site` ,'--no-sandbox', '--disable-setuid-sandbox' ]
        });
    
    const currentpages = await browser.pages();
    pages[0] = currentpages[0];
        
    for (let j=0; j<6; j++){
        let k=0;
        let currentoins = coins.slice(j*2,j*2+2)
        for (coin in currentoins){
            
            try {
                if (pages[k] == null){
                    pages[k] = await browser.newPage();
                    
                }  
                if (!cache.has(currentoins[coin].url)){
                    await pages[k].goto(`${currentoins[coin].url}`,{timeout:500});                    
                }
                               
            } catch (error) {
                
            }
            k=k+1;
        }
        
        for (let i=0; i<2; i++){   
            try{
                if (!cache.has(currentoins[i].url)){ 
                //take screenshot             
                    await pages[i].waitForSelector('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
                    const element = await pages[i].$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
                    const oldBoundingBox = await element.boundingBox();
                    oldBoundingBox.width= 700;
                    await pages[i].screenshot({ path: `${currentoins[i].name}.jpg` ,clip: oldBoundingBox});
                    element.dispose();
                    //calcualte the amount in USD
                    const quote_price = await pages[i].$$('#quote_price');
                    const innerText = await quote_price[0].getProperty('innerText')
                    
                    let pricestring= await innerText.jsonValue();
                    innerText.dispose();
                    
                    console.log(pricestring)
                    pricestring = pricestring.replace(/\,/g,'');
                    const pricenumber = pricestring.match(/(\d[\d\.\,]*)/g)
                    
                    coins[j*2+i].price = Math.round(pricenumber*currentoins[i].ammount)
                    
                    console.log(currentoins[i].name)
                    console.log(pricenumber*currentoins[i].ammount)
                    
                    await cache.set(currentoins[i].url,'true');
                }
                
            }             
            catch (error) {
                console.log(error)
            }
            
        }
        /* for (let i=1; i<pages.length; i++){   
            await pages[i].close();
        } */
    }
       
}


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
            await getCoinsScreen();
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
    //console.log(newdom.serialize());
    res.write(newdom.serialize());
    res.end();
}

function displaycoin(res,coinName) {
    fs.readFile(`${coinName}.jpg`, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'image',
                'Content-Length': (data) ?data.length : 0
        });
        res.write(data);
        res.end();
    });
}
server.listen(port);
console.log(`server listening on ${port}`);