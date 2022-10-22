import styles from "./bottomNav.module.css";
import {
  BriefcaseIcon,
  CreditCardIcon,
  FolderCloseIcon,
  Icon,
  OfflineIcon,
  Position,
  ShieldIcon,
  Tab,
  Tablist,
  Tooltip,
} from "evergreen-ui";
import { useRouter } from "next/router";
import NextLink from "next/link";

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

export const BottomNav = () => {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Tablist width="100%" display="flex" justifyContent="space-evenly">
          {tabs.map((tab) => {
            return (
              <NextLink href={tab.pathname} key={tab.pathname}>
                <a style={{ color: "inherit" }}>
                  <Tab isSelected={router.pathname === tab.pathname}>
                    <Icon icon={tab.icon} />
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
