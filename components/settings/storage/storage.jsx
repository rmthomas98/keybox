import styles from "./storage.module.css";
import { Heading } from "evergreen-ui";

export const Storage = () => {
  return (
    <div className={styles.container}>
      <Heading size={400} fontWeight={700} marginBottom={20}>
        File Storage
      </Heading>
    </div>
  );
};
