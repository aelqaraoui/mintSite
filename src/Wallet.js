import React from 'react';
import logo from './main.gif';
import './index.css';
let web3 = require('@solana/web3.js');

const gitStyle = {
    "height": "50%",
    "margin-left": "10%",
}

const buttonStyle = {
    "background-color": "#490F09",
    "color": "black",
    "border" : "0px",
    "text-decoration": "none",
    "padding": "0.5% 1%",
    "font-family": "F",
    "font-size": "large",
    "font-weight": "bold",
    "margin-left": "45%",
    "width": "10%"
}

const bodyStyle = {
    "background-color": "black",
    "color": "#490F09",
    "height": "100vh",
    "width": "90%", 
    "padding-top": "12%",
    "padding-left": "5%",
    "padding-right": "5%",
}

const titleStyle = {
    "color": "white",
    "margin-top": "5%",
    "padding-top": "2%",
    "text-align": "center",
}

const textStyle = {
    "color": "white",
    "margin-top": "0",
    "margin-left": "5%",
    "text-align": "center"
}

const getProvider = () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
    window.open("https://phantom.app/", "_blank");
};

class Wallet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            publicKey: "",
        };

        this.connectPhantom = this.connectPhantom.bind(this);
        this.mintNft = this.mintNft.bind(this);
    }
    
    connectPhantom(){
        window.solana.connect();

        window.solana.on("connect", () => {
            this.setState({
                isConnected: true,
                publicKey: window.solana.publicKey.toString()
            });
        })
    }

    async mintNft()
    {

        const connection = new web3.Connection(
            web3.clusterApiUrl('devnet'),
            'confirmed',
        );

        const walletPublicKey = window.solana.publicKey
        
        const to = "2ypHF4WEgCDp12o6GVS8BDbhuWiYhjzk3hTUaNB78YGP";
        
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
              fromPubkey: walletPublicKey,
              toPubkey: to,
              lamports: 4*web3.LAMPORTS_PER_SOL,
            }),
          );

        transaction.recentBlockhash = await (await connection.getRecentBlockhash()).blockhash;
        transaction.feePayer = walletPublicKey
        
        const signedTransaction = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        console.log('SIGNATURE', signature);
    
    }
    
    componentDidMount()
    {
        window.addEventListener('load', this.connectPhantom)
    }

    render(){
        if(this.state.isConnected)
        {    
            return (
                <div style={bodyStyle}>
                    <div style={{"float": "left", "width": "40%"}}>
                    <h1 style={titleStyle}>Xperiment</h1>
                    <p style={textStyle}>Xperiment is a collection of frames from a generative art animation.<br/><br/>
                        Each frame will be minted as an NFT.<br/><br/>
                        The collectors can then merge the frames into a single video NFT.<br/><br/>
                        The rarity is then defined by how many frames were merged into each single NFT.<br/><br/>
                        Each merge makes all the remaining NFTs more and more valuable until there is only a 1 on 1 extremely rare NFT.<br/><br/><br/>

                        Mint an NFT and let the games begin.<br/>
                    </p>
                    <button style={buttonStyle} onClick={this.mintNft}>Mint</button>
                    </div>
                    <img style={gitStyle} src={logo}/>
                </div>
            );
        }
        else
        {
            return (
                <div style={bodyStyle}>
                </div>
            );
        }
    }
};

export default Wallet;