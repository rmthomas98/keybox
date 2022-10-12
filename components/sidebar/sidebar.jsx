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
      label: "Credentials",
    },
    {
      pathname: "/app/cards",
      label: "Cards",
    },
    {
      pathname: "/app/banks",
      label: "Banks",
    },
    {
      pathname: "/app/files",
      label: "Files",
    },
    {
      pathname: "/app/crypto",
      label: "Crypto",
    },
    // {
    //   pathname: "/app/secrets",
    //   label: "Secrets",
    // },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <NextLink href="/app" passHref>
          <Link>
            <div className={styles.titleContainer}>
              <Image src="/images/logo.svg" height={25} width={25} />
              <Heading
                size={100}
                fontWeight={700}
                marginLeft={10}
                color="#101840"
              >
                DARKPINE
              </Heading>
            </div>
          </Link>
        </NextLink>
        <div className={styles.tabContainer}>
          <Tablist>
            {tabs.map((tab) => {
              return (
                <NextLink href={tab.pathname} key={tab.pathname}>
                  <a style={{ color: "inherit" }}>
                    <Tab
                      direction="vertical"
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
    </div>
  );
};
