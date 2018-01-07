
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const rippleURL= 'https://coinmarketcap.com/currencies/ripple/';
const bitcoinURL='https://coinmarketcap.com/currencies/bitcoin/';
const cardanoURL = 'https://coinmarketcap.com/currencies/cardano/';
const tronURL = 'https://coinmarketcap.com/currencies/tron/';

let coins = [{
                    name:'ripple',
                    url: rippleURL,
                    price:0,
                    ammount:114
                },
                {
                    name:'bitcoin',
                    url: bitcoinURL,
                    price:0,
                    ammount:0.1
                },
                {
                    name:'cardano',
                    url: cardanoURL,
                    price:0,
                    ammount:140
                },
                {
                    name:'tron',
                    url: tronURL,
                    price:0,
                    ammount:1100
                }
]
let browser =null;
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
            await page.goto(`${coins[coin].url}`,{timeout:500});
        } catch (error) {
        }
    }
    const pages = await browser.pages();
    for (let i=1; i<pages.length; i++){   
        try{            
            await pages[i].waitForSelector('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
            const element = await pages[i].$('body > div.container > div > div.col-lg-10 > div:nth-child(5)');
            const quote_price = await pages[i].$$('#quote_price');
            const innerText = await quote_price[0].getProperty('innerText')
            const pricestring= await innerText.jsonValue()
            const pricenumber = pricestring.match(/(\d[\d\.]*)/g)
            coins[i-1].price =  pricestring.replace(/(\d[\d\.]*)/g,pricenumber*coins[i-1].ammount)
            const oldBoundingBox = await element.boundingBox();
            oldBoundingBox.width= 700;
            await pages[i].screenshot({ path: `${coins[i-1].name}.jpg` ,clip: oldBoundingBox});
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

async function displayGrid(res) {
    const newdom = await JSDOM.fromFile("coins.html")
    for (let i=0; i<coins.length; i++){  
        newdom.window.document.body.querySelectorAll('div')[i+1].appendChild(newdom.window.document.createElement("p"));
        newdom.window.document.body.querySelectorAll('p')[i].innerHTML=`${coins[i].price}`;
    }
    console.log(newdom.serialize());
    res.write(newdom.serialize());
    res.end();
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
console.log("server listening on 8880");