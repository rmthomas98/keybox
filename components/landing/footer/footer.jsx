import styles from "./footer.module.css";
import NextLink from "next/link";
import { Heading, Link, Small, Text } from "evergreen-ui";
import Image from "next/image";
import { FiFacebook, FiInstagram, FiTwitter, FiMail } from "react-icons/fi";

export const Footer = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.flexContainer}>
          <div className={styles.companyContainer}>
            <NextLink href="/" passHref>
              <Link color="neutral">
                <div className={styles.titleContainer}>
                  <Image src="/images/logo.svg" height={30} width={30} />
                  <Heading
                    size={100}
                    marginLeft={10}
                    color="#101840"
                    fontWeight={700}
                  >
                    DARKPINE
                  </Heading>
                </div>
              </Link>
            </NextLink>
            <Link
              href="/mailto:support@darkpine.io"
              className={styles.link}
              marginTop={10}
              color="neutral"
            >
              <FiMail size={16} style={{ marginRight: 8 }} />
              <Small>support@darkpine.io</Small>
            </Link>
          </div>
          {/*<div className={styles.contentContainer}>*/}
          <div className={styles.companyInfoContainer}>
            <Heading size={100} marginBottom={20} color="#101840">
              Company
            </Heading>
            <NextLink href="/" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Privacy Policy</Small>
              </Link>
            </NextLink>
            <NextLink href="/" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Terms of Service</Small>
              </Link>
            </NextLink>
            <NextLink href="/" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Security Info</Small>
              </Link>
            </NextLink>
          </div>
          <div className={styles.linkContainer}>
            <Heading
              size={100}
              marginBottom={20}
              // fontWeight={700}
              color="#101840"
            >
              Quick Links
            </Heading>
            <NextLink href="/" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Pricing</Small>
              </Link>
            </NextLink>
            <NextLink href="/" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Resources</Small>
              </Link>
            </NextLink>
            <NextLink href="/" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Sign up</Small>
              </Link>
            </NextLink>
            <NextLink href="/" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Log in</Small>
              </Link>
            </NextLink>
          </div>
          <div className={styles.socialContainer}>
            <Heading
              size={100}
              marginBottom={20}
              // fontWeight={700}
              color="#101840"
            >
              socials
            </Heading>
            <NextLink href="https://twitter.com" passHref>
              <Link className={styles.link} color="neutral">
                <FiFacebook size={16} style={{ marginRight: 8 }} />
                <Small>Facebook</Small>
              </Link>
            </NextLink>
            <NextLink href="https://twitter.com" passHref>
              <Link className={styles.link} color="neutral">
                <FiInstagram size={16} style={{ marginRight: 8 }} />
                <Small>Instagram</Small>
              </Link>
            </NextLink>
            <NextLink href="https://twitter.com" passHref>
              <Link className={styles.link} color="neutral">
                <FiTwitter size={16} style={{ marginRight: 8 }} />
                <Small>Twitter</Small>
              </Link>
            </NextLink>
          </div>
          {/*</div>*/}
        </div>
        <div className={styles.bottomContainer}>
          <Text opacity={0.8}>
            <Small>&copy; 2022 Darkpine. All rights reserved.</Small>
          </Text>
          <Image
            src="/images/acceptedCards.png"
            height={38}
            width={266}
            quality={100}
          />
        </div>
      </div>
    </div>
  );
};
