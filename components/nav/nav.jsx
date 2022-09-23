import styles from "./nav.module.css";
import { Heading, Button, Link } from "evergreen-ui";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";

export const Nav = () => {
  const router = useRouter();

  return (
    <div className={styles.navWrapper}>
      <div className={styles.navContainer}>
        <NextLink href="/" passHref>
          <Link>
            <div className={styles.titleContainer}>
              <Image src="/images/logo.svg" height={30} width={30} />
              <Heading size={700} fontWeight={700} marginLeft={10}>
                KeyBox
              </Heading>
            </div>
          </Link>
        </NextLink>
        <div className={styles.navLinks}>
          <NextLink href="/features" passHref>
            <Link
              color={router.pathname === "/features" ? "primary" : "neutral"}
              marginRight={20}
            >
              Features
            </Link>
          </NextLink>
          <NextLink href="/pricing" passHref>
            <Link
              color={router.pathname === "/pricing" ? "primary" : "neutral"}
              marginRight={20}
            >
              Pricing
            </Link>
          </NextLink>
          <NextLink href="/about" passHref>
            <Link color={router.pathname === "/about" ? "primary" : "neutral"}>
              About
            </Link>
          </NextLink>
        </div>
        <div>
          <NextLink href="/login" passHref>
            <a>
              <Button marginRight={10}>Log in</Button>
            </a>
          </NextLink>
          <NextLink href="/signup" passHref>
            <a>
              <Button appearance="primary">Sign up</Button>
            </a>
          </NextLink>
        </div>
      </div>
    </div>
  );
};
