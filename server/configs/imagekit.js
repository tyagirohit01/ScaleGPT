import Imagekit from 'imagekit';
import dotenv from "dotenv";

dotenv.config();

console.log("PUBLIC KEY: ", process.env.IMAGEKIT_PUBLIC_KEY);
console.log("URL ENDPOINT: ", process.env.IMAGEKIT_URL_ENDPOINT);

var imagekit = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export default imagekit