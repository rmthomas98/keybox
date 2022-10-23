import {
  KmsKeyringNode,
  buildClient,
  CommitmentPolicy,
} from "@aws-crypto/client-node";

const { encrypt, decrypt } = buildClient(
  CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
);

const handler = async (req, res) => {
  const generatorKeyId = "arn:aws:kms:us-east-2:361180565759:alias/Darkpine";

  const keyIds = [
    "arn:aws:kms:us-east-2:361180565759:key/4804d9a3-e367-49bb-9a9d-e1fbc008de27",
  ];

  const keyring = new KmsKeyringNode({ generatorKeyId, keyIds });

  const context = {
    stage: "dev",
    purpose: "test",
    origin: "us-east-2",
  };

  const clearText = "Hello World";

  const { result } = await encrypt(keyring, clearText, {
    encryptionContext: context,
  });

  const keyringDecrypt = new KmsKeyringNode({ keyIds });

  const { plaintext, messageHeader } = await decrypt(keyringDecrypt, result);

  res.json();
};

export default handler;
