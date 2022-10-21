import styles from "./sidebar.module.css";
import {
  Tab,
  Tablist,
  Link,
  Heading,
  Badge,
  ShieldIcon,
  CreditCardIcon,
  BriefcaseIcon,
  FolderOpenIcon,
  FolderCloseIcon,
  OfflineIcon,
  Icon,
  Tooltip,
  Position,
} from "evergreen-ui";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useWindowWidth } from "@react-hook/window-size";

export const Sidebar = () => {
  const width = useWindowWidth();
  const router = useRouter();

  const tabs = [
    {
      pathname: "/app",
      label: "Credentials",
      icon: ShieldIcon,
    },
    {
      pathname: "/app/cards",
      label: "Cards",
      icon: CreditCardIcon,
    },
    {
      pathname: "/app/banks",
      label: "Banks",
      icon: BriefcaseIcon,
    },
    {
      pathname: "/app/files",
      label: "Files",
      icon: FolderCloseIcon,
    },
    {
      pathname: "/app/crypto",
      label: "Crypto",
      icon: OfflineIcon,
    },
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
                className={styles.title}
              >
                DARKPINE
              </Heading>
            </div>
          </Link>
        </NextLink>
        <div className={styles.tabContainer}>
          {/*<Heading*/}
          {/*  size={100}*/}
          {/*  // fontWeight={700}*/}
          {/*  color="#696f8c"*/}
          {/*  marginLeft={18}*/}
          {/*  marginBottom={10}*/}
          {/*>*/}
          {/*  MAIN*/}
          {/*</Heading>*/}
          <Tablist>
            {tabs.map((tab) => {
              return (
                <NextLink href={tab.pathname} key={tab.pathname}>
                  <a style={{ color: "inherit" }}>
                    <Tooltip
                      content={tab.label}
                      key={tab.label}
                      position={Position.RIGHT}
                      pointerEvents="none"
                      isShown={width < 800 && undefined}
                      hasArrow={true}
                    >
                      <Tab
                        direction="vertical"
                        isSelected={router.pathname === tab.pathname}
                      >
                        <Icon icon={tab.icon} className={styles.icon} />
                        <span className={styles.tabLabel}>{tab.label}</span>
                      </Tab>
                    </Tooltip>
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
