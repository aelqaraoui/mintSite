import React from 'react';
import logo from './main.gif';
import './index.css';
import './wallet.css';
let web3 = require('@solana/web3.js');
let fs = require('fs');

const CLUSTER = 'devnet';
const PRICE_PER_UNIT = 4;
const owner = "CyBizpsEVPjycYiaCMaDQFkHJWrPZJsBYWeYTz3JYVPX";

let whitelist = fs.readFileSync('whitelist', 'utf-8').split('\n');
whitelist.push(owner);

class Wallet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            publicKey: "",
            mintsLeft: 0,
            numberToMint: 1,
            alreadySubmitted: false,
            isWhiteListed: false,
        };

        this.connectPhantom = this.connectPhantom.bind(this);
        this.updateMintsLeft = this.updateMintsLeft.bind(this);
        this.registerMint = this.registerMint.bind(this);
        this.mintNft = this.mintNft.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    connectPhantom(){
        window.solana.connect();
        window.solana.on("connect", () => {
            if(!whiteList.includes(window.solana.publicKey.toString()))
            {
                alert("You're not whitelisted sorry!");
            }
            else 
            {
                this.updateMintsLeft();
            }
            this.setState({
                isConnected: true,
                isWhiteListed: whiteList.includes(window.solana.publicKey.toString()),
                publicKey: window.solana.publicKey.toString()
            });
        })
    }

    async updateMintsLeft()
    {
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000' 
            },
            body: JSON.stringify({
                address: window.solana.publicKey.toString()
              })
        };
        fetch('https://cors-anywhere.herokuapp.com/http://147.182.184.234/getMintsLeft', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.setState({
                    mintsLeft: data.mints_left
                });
            });
    }

    async registerMint(number, sign)
    {
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000' 
            },
            body: JSON.stringify({
                num: number,
                address: window.solana.publicKey.toString(),
                signature: sign
              })
        };
        fetch('https://cors-anywhere.herokuapp.com/http://147.182.184.234/reisterMint', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            });
    }

    async mintNft()
    {

        const connection = new web3.Connection(
            web3.clusterApiUrl(CLUSTER),
            'confirmed',
        );

        const walletPublicKey = window.solana.publicKey
        
        const to = owner;
        
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
              fromPubkey: walletPublicKey,
              toPubkey: to,
              lamports: this.state.numberToMint*PRICE_PER_UNIT*web3.LAMPORTS_PER_SOL,
            }),
          );

        transaction.recentBlockhash = await (await connection.getRecentBlockhash()).blockhash;
        transaction.feePayer = walletPublicKey
        
        const signedTransaction = await window.solana.signTransaction(transaction);
        let signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        console.log('SIGNATURE', signature);

        this.registerMint(this.state.numberToMint, signature);
        this.updateMintsLeft();
    
    }

    componentDidMount()
    {
        window.addEventListener('load', this.connectPhantom)
    }

    handleChange(event) {
        if (!(event.target.value < 1 || event.target.value > this.state.mintsLeft))
        {
            this.setState({numberToMint: event.target.value});
        }
    }
    
    handleSubmit(event) {
        if(!this.state.alreadySubmitted)
        {
            this.setState({alreadySubmitted: true})
            this.mintNft().then(
                () => {
                    alert('Thank you for being an early supporter');
                }
            );
            
            this.setState({alreadySubmitted: false})
        }
        
        event.preventDefault();
    }

    render(){
        if(this.state.isConnected && this.state.isWhiteListed)
        {    
            return (
                <div className="all">
                    <div className="col">
                        <h1 className="title">Xperiment</h1>
                        <p className="text">Xperiment is a collection of frames from a generative art animation.<br/><br/>
                            Each frame will be minted as an NFT.<br/><br/>
                            The collectors can then merge the frames into a single video NFT.<br/><br/>
                            The rarity is then defined by how many frames were merged into each single NFT.<br/><br/>
                            Each merge makes all the remaining NFTs more and more valuable until there is only a 1 on 1 extremely rare NFT.<br/><br/><br/>

                            Mint an NFT and let the games begin.<br/>
                        </p>
                        <form onSubmit={this.handleSubmit}>
                            <label>Mint Left : {this.state.mintsLeft}</label> 
                            <input className="input" type="number" value={this.state.numberToMint} onChange={this.handleChange} />
                            <input className="submitbtn" type="submit" value="Submit" />
                        </form>
                    </div>
                    <div className="col">
                        <img className="imgcol" src={logo}/>
                    </div>
                </div>
            );
        }
        else
        {
            return (
                <div className="all">
                </div>
            );
        }
    }
};

export default Wallet;