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

module.exports = [
    {
        name:'ripple',
        url: rippleURL,
        price:0,
        ammount:242,
        buff: null,
        baseprice: 610,
        time : 0
    },
    {
        name:'binance',
        url: binanceURL,
        price:0,
        ammount:68,
        buff: null,
        baseprice: 1310,
        time : 0
    },
    {
        name:'cardano',
        url: cardanoURL,
        price:0,
        ammount:1048,
        buff: null,
        baseprice:810,
        time : 0
    },
    {
        name:'tron',
        url: tronURL,
        price:0,
        ammount:4365,
        buff: null,
        baseprice: 400,
        time : 0
    },
    {
        name:'funfair',
        url: funfairURL,
        price:0,
        ammount:1299,
        buff: null,
        baseprice: 150,
        time : 0
    },
    {
        name:'poe',
        url: poeURL,
        price:0,
        ammount:800,
        buff: null,
        baseprice: 150,
        time : 0
    },
    {
        name:'enj',
        url: enjURL,
        price:0,
        ammount:400,
        buff: null,
        baseprice: 150,
        time : 0
    },
    {
        name:'xlm',
        url: xlmURL,
        price:0,
        ammount:440,
        buff: null,
        baseprice: 350,
        time : 0
    },
    {
        name:'xvg',
        url: xvgURL,
        price:0,
        ammount:509,
        buff: null,
        baseprice: 150,
        time : 0
    },
    {
        name:'pac',
        url: pacURL,
        price:0,
        ammount:206,
        buff: null,
        baseprice: 50,
        time : 0
    },
    {
        name:'eth',
        url: ethURL,
        price:0,
        ammount:1.19528776,
        buff: null,
        baseprice:1560,
        time : 0
    },
    {
        name:'bitcoin',
        url: bitcoinURL,
        price:0,
        ammount:0.01595059,
        buff: null,
        baseprice :310,
        time : 0
    }              
]

for (const coin of module.exports)
  module.exports[coin.name] = coin;
