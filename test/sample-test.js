const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTmarket", function () {
  it("Should create and execute market sales", async function () {
    // get a reference to that market
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    await market.deployed() // wait for it to be deployed
    const marketAddress = market.address

    // now we deploy the NFT contract and get the reference
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('100','ether')

    await nft.createToken("https://www.mytokenlocation.com") //token location is the URI of the NFT
    await nft.createToken("https://www.mytokenlocation2.com")

    await market.createMarketItem(nftContractAddress,1,auctionPrice,{value:listingPrice})
    await market.createMarketItem(nftContractAddress,2,auctionPrice,{value:listingPrice})

    //get reference to a bunch of test accounts
    const [_,buyer1Address, buyer2Address] = await ethers.getSigners()

    await market.connect(buyer1Address).createMarketSale(nftContractAddress,1,{value: auctionPrice}) //the id of the token is 1
 
    let items = await market.fetchMarketItems()
    
    // unsold items without any parsing
    console.log('unsold items:',items)

    // now we will map through each one and make them readeable
    items = await Promise.all( items.map(async i=> {
      //get the token uri
      const tokenUri = await nft.tokenURI(i.tokenId)
      //create an item
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }

      return item

    }))

    console.log('readeable unsold items:',items)


  });
});
