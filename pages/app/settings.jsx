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
} from "evergreen-ui";
import { useState } from "react";
import { Profile } from "../../components/settings/profile/profile";
import { getSession } from "next-auth/react";
import { Password } from "../../components/settings/password/password";
import { TwoFactorAuth } from "../../components/settings/twoFactorAuth/twoFactorAuth";
import { Storage } from "../../components/settings/storage/storage";

const Settings = ({ email, twoFactor, phone, status }) => {
  const [selected, setSelected] = useState("profile");

  return (
    <div className="container">
      <Heading
        size={600}
        fontWeight={700}
        marginBottom={20}
        display="flex"
        alignItems="center"
        borderBottom="1px solid #E6E8F0"
        paddingBottom={10}
      >
        <Icon icon={CogIcon} marginRight={6} /> Account Settings
      </Heading>
      <div className={styles.contentContainer}>
        <div className={styles.tabContainer}>
          <Tablist>
            <Tab
              direction="vertical"
              isSelected={selected === "profile"}
              onSelect={() => setSelected("profile")}
            >
              My Profile
            </Tab>
            <Tab
              direction="vertical"
              isSelected={selected === "password"}
              onSelect={() => setSelected("password")}
            >
              Password
            </Tab>
            <Tab
              direction="vertical"
              isSelected={selected === "twoFactor"}
              onSelect={() => setSelected("twoFactor")}
            >
              Two Factor Auth
            </Tab>
            <Tab
              direction="vertical"
              isSelected={selected === "storage"}
              onSelect={() => setSelected("storage")}
              disabled={status === "TRIAL_IN_PROGRESS"}
            >
              File Storage
            </Tab>
          </Tablist>
        </div>
        <div className={styles.content}>
          {selected === "profile" && <Profile userEmail={email} />}
          {selected === "password" && <Password />}
          {selected === "twoFactor" && (
            <TwoFactorAuth twoFactor={twoFactor} currentPhone={phone} />
          )}
          {selected === "storage" && <Storage />}
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
  const user = await prisma.user.findUnique({ where: { id } });

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

  return { props: { email, twoFactor, phone, status } };
};

export default Settings;
