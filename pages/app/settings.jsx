import styles from "../../styles/settings.module.css";
import {
  Heading,
  Card,
  Button,
  TextInputField,
  CogIcon,
  Icon,
  Tab,
  Tablist,
  Popover,
  Menu,
  Position,
  CaretDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  ShieldIcon,
  EyeOnIcon,
  KeyIcon,
  DatabaseIcon,
} from "evergreen-ui";
import { useState } from "react";
import { Profile } from "../../components/settings/profile/profile";
import { getSession } from "next-auth/react";
import { Password } from "../../components/settings/password/password";
import { TwoFactorAuth } from "../../components/settings/twoFactorAuth/twoFactorAuth";
import { Storage } from "../../components/settings/storage/storage";

const Settings = ({ email, twoFactor, phone, status, storageSize }) => {
  const [selected, setSelected] = useState("profile");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [label, setLabel] = useState("My Profile");

  const handleSelect = (tab) => {
    setIsMenuOpen(false);
    setSelected(tab);
    if (tab === "profile") {
      setLabel("My Profile");
    } else if (tab === "password") {
      setLabel("Password");
    } else if (tab === "twoFactor") {
      setLabel("Two Factor Auth");
    } else if (tab === "storage") {
      setLabel("File Storage");
    }
  };

  return (
    <div className="container">
      <div className={styles.headerContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <Icon icon={CogIcon} marginRight={6} />
          Account Settings
        </Heading>
        <div className={styles.dropdownContainer}>
          <Popover
            isShown={isMenuOpen}
            onOpen={() => setIsMenuOpen(true)}
            onClose={() => setIsMenuOpen(false)}
            position={Position.BOTTOM_RIGHT}
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item
                    onSelect={() => handleSelect("profile")}
                    icon={UserIcon}
                    intent={(selected === "profile" && "#3366FF") || "none"}
                    background={selected === "profile" && "#EBF0FF"}
                    appearance="default"
                  >
                    My Profile
                  </Menu.Item>
                  <Menu.Item
                    onSelect={() => handleSelect("password")}
                    icon={EyeOnIcon}
                    intent={(selected === "password" && "#3366FF") || "none"}
                    background={selected === "password" && "#EBF0FF"}
                    appearance="default"
                  >
                    Password
                  </Menu.Item>
                  <Menu.Item
                    onSelect={() => handleSelect("twoFactor")}
                    icon={ShieldIcon}
                    intent={(selected === "twoFactor" && "#3366FF") || "none"}
                    background={selected === "twoFactor" && "#EBF0FF"}
                    appearance="default"
                  >
                    Two Factor Auth
                  </Menu.Item>
                  <Menu.Item
                    onSelect={() => handleSelect("storage")}
                    icon={DatabaseIcon}
                    intent={(selected === "storage" && "#3366FF") || "none"}
                    background={selected === "storage" && "#EBF0FF"}
                    appearance="default"
                  >
                    File Storage
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }
          >
            <Button iconAfter={isMenuOpen ? ChevronUpIcon : ChevronDownIcon}>
              {label}
            </Button>
          </Popover>
        </div>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.tabContainer}>
          <Tablist>
            <Tab
              direction="vertical"
              isSelected={selected === "profile"}
              onSelect={() => handleSelect("profile")}
            >
              <Icon icon={UserIcon} marginRight={6} /> My Profile
            </Tab>
            <Tab
              direction="vertical"
              isSelected={selected === "password"}
              onSelect={() => handleSelect("password")}
            >
              <Icon icon={EyeOnIcon} marginRight={6} /> Password
            </Tab>
            <Tab
              direction="vertical"
              isSelected={selected === "twoFactor"}
              onSelect={() => handleSelect("twoFactor")}
            >
              <Icon icon={ShieldIcon} marginRight={6} /> Two Factor Auth
            </Tab>
            <Tab
              direction="vertical"
              isSelected={selected === "storage"}
              onSelect={() => handleSelect("storage")}
            >
              <Icon icon={DatabaseIcon} marginRight={6} /> File Storage
            </Tab>
          </Tablist>
        </div>
        <div className={styles.content}>
          {selected === "profile" && <Profile userEmail={email} />}
          {selected === "password" && <Password />}
          {selected === "twoFactor" && (
            <TwoFactorAuth
              twoFactor={twoFactor}
              currentPhone={phone}
              status={status}
            />
          )}
          {selected === "storage" && (
            <Storage status={status} storageSize={storageSize} />
          )}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { id } = session;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { files: true },
  });

  if (!user.emailVerified) {
    return {
      redirect: {
        destination: `/verify?email=${user.email}`,
        permanent: false,
      },
    };
  }

  if (
    user.status === "NEW_ACCOUNT" ||
    user.status === "SUBSCRIPTION_CANCELED"
  ) {
    return {
      redirect: {
        destination: "/app/choose-plan",
        permanent: false,
      },
    };
  }

  if (user.paymentStatus === "FAILED") {
    return {
      redirect: {
        destination: "/app/subscription",
        permanent: false,
      },
    };
  }

  const { email, twoFactor, phone, status } = user;
  const storageSize = user.files.reduce((acc, file) => acc + file.size, 0);

  return { props: { email, twoFactor, phone, status, storageSize } };
};

export default Settings;
