import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftaddress, nftmarketaddress
} from "../config"

import NFT from '../artifacts/contracts/NFT.sol/NFT.json' //this is how the ethers knows when to interact with the program
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  let rpcEndpoint = null

  if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
    rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL
  }

  useEffect(()=>{
    loadNFTs()
  },[])

  async function loadNFTs() { //where we call our smart contract and fetch nfts
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
    const tokenContract = new ethers.Contract(nftaddress,NFT.abi,provider)
    const marketContract = new ethers.Contract(nftmarketaddress,Market.abi,provider)
    const data = await marketContract.fetchMarketItems() //call all unsold market items

    const items = await Promise.all(data.map(async i=> {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri) //get NFT's metadata
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description:meta.data.description
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded')

  }

  // allows the user to connect their wallets
  async function buyNft (nft) {
    const web3Modal = new Web3Modal() //looks for ethereum wallet being injected in the web browser
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {value: price})

    await transaction.wait()

    loadNFTs()
  }

  if (loadingState == 'loaded' && !nfts.length) return(
    <h1 className='px-20 py-10 text-3xk'> No items in marketplace</h1>
  )

  return (
   <div className="flex justify-center">
    <div className="px-4" style={{maxWidth:'1600px'}}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {
          nfts.map((nft,i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image}/>
              <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
              </div>
              <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} Matic</p>
                  <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
   </div>
  )
}
