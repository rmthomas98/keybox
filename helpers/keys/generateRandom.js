import { KMSClient, GenerateRandomCommand } from "@aws-sdk/client-kms";

export const generateRandom = async () => {
  const client = new KMSClient({ region: "us-east-1" });

  const command = new GenerateRandomCommand({ NumberOfBytes: 64 });

  const { Plaintext } = await client.send(command);

  if (!Plaintext) return null;

  const key = Buffer.from(Plaintext).toString("base64");

  // erase plaintext from memory
  Plaintext.fill(0);

  return key || null;
};
