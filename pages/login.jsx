import styles from "../styles/login.module.css";
import {
  Heading,
  Card,
  TextInputField,
  Button,
  Link,
  Text,
  toaster,
  Small,
  EyeOffIcon,
  EyeOpenIcon,
} from "evergreen-ui";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";

const Login = ({ newAccount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    setIsLoading(true);
    toaster.closeAll();

    const options = {
      email: data.email,
      password: data.password,
      redirect: false,
    };

    const res = await signIn("credentials", options);

    if (res?.error) {
      setIsLoading(false);
      toaster.danger(res.error);
      return;
    }

    router.push("/app");
  };

  useEffect(() => {
    if (newAccount) toaster.success("Account created! You can now log in.");
  }, []);

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
          <form onSubmit={handleSubmit(submit)}>
            <Heading size={700} marginBottom={20} textAlign="center">
              Log in to your account
            </Heading>
            <div style={{ position: "relative" }}>
              <TextInputField
                label="Email"
                placeholder="Email"
                marginBottom={30}
                {...register("email", { required: true })}
              />
              <Text
                className={styles.errorText}
                style={{
                  opacity: errors.email ? 1 : 0,
                }}
              >
                <Small color="#D14343">Please enter your email</Small>
              </Text>
            </div>
            <div style={{ position: "relative" }}>
              <TextInputField
                label="Password"
                placeholder="Password"
                marginBottom={12}
                type={showPassword ? "text" : "password"}
                {...register("password", { required: true })}
              />
              <Text
                className={styles.errorText}
                style={{
                  opacity: errors.password ? 1 : 0,
                }}
              >
                <Small color="#D14343">Please enter your password</Small>
              </Text>
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
            <div className={styles.actionsContainer}>
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
              marginTop={12}
              isLoading={isLoading}
              disabled={isLoading}
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

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: "/app",
        permanent: false,
      },
    };
  }

  const newAccount = ctx.query?.new;

  return { props: { newAccount: !!newAccount } };
};

export default Login;
