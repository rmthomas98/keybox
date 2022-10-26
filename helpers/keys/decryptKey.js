import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";

export const decryptKey = async (key) => {
  if (!key) return null;
  const client = new KMSClient({ region: process.env.AWS_REGION });
  const KeyId = process.env.AWS_KMS_KEY_ID;
  const CiphertextBlob = Buffer.from(key, "base64");

  const EncryptionContext = {
    stage: "dev",
    purpose: "user encryption key",
    origin: "us-east-1",
  };

  const command = new DecryptCommand({
    CiphertextBlob,
    KeyId,
    EncryptionContext,
  });

  const { Plaintext } = await client.send(command);

  if (!Plaintext) return null;

  const decryptedKey = Buffer.from(Plaintext).toString("base64");

  // erase plaintext from memory
  Plaintext.fill(0);

  return decryptedKey || null;
};
