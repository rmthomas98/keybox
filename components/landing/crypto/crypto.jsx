import styles from "./crypto.module.css";
import {
  Heading,
  Button,
  Paragraph,
  Text,
  Small,
  ArrowRightIcon,
} from "evergreen-ui";
import Image from "next/image";
import animationData from "../../../src/eth.json";
import Lottie from "lottie-react";

export const Crypto = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.imagesContainer}>
          <div className={styles.imageContainer}>
            {/*<Image*/}
            {/*  src="/images/eth.png"*/}
            {/*  quality={100}*/}
            {/*  height={250}*/}
            {/*  width={250}*/}
            {/*  alt={"ethereum"}*/}
            {/*/>*/}
            <Lottie animationData={animationData} loop={true} />
          </div>
        </div>
        <div className={styles.content}>
          <Heading size={100} fontWeight={700} marginBottom={10}>
            Crypto Wallets
          </Heading>
          <Heading size={700} marginBottom={20} fontWeight={700}>
            A solution for your crypto wallets
          </Heading>
          <Paragraph color="muted">
            You can save all your crypto wallet information in one place. Don't
            worry about losing your private keys, seed phrases, or anything
            else. Let us handle it for you.
          </Paragraph>
          <Button
            size={"large"}
            appearance="primary"
            iconAfter={ArrowRightIcon}
            marginTop={20}
          >
            Start for free
          </Button>
          <Paragraph marginTop={10} size={300}>
            No credit card required
          </Paragraph>
        </div>
      </div>
    </div>
  );
};
