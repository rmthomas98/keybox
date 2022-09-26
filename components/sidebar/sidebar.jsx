import styles from "./sidebar.module.css";
import { Tab, Tablist, Link, Heading } from "evergreen-ui";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

export const Sidebar = () => {
  const router = useRouter();

  const tabs = [
    {
      pathname: "/app",
      label: "Passwords",
    },
    {
      pathname: "/app/cards",
      label: "Cards",
    },
    {
      pathname: "/app/bank-accounts",
      label: "Bank Accounts",
    },
    {
      pathname: "/app/files",
      label: "Files",
    },
    {
      pathname: "/app/secrets",
      label: "Secrets",
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <NextLink href="/app" passHref>
          <Link>
            <div className={styles.titleContainer}>
              <Image src="/images/logo.svg" height={30} width={30} />
              <Heading size={700} fontWeight={700} marginLeft={10}>
                KeyBox
              </Heading>
            </div>
          </Link>
        </NextLink>
        <Tablist marginTop={30}>
          {tabs.map((tab) => {
            return (
              <NextLink href={tab.pathname}>
                <a style={{ color: "inherit" }}>
                  <Tab
                    direction="vertical"
                    key={tab.pathname}
                    isSelected={router.pathname === tab.pathname}
                  >
                    {tab.label}
                  </Tab>
                </a>
              </NextLink>
            );
          })}
        </Tablist>
      </div>
    </div>
  );
};
