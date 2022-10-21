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
  CubeIcon,
  CommentIcon,
  Autocomplete,
  TextInput,
} from "evergreen-ui";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/search";
import { Feedback } from "../dialogs/feedback";

// const searchOptions = [
//   {
//     label: "Credentials",
//     route: "/app",
//   },
//   {
//     label: "Credit/Debit Cards",
//     route: "/app/cards",
//   },
//   {
//     label: "Bank Accounts",
//     route: "/app/banks",
//   },
//   {
//     label: "Files",
//     route: "/app/files",
//   },
//   {
//     label: "Crypto Wallets",
//     route: "/app/crypto",
//   },
//   {
//     label: "Account Settings",
//     route: "/app/settings",
//   },
//   {
//     label: "My Subscription",
//     route: "/app/subscription",
//   },
//   {
//     label: "Support",
//     route: "/app/support",
//   },
//   {
//     label: "Feedback",
//     route: "/app/feedback",
//   },
// ];

export const Nav = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [searchPlaceholder, setSearchPlaceholder] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  useEffect(() => {
    const route = router.pathname;
    setSearchValue("");

    if (route === "/app") {
      setSearchPlaceholder("Search credentials...");
    } else if (route === "/app/cards") {
      setSearchPlaceholder("Search cards...");
    } else if (route === "/app/banks") {
      setSearchPlaceholder("Search banks...");
    } else if (route === "/app/files") {
      setSearchPlaceholder("Search folders...");
    } else if (route === "/app/crypto") {
      setSearchPlaceholder("Search crypto wallets...");
    } else {
      setSearchPlaceholder("Search...");
    }
  }, [router.pathname]);

  // const handleSearch = (value) => {
  //   const option = searchOptions.find((option) => option.label === value);
  //   if (option) {
  //     router.push(option.route);
  //   }
  // };

  const handleDropdown = async (route) => {
    setIsMenuOpen(false);
    if (route === "feedback") return setIsFeedbackOpen(true);
    await router.push(route);
  };

  return (
    <div className={styles.navWrapper}>
      <div
        className={styles.navContainer}
        style={{
          maxWidth: 1000,
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
                {/*<Autocomplete*/}
                {/*  items={searchOptions.map((option) => option.label)}*/}
                {/*  onChange={(value) => handleSearch(value)}*/}
                {/*  selectedItem={null}*/}
                {/*  popoverMaxHeight={200}*/}
                {/*>*/}
                {/*  {(props) => {*/}
                {/*    const { getInputProps, getRef, inputValue, openMenu } =*/}
                {/*      props;*/}
                {/*    return (*/}
                {/*      <SearchInput*/}
                {/*        placeholder="Search..."*/}
                {/*        value={inputValue}*/}
                {/*        ref={getRef}*/}
                {/*        {...getInputProps()}*/}
                {/*      />*/}
                {/*    );*/}
                {/*  }}*/}
                {/*</Autocomplete>*/}
                <SearchInput
                  placeholder={searchPlaceholder}
                  width="100%"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  disabled={
                    router.pathname.endsWith("/app/settings") ||
                    router.pathname.endsWith("/app/subscription")
                  }
                />
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
                    <Menu.Item
                      icon={CogIcon}
                      onSelect={() => handleDropdown("/app/settings")}
                    >
                      Account Settings
                    </Menu.Item>
                    <Menu.Item
                      icon={CubeIcon}
                      onSelect={() => handleDropdown("/app/subscription")}
                    >
                      My Subscription
                    </Menu.Item>
                  </Menu.Group>
                  <Menu.Divider />
                  <Menu.Group>
                    {/*<Menu.Item icon={ChatIcon}>Support</Menu.Item>*/}
                    <Menu.Item
                      icon={CommentIcon}
                      onSelect={() => handleDropdown("feedback")}
                    >
                      Feedback
                    </Menu.Item>
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
      {router.pathname.includes("/app") && (
        <Feedback show={isFeedbackOpen} setShow={setIsFeedbackOpen} />
      )}
    </div>
  );
};
