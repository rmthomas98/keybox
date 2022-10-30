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
  Paragraph,
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
  const [needsTwoFactorAuth, setNeedsTwoFactorAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // check if user uses 2fa
  const checkUser = async (data) => {
    setIsLoading(true);
    await toaster.closeAll();

    // check if user has 2fa enabled
    const res = await axios.post("/api/auth/check-user", data);

    if (res.data.error) {
      toaster.danger(res.data.message);
      setIsLoading(false);
      return;
    }

    const { twoFactor } = res.data;

    // if no 2fa, sign in user with next-auth
    if (!twoFactor) {
      const options = {
        email: data.email,
        password: data.password,
        redirect: false,
      };

      const session = await signIn("credentials", options);

      if (session?.error) {
        toaster.danger(session.error);
        setIsLoading(false);
        return;
      }

      await router.push("/app");
    } else {
      // if 2fa, set email and password in state
      // and show 2fa dialog
      setIsLoading(false);
      setNeedsTwoFactorAuth(true);
      setEmail(res.data.email);
      setPassword(res.data.password);
    }
  };

  // check if code is valid, if so, sign in user
  const handleTwoFactorAuthLogin = async (data) => {
    await toaster.closeAll();

    setIsLoading(true);

    // check if code is valid
    const { data: resData } = await axios.post(
      "/api/auth/two-factor-auth-login",
      {
        email,
        password,
        code: data.code,
      }
    );

    // if any errors, show error message
    if (resData.error) {
      toaster.danger(resData.message);
      setIsLoading(false);
      return;
    }

    // if code is valid, login with next-auth
    if (resData.codeValid) {
      // login with next-auth
      const options = {
        email,
        password,
        redirect: false,
      };

      const session = await signIn("credentials", options);

      if (session?.error) {
        toaster.danger(session.error);
        setIsLoading(false);
        return;
      }

      await router.push("/app");
      setIsLoading(false);
    }
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
          <form
            onSubmit={
              needsTwoFactorAuth
                ? handleSubmit(handleTwoFactorAuthLogin)
                : handleSubmit(checkUser)
            }
          >
            {!needsTwoFactorAuth && (
              <div>
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
                  intent={"success"}
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
              </div>
            )}
            {needsTwoFactorAuth && (
              <div>
                <Heading size={700} textAlign="center" marginBottom={20}>
                  Two Factor Authentication
                </Heading>
                <Paragraph textAlign="center">
                  Please enter the code sent to your phone.
                </Paragraph>
                <TextInputField
                  marginTop={20}
                  label="Verification Code"
                  placeholder="Verification code"
                  {...register("code", { required: true })}
                />
                <Button
                  appearance="primary"
                  width="100%"
                  size="large"
                  // marginTop={12}
                  isLoading={isLoading}
                >
                  Log in
                </Button>
              </div>
            )}
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
