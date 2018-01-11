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

for (const coin of module.exports)
  module.exports[coin.name] = coin;