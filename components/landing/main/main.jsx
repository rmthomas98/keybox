import styles from "./main.module.css";
import {
  Heading,
  Button,
  Paragraph,
  TextInput,
  ArrowRightIcon,
  Text,
  Small,
  Badge,
} from "evergreen-ui";
import NextLink from "next/link";
import Lottie from "lottie-react";
import animationData from "../../../src/security-one.json";

export const Main = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          <Heading size={100} fontWeight={700} marginBottom={3}>
            zero-knowledge & Zero-Trust Protocol
          </Heading>
          <Heading size={800} fontWeight={700} marginBottom={20}>
            Never forget your passwords again
          </Heading>
          <Paragraph marginTop={12} marginBottom={24} color="muted">
            Tired of forgetting your passwords? We got you covered. Now you can
            store all your passwords and other sensitive data in one secure
            place.
          </Paragraph>
          <div className={styles.inputContainer}>
            <NextLink href="/signup" passHref>
              <a>
                <Button
                  appearance="primary"
                  intent="success"
                  size={"large"}
                  marginRight={10}
                  iconAfter={ArrowRightIcon}
                >
                  Get started
                </Button>
              </a>
            </NextLink>
            <Button size={"large"}>View pricing</Button>
          </div>
        </div>
        <Lottie
          animationData={animationData}
          loop={true}
          style={{
            width: 330,
            minWidth: 270,
            // position: "relative",
            // top: 30,
            // left: 30,
          }}
        />
      </div>
    </div>
  );
};
