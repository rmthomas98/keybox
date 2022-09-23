import styles from "../styles/signup.module.css";
import Image from "next/image";
import {
  Heading,
  Button,
  Card,
  TextInput,
  Link,
  TextInputField,
  EyeOpenIcon,
  EyeOffIcon,
  Text,
} from "evergreen-ui";
import NextLink from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <NextLink href="/" passHref>
          <Link>
            <Image src="/images/logo.svg" height={40} width={40} alt="logo" />
          </Link>
        </NextLink>
        <Card width="100%" background="tint2" padding={24} marginTop={20}>
          <Heading size={700} marginBottom={20} textAlign="center">
            Create Your Account
          </Heading>
          <TextInputField label="Email" placeholder="Email" marginBottom={20} />
          <div style={{ position: "relative" }}>
            <TextInputField
              label="Password (8 characters min)"
              placeholder="Password"
              marginBottom={20}
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
          <TextInputField
            label="Confirm Password"
            placeholder="Confirm Password"
            marginBottom={30}
            type={showPassword ? "text" : "password"}
          />
          <Button appearance="primary" width="100%" size="large">
            Create account
          </Button>
          <div className={styles.accountText}>
            <Text color="muted" marginRight={5}>
              Already have an account?
            </Text>
            <NextLink href="/login" passHref>
              <Link>Log in</Link>
            </NextLink>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
