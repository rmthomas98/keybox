import styles from "./storage.module.css";
import {
  Heading,
  Alert,
  Icon,
  DatabaseIcon,
  Paragraph,
  Small,
} from "evergreen-ui";
import { partial } from "filesize";

const size = partial({ base: 3, standard: "jedec" });

export const Storage = ({ storageSize, status }) => {
  const maxStorage = 15000000000; // 15GB
  const storagePercentage = ((storageSize / maxStorage) * 100).toFixed(2);
  return (
    <div className={styles.container}>
      <Heading size={400} fontWeight={700} marginBottom={20}>
        File Storage
      </Heading>
      {status === "TRIAL_IN_PROGRESS" && (
        <Alert
          intent="warning"
          title="You are currently on a free trial. You can gain access to file uploads by upgrading to the premium plan."
        />
      )}
      {status === "SUBSCRIPTION_ACTIVE" && (
        <div className={styles.storageContainer}>
          <Heading size={300} marginBottom={5}>
            Storage used
          </Heading>
          <div className={styles.storageBarContainer}>
            <div
              className={styles.storageBar}
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <Heading
            size={200}
            marginTop={8}
            display="flex"
            alignItems={"center"}
          >
            <Icon icon={DatabaseIcon} marginRight={6} size={14} />{" "}
            {size(storageSize)} / {size(maxStorage)} ({storagePercentage}%)
          </Heading>
        </div>
      )}
      {status === "SUBSCRIPTION_ACTIVE" && (
        <Paragraph marginTop={20}>
          <Small>
            <strong>Note:</strong> You can upload files up to 50MB in size and
            have a maximum of 15GB in storage.<br></br> We plan to increase
            these limits in the future.
          </Small>
        </Paragraph>
      )}
    </div>
  );
};
