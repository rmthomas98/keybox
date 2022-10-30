import styles from "./types.module.css";
import { Pane, Heading, Paragraph, Button, Card } from "evergreen-ui";
import Image from "next/image";

export const Types = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Heading
          size={700}
          marginBottom={10}
          fontWeight={700}
          textAlign={"center"}
        >
          More than just a password manager
        </Heading>
        <Paragraph textAlign={"center"} marginBottom={30} color="muted">
          We provide tools you won't believe you've been living without.
        </Paragraph>
        <div className={styles.contentContainer}>
          <Card
            width="100%"
            background="#fff"
            padding={24}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            className={styles.card}
          >
            <Image
              src="/images/purple-lock.svg"
              height={45}
              width={45}
              quality={100}
            />
            <Heading size={400} marginTop={6} marginBottom={10}>
              Login Credentials
            </Heading>
            <Paragraph size={300} textAlign={"center"} lineHeight={1.8}>
              Login information for all your accounts. No more forgetting your
              passwords or having to reset them. One password to rule them all.
            </Paragraph>
          </Card>{" "}
          <Card
            width="100%"
            background="#fff"
            padding={24}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            className={styles.card}
          >
            <Image
              src="/images/card.svg"
              height={45}
              width={45}
              quality={100}
            />
            <Heading size={400} marginTop={6} marginBottom={10}>
              Credit Cards
            </Heading>
            <Paragraph size={300} textAlign={"center"} lineHeight={1.8}>
              Store all your credit card information. The days of running to the
              other room or searching through your wallet or purse for your card
              are over.
            </Paragraph>
          </Card>
          <Card
            width="100%"
            background="#fff"
            padding={24}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            className={styles.endCard}
          >
            <Image
              src="/images/bank.svg"
              height={45}
              width={45}
              quality={100}
            />
            <Heading size={400} marginTop={6} marginBottom={10}>
              Bank Accounts
            </Heading>
            <Paragraph size={300} textAlign={"center"} lineHeight={1.8}>
              Bank account details are stored securely. Need to find your bank
              account or routing number? Not a problem with our software.
            </Paragraph>
          </Card>
        </div>
        <div className={styles.secondContentContainer}>
          <Card
            width="100%"
            background="#fff"
            padding={24}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            className={styles.card}
          >
            <Image
              src="/images/file.svg"
              height={45}
              width={45}
              quality={100}
            />
            <Heading size={400} marginTop={6} marginBottom={10}>
              File Storage
            </Heading>
            <Paragraph size={300} textAlign={"center"} lineHeight={1.8}>
              Create folders and store your most sensitive files. You can store
              any type of file you want. 15 GB of storage is included with your
              account.
            </Paragraph>
          </Card>
          <Card
            width="100%"
            background="#fff"
            padding={24}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            className={styles.card}
          >
            <Image
              src="/images/crypto.svg"
              height={45}
              width={45}
              quality={100}
            />
            <Heading size={400} marginTop={6} marginBottom={10}>
              Crypto Wallets
            </Heading>
            <Paragraph size={300} textAlign={"center"} lineHeight={1.8}>
              Keep track of all your crypto wallet details in one place. Need a
              place to store your private keys and seed phrases? Look no
              further.
            </Paragraph>
          </Card>{" "}
          <Card
            width="100%"
            background="#fff"
            padding={24}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            className={styles.endCard}
          >
            <Image
              src="/images/extension.svg"
              height={45}
              width={45}
              quality={100}
            />
            <Heading size={400} marginTop={6} marginBottom={10}>
              Browser Extension
            </Heading>
            <Paragraph size={300} textAlign={"center"} lineHeight={1.8}>
              Our soon to be released browser extension will allow you to
              autofill your login credentials and credit card information in
              seconds.
            </Paragraph>
          </Card>
        </div>
      </div>
    </div>
  );
};
