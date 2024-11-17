import { ethers } from "ethers";
import { 
    FlashbotsBundleProvider, 
    FlashbotsTransactionResponse,
    FlashbotsBundleResolution 
} from "@flashbots/ethers-provider-bundle";import dotenv from "dotenv";

dotenv.config();

const {
    OWNER_PRIVATE_KEY,
    MINTER_PRIVATE_KEY,
  } = process.env;

const NFT_ABI = [
    "function presale(uint256 amount) external payable",
    "function enablePresale() external",
    "function owner() external view returns (address)"
  
];

const provider = new ethers.providers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");



async function main() {
    const ownerWallet = new ethers.Wallet(OWNER_PRIVATE_KEY as string,provider)
    const minterWallet = new ethers.Wallet(MINTER_PRIVATE_KEY as string,provider)

    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        ownerWallet,
        'https://eth.llamarpc.com'
    );

    try{
        const nftContract = new ethers.Contract("0x050Cd1D35023d4a9972c3Cbcf8C3942fFAAAb44A", NFT_ABI, provider);

        const contractOwner = await nftContract.owner();
        if (contractOwner.toLowerCase() !== ownerWallet.address.toLowerCase()) {
          throw new Error("Not the Owner");
        }
        
        FlashbotsBundleResolution.BlockPassedWithoutInclusion

        const block = await provider.getBlock("latest");
        const targetBlockNumber = block.number + 1;

        const mintValue = ethers.utils.parseEther("0.01").mul(1);

        const gasPrice = ethers.utils.parseUnits("5", "gwei");

        const ownerNonce = await provider.getTransactionCount(ownerWallet.address);
        const minterNonce = await provider.getTransactionCount(minterWallet.address);

        const enablePresaleTx = await nftContract.populateTransaction.enablePresale();
        const signedEnablePresaleTx = await ownerWallet.signTransaction({
          ...enablePresaleTx,
          nonce: ownerNonce,
          gasLimit: ethers.utils.hexlify(100000),
          gasPrice: gasPrice,
        });

            // 准备presale交易
        const presaleTx = await nftContract.populateTransaction.presale(1);
        const signedPresaleTx = await minterWallet.signTransaction({
        ...presaleTx,
        nonce: minterNonce,
        gasLimit: ethers.utils.hexlify(200000),
        gasPrice: gasPrice,

        value: mintValue,
        });

        const bundle = [{
            signedTransaction: signedEnablePresaleTx
        }, {
            signedTransaction: signedPresaleTx
        }];

        const bundleResponse = (await flashbotsProvider.sendBundle(bundle, 7081570)) as FlashbotsTransactionResponse;

        console.log(bundleResponse)
        const resolution = await bundleResponse.wait();
        console.log("Bundle Resolution:", resolution);

        const receipts = await bundleResponse.receipts();
        console.log("Bundle receipts:", receipts);

        console.log("交易1 Hash:", ethers.utils.keccak256(signedEnablePresaleTx));
        console.log("交易2 Hash:", ethers.utils.keccak256(signedPresaleTx));

        // await provider.waitForTransaction(ethers.utils.keccak256(signedEnablePresaleTx));
        // await provider.waitForTransaction(ethers.utils.keccak256(signedPresaleTx));
        console.log("Transactions confirmed!");

    } catch(error){
        console.error("error:", error instanceof Error ? error.message : error);

    }
}   

main()