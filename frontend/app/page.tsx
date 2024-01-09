"use client"

import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import { useState, useEffect, useRef } from 'react'
import { providers, Contract } from 'ethers'
import { createClient } from 'urql';
import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constants/index'
import { get } from 'http'

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const web3ModalRef = useRef();
  
  const QueryURL = "https://api.studio.thegraph.com/query/62337/brb-subgraph/version/latest"

  const query = `{
    addressAddedToWhitelists {
      whitelistedAddress
      blockNumber
      transactionHash
    }
  }`

  const client = createClient({
    url: QueryURL
  })

  const [addressAddedToWhitelists, setWhitelist] = useState([]);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Switch to Mumbai network");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      
      // creating an instance
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);

      await tx.wait();
      setLoading(false);

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    }
    catch (error) {
      console.error(error);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    }
    catch (error) {
      console.error(error);
    }
  };

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const address = await signer.getAddress();

      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    }
    catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    }
    catch (error) {
      console.error(error);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the whitelist! 😎
          </div>
        );
      }
      else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      }
      else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the whitelist
          </button>
        );
      }
    }
    else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'mumbai',
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);
  
  useEffect(()=>{
    const getWhitelists = async () => {
    const {data} = await client.query(query).toPromise();
    console.log(data);
    setWhitelist(data.addressAddedToWhitelists);
  }
  getWhitelists();
  }, [])

  return (
    <div>
      <Head>
        <title>Crypto-Devs</title>
        <meta name='description' content='Whitelist-Dapp' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to TOP-G Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} people have already joined the whitelist
          </div>
          {renderButton()}
        </div>
      </div>

      <div className={styles.subgraph}>
      Whitelist Addresses Details:
      </div>
      <div className={styles.subgraph}>
        <br/>{
        addressAddedToWhitelists!==null && addressAddedToWhitelists.length>0 && addressAddedToWhitelists.map((addressAddedToWhitelists)=>{
          return(
            <div>
              <br/><div>whitelistedAddress: {addressAddedToWhitelists.whitelistedAddress}</div>
              <br/><div>blockNumber: {addressAddedToWhitelists.blockNumber}</div>
              <br/><div>transactionHash: {addressAddedToWhitelists.transactionHash}</div>
              <br/><div className={styles.line}></div>
            </div>
          )
        })
        }
        <br/>        
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Shlok
      </footer>
    </div>
  )
}