
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const rippleURL= 'https://coinmarketcap.com/currencies/ripple/';
const bitcoinURL='https://coinmarketcap.com/currencies/binance-coin/';
const cardanoURL = 'https://coinmarketcap.com/currencies/cardano/';
const tronURL = 'https://coinmarketcap.com/currencies/tron/';
const funfairURL = 'https://coinmarketcap.com/currencies/funfair/';
const poeURL = 'https://coinmarketcap.com/currencies/poet/'
const enjURL = 'https://coinmarketcap.com/currencies/enjin-coin/'
const xlmURL = 'https://coinmarketcap.com/currencies/stellar/'
const xvgURL = 'https://coinmarketcap.com/currencies/verge/'
const pacURL = 'https://coinmarketcap.com/currencies/paccoin/'

let coins = [{
                    name:'ripple',
                    url: rippleURL,
                    price:0,
                    ammount:452
                },
                {
                    name:'binance',
                    url: bitcoinURL,
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
                }
]
let browser =null;
let total = 0;
async function getCoinsScreen() {
    if (browser == null)
        browser = await puppeteer.launch({
            headless: true,
            gpu: false,
            scrollbars: false,
            args: ['--reduce-security-for-testing', '--deterministic-fetch','--disable-background-networking' ]
        });

    
    for (coin in coins){
       
        try {
            const page = await browser.newPage();
            await page.goto(`${coins[coin].url}`,{timeout:200});
        } catch (error) {
        }
    }
    const pages = await browser.pages();
    for (let i=1; i<pages.length; i++){   
        try{
            //take screenshot             
            await pages[i].waitForSelector('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
            const element = await pages[i].$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
            const oldBoundingBox = await element.boundingBox();
            oldBoundingBox.width= 700;
            await pages[i].screenshot({ path: `${coins[i-1].name}.jpg` ,clip: oldBoundingBox});

            //calcualte the amount in USD
            const quote_price = await pages[i].$$('#quote_price');
            const innerText = await quote_price[0].getProperty('innerText')
            const pricestring= await innerText.jsonValue()
            const pricenumber = pricestring.match(/(\d[\d\.\,]*)/g)
            coins[i-1].price = pricestring.replace(/(\d[\d\.\,]*)/g,Math.round(pricenumber*coins[i-1].ammount))
            total = total + Math.round(pricenumber*coins[i-1].ammount);
            
        }             
        catch (error) {
            console.log(error)
            continue;
        }
        
    }
    for (let i=1; i<pages.length; i++){   
        await pages[i].close();
    }   
}


var server = http.createServer(async function (req, res) {
    const [_, coinname, suffix] = req.url.match(/^\/(ripple|binance|cardano|tron|funfair|poe|enj|xlm|xvg|pac|favicon)?\/?(.*)/i) || ['', '', ''];
    
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
        newdom.window.document.body.querySelectorAll('p')[i].innerHTML=`Supply: ${coins[i].ammount} Price: ${coins[i].price}`;
    }
    newdom.window.document.body.querySelectorAll('h1')[0].innerHTML=`Total: ${total} USD`;
    total = 0;
    //console.log(newdom.serialize());
    res.write(newdom.serialize());
    res.end();
}

function displaycoin(res,coinName) {
    fs.readFile(`${coinName}.jpg`, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'image',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}
server.listen(8880);
console.log("server listening on 8880");