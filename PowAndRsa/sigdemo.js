const crypto = require('crypto');

function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, 
    publicKeyEncoding: {
      type: 'spki',       
      format: 'pem',      
    },
    privateKeyEncoding: {
      type: 'pkcs8',      
      format: 'pem',      
    },
  });

  return { publicKey, privateKey };
}


function signMessage(privateKey, message) {
  const sign = crypto.createSign('SHA256');
  sign.update(message);
  sign.end();
  const signature = sign.sign(privateKey, 'hex');
  return signature;
}


function verifyMessage(publicKey, message, signature) {
  const verify = crypto.createVerify('SHA256');
  verify.update(message);
  verify.end();
  const isValid = verify.verify(publicKey, signature, 'hex');
  return isValid;
}

function sig_demo(message){
    const { publicKey, privateKey } = generateKeyPair();

    const signature = signMessage(privateKey, message);

    const isVerified = verifyMessage(publicKey, message, signature);
    console.log('Signature verified:', isVerified);
}






function main(){
    sig_demo("0000f3dc53c2a5ffdf4351073e18b7fda680b8155c58a1d0bd8774a4bc338f2f")
}


main()