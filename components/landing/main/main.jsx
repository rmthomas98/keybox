import styles from "./main.module.css";
import { Heading, Button, Paragraph } from "evergreen-ui";
import NextLink from "next/link";
import Lottie from "lottie-react";
import animationData from "../../../src/security.json";

export const Main = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          <Heading size={100} fontWeight={700}>
            Zero-Knowledge
          </Heading>
          <Heading size={900} fontWeight={700}>
            Secure your data with zero-knowledge encryption
          </Heading>
          <Paragraph marginTop={20}>
            Never forget your password again.
          </Paragraph>
        </div>
        {/*<div className={styles.lottieContainer}>*/}
        <Lottie
          animationData={animationData}
          loop={true}
          style={{
            width: 600,
            minWidth: 400,
            position: "relative",
            bottom: 50,
          }}
        />
        {/*</div>*/}
      </div>
    </div>
  );
};
