const {Web3Storage} = require('web3.storage');

function getAccessToken() {
    // If you're just testing, you can paste in a token
    // and uncomment the following line:
    // In a real app, it's better to read an access token from an
    // environement variable or other configuration that's kept outside of
    // your code base. For this to work, you need to set the
    // WEB3STORAGE_TOKEN environment variable before you run your code.
    return process.env.WEB3STORAGE_TOKEN
}
function makeStorageClient() {
    return new Web3Storage({ token: getAccessToken()})
}

module.exports={
    getAccessToken,
    makeStorageClient
}