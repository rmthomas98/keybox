import {
  KMSClient,
  GenerateDataKeyWithoutPlaintextCommand,
  GenerateDataKeyCommand,
} from "@aws-sdk/client-kms";

export const generateDataKey = async () => {
  const client = new KMSClient({ region: process.env.AWS_REGION });
  const KeyId = process.env.AWS_KMS_KEY_ID;
  const KeySpec = "AES_256";

  const EncryptionContext = {
    stage: "dev",
    purpose: "user encryption key",
    origin: "us-east-1",
  };

  const command = new GenerateDataKeyWithoutPlaintextCommand({
    KeyId,
    KeySpec,
    EncryptionContext,
  });

  const { CiphertextBlob } = await client.send(command);

  if (!CiphertextBlob) return null;

  return Buffer.from(CiphertextBlob).toString("base64");
};
