import styles from "../styles/login.module.css";
import {
  Heading,
  Card,
  TextInputField,
  Button,
  Link,
  Text,
  toaster,
  Checkbox,
} from "evergreen-ui";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

const Login = () => {
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
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
        <Card
          padding={24}
          elevation={1}
          marginTop={20}
          width="100%"
          background="tint2"
          className={styles.animate}
        >
          <form>
            <Heading size={700} marginBottom={20} textAlign="center">
              Log in to your account
            </Heading>
            <TextInputField
              label="Email"
              placeholder="Email"
              marginBottom={30}
            />
            <div style={{ position: "relative" }}>
              <TextInputField
                label="Password"
                placeholder="Password"
                marginBottom={20}
              />
            </div>
            <div className={styles.actionsContainer}>
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <NextLink href="/forgot-password" passHref>
                <Link
                  size={300}
                  className={styles.forgotPassword}
                  color="neutral"
                >
                  Forgot Password?
                </Link>
              </NextLink>
            </div>
            <Button
              appearance="primary"
              width="100%"
              size="large"
              marginTop={20}
            >
              Log in
            </Button>
            <div className={styles.accountText}>
              <Text color="muted" marginRight={5}>
                Don&#39;t have an account?
              </Text>
              <NextLink href="/signup" passHref>
                <Link>Sign up</Link>
              </NextLink>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
