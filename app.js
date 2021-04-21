
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
var seconds = new Date().getTime() / 1000;
//var browser1 = null;

var server = http.createServer(async function (req, res) {
    const [_, coinname, suffix] = req.url.match(/^\/(ripple|binance|cardano|tron|funfair|poe|enj|xlm|xvg|pac|eth|bitcoin|favicon|total|clear)?\/?(.*)/i) || ['', '', ''];
    
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
        case 'clear':
            cache.reset();
            if (counter.get() > 0){
                counter.decrement();
            }
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
    //console.log(`totalcounter:${counter.get()}`)    
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
    //console.log(`counter before: ${counter.get()}`)
    var nowseconds = new Date().getTime() / 1000;
    if ((nowseconds - seconds) > 120){
        console.log("stuck")
        if (counter.get() > 0){
                counter.decrement();
        }
        //await browser1.close();
        //crash = 1;
    }
    if (counter.get() < 2){  
        if (!cache.has(coinName)){
            (async() => {
                seconds = new Date().getTime() / 1000;
                counter.increment();
                console.log(`counter increment: ${counter.get()}`)
                let browser =null;
                let page =null;
                try {
                    browser = await puppeteer.launch({
                        headless: true,
                        gpu: false,
                        scrollbars: false,
                        args: ['--reduce-security-for-testing', '--deterministic-fetch', `–-process-per-site` ,'--no-sandbox', '--disable-setuid-sandbox' ]
                    });
                    //browser1 = browser;
                    page = await browser.newPage();    
                }
                catch(err){                    
                    console.log(err)
                    console.log(`counter decrement err: ${counter.get()}`)
                    process.exit(1)
                    if (browser != null){
                        await browser.close();
                    }
                    counter.decrement();
                    return;
                }
                try{                
                    try {                  
                        await page.goto(coins[coinName].url,{timeout:3000});
                    } catch (error) {
                        console.log(`goto:${error} ${coins[coinName].url}`);
                    }
                    try {                  
                        await page.click(`#cmc-cookie-policy-banner > div.cmc-cookie-policy-banner__close`);
                    } catch (error) {
                        
                    }
                     
                    let select;
                     
                    select = '#__next > div > div.main-content > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div.sc-16r8icm-0.hNsOU.container > div.sc-16r8icm-0.kXPxnI.container___lbFzk'
                    //select = '#__next > div > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div.sc-16r8icm-0.hNsOU.container > div.sc-16r8icm-0.kXPxnI.container___lbFzk > div.sc-16r8icm-0.kXPxnI.priceSection___3kA4m'
                                           
                    await page.waitForSelector(`${select}`)
          
                    const element = await page.$(`${select}`)

                    //await page.waitForSelector('#__next > div > div.container.cmc-main-section > div.cmc-main-section__content > div.cmc-currencies.aiq2zi-0.eXmmQp > div.cmc-currencies__details-panel > div',{timeout:5000});
                    //const element = await page.$('#__next > div > div.container.cmc-main-section > div.cmc-main-section__content > div.cmc-currencies.aiq2zi-0.eXmmQp > div.cmc-currencies__details-panel > div');
                    
                    const oldBoundingBox = await element.boundingBox();
                    if (oldBoundingBox != null){
                        oldBoundingBox.width= 1200;
                        oldBoundingBox.x =0;
                    }
                    else{
                        
                        await browser.close(); 
                        counter.decrement();
                        return;
                    }
                    

                    let quote_price;

                    quote_price = await page.$('#__next > div > div.main-content > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div.sc-16r8icm-0.hNsOU.container > div.sc-16r8icm-0.kXPxnI.container___lbFzk > div.sc-16r8icm-0.kXPxnI.priceSection___3kA4m > div.sc-16r8icm-0.kXPxnI.priceTitle___1cXUG > div')
                    //quote_price = await page.$('#__next > div > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div.sc-16r8icm-0.hNsOU.container > div.sc-16r8icm-0.kXPxnI.container___lbFzk')
                  
                    const innerText = await quote_price.getProperty('innerText')
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
                    console.log(`general:${error}`)
                }   
                counter.decrement();
                await browser.close();
                console.log(`counter decrement: ${counter.get()}`)
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
            //console.log(`cachelength: ${cache.length}`);
            if (cache.length  > 10)
            {
                let name = coins[Math.floor(Math.random() * 12)].name;
                console.log(`remove: ${name}`)
                cache.del(name)
            }
        }
    else{
        if (counter.get() > 2) console.log(`counter big: ${counter.get()}`);
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
