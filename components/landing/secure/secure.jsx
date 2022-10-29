import styles from "./secure.module.css";
import { Heading, Icon, LockIcon, Paragraph } from "evergreen-ui";
import Image from "next/image";

export const Secure = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Heading
          size={100}
          fontWeight={700}
          textAlign={"center"}
          className={styles.header}
        >
          One Password to Replace Them All
        </Heading>
        <div className={styles.contentContainer}>
          <div className={styles.content}>
            <Image
              src="/images/crown.svg"
              height={40}
              width={40}
              quality={100}
            />
            <Heading size={400} marginBottom={10} marginTop={6}>
              Your only password
            </Heading>
            <Paragraph size={300} color="muted">
              Say goodbye to all your passwords. With one password you can
              access all your accounts.
            </Paragraph>
          </div>
          <div className={styles.content}>
            <Image
              src="/images/lock.svg"
              height={40}
              width={40}
              quality={100}
            />
            <Heading size={400} marginBottom={10} marginTop={6}>
              Top notch security
            </Heading>
            <Paragraph size={300} color="muted">
              Our software is built with a zero-knowledge model. We could never
              see your data even if we wanted to.
            </Paragraph>
          </div>
          <div className={styles.content} style={{ marginRight: 0 }}>
            <Image
              src="/images/flash.svg"
              height={40}
              width={40}
              quality={100}
            />
            <Heading size={400} marginBottom={10} marginTop={6}>
              24/7 Access
            </Heading>
            <Paragraph size={300} color="muted">
              Your data is always available to you. Access all of your stored
              data from any device, at any time.
            </Paragraph>
          </div>
          {/*<div className={styles.content} style={{ marginRight: 0 }}>*/}
          {/*  <Image*/}
          {/*    src="/images/rocket.svg"*/}
          {/*    height={40}*/}
          {/*    width={40}*/}
          {/*    quality={100}*/}
          {/*  />*/}
          {/*  <Heading size={400} marginBottom={10} marginTop={6}>*/}
          {/*    Easy to use*/}
          {/*  </Heading>*/}
          {/*  <Paragraph size={300}>*/}
          {/*    We made it as easy as possible to use our software so anyone can*/}
          {/*    use it, even your grandma.*/}
          {/*  </Paragraph>*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
};
