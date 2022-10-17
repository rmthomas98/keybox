import styles from "./password.module.css";
import {
  Heading,
  Button,
  TextInputField,
  toaster,
  EyeOffIcon,
  EyeOpenIcon,
} from "evergreen-ui";
import {useState, useEffect} from "react";
import axios from "axios";
import {getSession} from "next-auth/react";

export const Password = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (password.length >= 8 && confirmPassword.length >= 8) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [password, confirmPassword]);

  const handleConfirm = async () => {
    if (password.length < 8) {
      toaster.danger("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toaster.danger("Passwords do not match");
      return;
    }

    setIsLoading(true)
    const session = await getSession();
    const {id} = session;
    const {data} = await axios.post('/api/settings/password', {
      userId: id,
      password,
      confirmPassword
    })
    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    toaster.success("Password updated successfully");
    setIsConfirmDisabled(true);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heading size={400} fontWeight={700}>
          Change Password
        </Heading>
        <Button appearance="primary" disabled={isConfirmDisabled} isLoading={isLoading} onClick={handleConfirm}>
          Update
        </Button>
      </div>
      <div className={styles.inputContainer}>
        <TextInputField
          label="New Password"
          placeholder="New password"
          width="100%"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
        />
        {showPassword ? (
          <EyeOffIcon
            className={styles.eyeIcon}
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <EyeOpenIcon
            className={styles.eyeIcon}
            onClick={() => setShowPassword(true)}
          />
        )}
      </div>
      <div className={styles.inputContainer}>
        <TextInputField
          label="Confirm Password"
          placeholder="Confirm password"
          width="100%"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
        />
      </div>
    </div>
  );
};
