const ethers = require('ethers');
const crypto = require('crypto');

async function sig_demo(message){
    const wallet = ethers.Wallet.createRandom();

    const signature = await wallet.signMessage(message);

    const signerAddress = ethers.utils.verifyMessage(message, signature);

    console.log(signerAddress)
    
    if (signerAddress === wallet.address) {
        console.log("success")
    }else {
        console.log("Sig verification error")
    }
}


function pow_demo(message){
    let name = message
    let nonce=0

    console.time('ProofOfWork');

    while (true) {
        pow=name+nonce

        let hash =calculateSHA256Hash(name+nonce)

        if(hash.substring(0, 6)==="000000"){
            console.log(`hash: ${hash}, nonce: ${nonce}`);
            break
        }

        nonce++
    }

    console.timeEnd('ProofOfWork');
    
}

function calculateSHA256Hash(inputString) {
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
}


async function main(){
    pow_demo("crazycat")
    // await sig_demo("crazycat0")
}


main()