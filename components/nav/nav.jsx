import styles from "./nav.module.css";
import {
  Heading,
  Button,
  Link,
  Popover,
  Menu,
  Position,
  SearchInput,
  CogIcon,
  BoxIcon,
  LogOutIcon,
  ChatIcon,
  CaretDownIcon,
  Badge,
} from "evergreen-ui";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useState } from "react";

export const Nav = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  return (
    <div className={styles.navWrapper}>
      <div
        className={styles.navContainer}
        style={{
          maxWidth:
            router.pathname.includes("/app") &&
            router.pathname !== "/app/choose-plan" &&
            router.pathname !== "/app/new-trial" &&
            router.pathname !== "/app/new-subscription"
              ? 1000
              : 1000,
        }}
      >
        {!router.pathname.includes("/app") && (
          <NextLink href="/" passHref>
            <Link>
              <div className={styles.titleContainer}>
                <Image src="/images/logo.svg" height={30} width={30} />
                <Heading size={700} fontWeight={700} marginLeft={10}>
                  DARKPINE
                </Heading>
              </div>
            </Link>
          </NextLink>
        )}
        {router.pathname.endsWith("/app/choose-plan") && (
          <NextLink href="/app" passHref>
            <Link>
              <div className={styles.titleContainer}>
                <Image src="/images/logo.svg" height={30} width={30} />
                <Heading size={700} fontWeight={700} marginLeft={10}>
                  DARKPINE
                </Heading>
              </div>
            </Link>
          </NextLink>
        )}
        {router.pathname.includes("/app") &&
          !router.pathname.endsWith("/app/choose-plan") && (
            <>
              {/*<NextLink href="/app" passHref>*/}
              {/*  <Link minWidth="fit-content">*/}
              {/*    <div className={styles.titleContainer}>*/}
              {/*      <Image src="/images/logo.svg" height={30} width={30} />*/}
              {/*      <Heading size={600} marginLeft={10}>*/}
              {/*        KeyBox*/}
              {/*      </Heading>*/}
              {/*    </div>*/}
              {/*  </Link>*/}
              {/*</NextLink>*/}
              <div
                className={styles.searchContainer}
                style={{
                  width: "100%",
                  maxWidth: 400,
                  marginRight: 20,
                  // marginLeft: 20,
                }}
              >
                <SearchInput placeholder="Search..." width="100%" />
              </div>
            </>
          )}
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
        {router.pathname.includes("/app") &&
          !router.pathname.endsWith("/app/choose-plan") && (
            <Popover
              isShown={isMenuOpen}
              onOpen={() => setIsMenuOpen(true)}
              onClose={() => setIsMenuOpen(false)}
              position={Position.BOTTOM_RIGHT}
              content={
                <Menu>
                  <Menu.Group>
                    <Menu.Item icon={CogIcon}>Account Settings</Menu.Item>
                    <Menu.Item icon={BoxIcon}>My Subscription</Menu.Item>
                  </Menu.Group>
                  <Menu.Divider />
                  <Menu.Group>
                    <Menu.Item icon={ChatIcon}>Support</Menu.Item>
                  </Menu.Group>
                  <Menu.Divider />
                  <Menu.Group>
                    <Menu.Item
                      icon={LogOutIcon}
                      intent="danger"
                      onSelect={handleSignOut}
                    >
                      Sign Out
                    </Menu.Item>
                  </Menu.Group>
                </Menu>
              }
            >
              <Button minWidth="fit-content">My Account</Button>
            </Popover>
          )}
      </div>
    </div>
  );
};
