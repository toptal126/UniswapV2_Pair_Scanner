# Uniswap V2 Pair Scanner

## Compatible with various networks and Dex

[![N|Solid](https://bscscan.com/images/logo-bscscan-white.svg?v=0.0.2)](https://bscscan.com)

Uniswap V2 Pair Scanner is public open-source project for getting live information of millions of cryptocurrencies working on EVM-Compatible networks (Ethereum, Binance Smart Chain, Polyon, AVAX and so on).

## Features

-   Scan all pairs on any DEX built in EVM networks
-   Get most-updated price of any digital asset
-   ✨Linked to MongoDB Cloud✨

Markdown is a lightweight markup language based on the formatting conventions
that people naturally use in email.
As [John Gruber] writes on the [Markdown site][df1]

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

## Tech

Uniswap V2 Pair Scanner uses a number of open source projects to work properly:

-   [Uniswap-V2] - Swap, earn, and build on the leading decentralized crypto trading protocol
-   [BSCScan] - HTML enhanced for web apps!
-   [Web3.js] - awesome web-based text editor
-   [node.js] - evented I/O for the backend
-   [MongoDB] - source-available cross-platform document-oriented database program

And of course Uniswap V2 Pair Scanner itself is open source with a [public repository]
on GitHub.

## Installation

This requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd UniswapV2_Pair_Scanner
npm i
npm start
```

## How to use this?

UniswapV2_Pair_Scanner has several features built-in with scripts.

Update latest pairs:

```sh
npm start
npm start 19500
-- update from pair id is bigger than 19500 --
```

update from pair id is bigger than 19,500:

```sh
npm start 19500
```

Update most hot pairs its locked value is larger than million dollars:

```sh
npm run update-top
```

Update most hot pairs its locked value is larger than million 150,000:

```sh
npm run update-top 150000
```

(optional) Remove zero-value pairs:

```sh
npm run remove-zero
```

> Welcome your Contribution!!!

## License

MIT

**Free Software, Hell Yeah!**

[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[mongodb]: https://mongodb.com
[uniswap-v2]: https://uniswap.org/
[public repository]: https://github.com/OzoneClub/UniswapV2_Pair_Scanner
[df1]: http://daringfireball.net/projects/markdown/
[markdown-it]: https://github.com/markdown-it/markdown-it
[web3.js]: https://web3js.readthedocs.io/
[node.js]: http://nodejs.org
[twitter bootstrap]: http://twitter.github.com/bootstrap/
[jquery]: http://jquery.com
[@tjholowaychuk]: http://twitter.com/tjholowaychuk
[express]: http://expressjs.com
[bscscan]: http://bscscan.com
[gulp]: http://gulpjs.com
[pldb]: https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md
[plgh]: https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md
[plgd]: https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md
[plod]: https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md
[plme]: https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md
[plga]: https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md
