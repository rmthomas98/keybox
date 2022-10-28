import styles from "./main.module.css";
import {
  Heading,
  Button,
  Paragraph,
  TextInput,
  ArrowRightIcon,
  Text,
  Small,
} from "evergreen-ui";
import NextLink from "next/link";
import Lottie from "lottie-react";
import animationData from "../../../src/security.json";

export const Main = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          <Heading size={100} fontWeight={700} marginBottom={3}>
            secure your data
          </Heading>
          <Heading size={800} fontWeight={700}>
            Never forget your passwords again
          </Heading>
          <Paragraph marginTop={12} marginBottom={24}>
            Tired of forgetting your passwords? We are too. Now you can store
            all your passwords and other sensitive data in one secure place.
          </Paragraph>
          <div className={styles.inputContainer}>
            {/*<TextInput*/}
            {/*  placeholder="Your email..."*/}
            {/*  width="100%"*/}
            {/*  maxWidth={300}*/}
            {/*/>*/}
            <NextLink href="/signup" passHref>
              <a>
                <Button appearance="primary" size={"large"} marginRight={10}>
                  Get started
                </Button>
              </a>
            </NextLink>
            <Button size={"large"}>Learn more</Button>
          </div>
        </div>
        <Lottie
          animationData={animationData}
          loop={true}
          style={{
            width: 600,
            minWidth: 400,
            position: "relative",
            top: 30,
            left: 30,
          }}
        />
      </div>
    </div>
  );
};
