import styles from "./footer.module.css";
import NextLink from "next/link";
import { Heading, Link, Small } from "evergreen-ui";
import Image from "next/image";

export const Footer = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.companyContainer}>
          <NextLink href="/" passHref>
            <Link>
              <div className={styles.titleContainer}>
                <Image src="/images/logo.svg" height={30} width={30} />
                <Heading size={100} marginLeft={10} color="#fff">
                  DARKPINE
                </Heading>
              </div>
            </Link>
          </NextLink>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.socialContainer}>
            <NextLink href="https://twitter.com" passHref>
              <Link className={styles.link} color="neutral">
                Twitter
              </Link>
            </NextLink>
            <NextLink href="https://twitter.com" passHref>
              <Link className={styles.link} color="neutral">
                Instagram
              </Link>
            </NextLink>
            <NextLink href="https://twitter.com" passHref>
              <Link className={styles.link} color="neutral">
                <Small>Facebook</Small>
              </Link>
            </NextLink>
          </div>
        </div>
      </div>
    </div>
  );
};
