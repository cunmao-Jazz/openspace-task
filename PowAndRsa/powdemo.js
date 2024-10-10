const crypto = require('crypto');

function pow_demo(message){
    let name = message
    let nonce=0

    console.time('ProofOfWork');

    while (true) {
        pow=name+nonce

        let hash =calculateSHA256Hash(name+nonce)

        if(hash.substring(0, 4)==="0000"){
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
}


main()