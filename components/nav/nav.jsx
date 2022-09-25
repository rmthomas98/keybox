import styles from "./nav.module.css";
import { Heading, Button, Link } from "evergreen-ui";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

export const Nav = () => {
  const router = useRouter();

  return (
    <div className={styles.navWrapper}>
      <div className={styles.navContainer}>
        <NextLink
          href={router.pathname.includes("app") ? "/app" : "/"}
          passHref
        >
          <Link>
            <div className={styles.titleContainer}>
              <Image src="/images/logo.svg" height={30} width={30} />
              <Heading size={700} fontWeight={700} marginLeft={10}>
                KeyBox
              </Heading>
            </div>
          </Link>
        </NextLink>
        {!router.pathname.includes("/app") && (
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
              <Link
                color={router.pathname === "/about" ? "primary" : "neutral"}
              >
                About
              </Link>
            </NextLink>
          </div>
        )}
        {!router.pathname.includes("app") && (
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
        )}
        {router.pathname.endsWith("/app/choose-plan") && (
          <Button
            appearance="primary"
            intent="danger"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        )}
      </div>
    </div>
  );
};
