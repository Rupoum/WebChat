import sodium from "libsodium-wrappers"
export async function decryptmessage(receiverPublicKeyHex:string, receiverPrivateKeyHex:string, encryptedBase64:string) {
    await sodium.ready;


    const receiverPublicKey = sodium.from_hex(receiverPublicKeyHex);
    const receiverPrivateKey = sodium.from_hex(receiverPrivateKeyHex);
    const encryptedMessage = sodium.from_base64(encryptedBase64, sodium.base64_variants.ORIGINAL);
    const decryptedMessageBytes = sodium.crypto_box_seal_open(encryptedMessage, receiverPublicKey, receiverPrivateKey);
    const decryptedMessage = sodium.to_string(decryptedMessageBytes);

    return decryptedMessage;
}