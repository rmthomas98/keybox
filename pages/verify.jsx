import styles from "../styles/verify.module.css";
import {
  Heading,
  Button,
  Card,
  TextInputField,
  toaster,
  Link,
  Paragraph,
  Text,
  Small,
} from "evergreen-ui";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import prisma from "../lib/prisma";

const Verify = ({ email }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (data) => {
    setIsLoading(true);
    toaster.closeAll();

    const { token } = data;
    const res = await axios.post("/api/verify", { token, email });

    if (res.data.error) {
      setIsLoading(false);
      toaster.danger(res.data.message);
      return;
    }

    // redirect to login
    await router.push({ pathname: "/login", query: { new: true } });
  };

  const resend = async () => {
    setResending(true);
    toaster.closeAll();

    const res = await axios.post("/api/resend-verification", { email });

    if (res.data.error) {
      setResending(false);
      toaster.danger(res.data.message);
      return;
    }

    setResending(false);
    toaster.success("Verification code sent");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <NextLink href="/" passHref>
          <Link>
            <Image src="/images/logo.svg" height={40} width={40} alt="logo" />
          </Link>
        </NextLink>
        <Card
          marginTop={20}
          background="tint2"
          padding={24}
          width="100%"
          elevation={1}
        >
          <form onSubmit={handleSubmit(submit)}>
            <Heading size={700} marginBottom={20} textAlign="center">
              Verify your email
            </Heading>
            <Paragraph textAlign="center">
              We have sent a verification code to <b>{email}</b>. Please enter
              the code to verify your email.
            </Paragraph>
            <div style={{ position: "relative" }}>
              <TextInputField
                placeholder="Verification code"
                label="Verification Code"
                marginTop={20}
                marginBottom={30}
                {...register("token", { required: true })}
              />
              <Text
                className={styles.errorText}
                style={{
                  opacity: errors.token ? 1 : 0,
                }}
              >
                <Small color="#D14343">Please enter your code</Small>
              </Text>
            </div>
            <Button
              size="large"
              appearance="primary"
              width="100%"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Submit
            </Button>
          </form>
          <div className={styles.resend}>
            <Button
              alignSelf="center"
              appearance="minimal"
              marginTop={20}
              size="small"
              isLoading={resending}
              disabled={resending}
              onClick={resend}
            >
              Resend Code
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const { email } = context.query;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return {
      redirect: {
        destination: "/signup",
        permanent: false,
      },
    };
  }

  if (user.emailVerified) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (!email) {
    return {
      redirect: {
        destination: "/signup",
        permanent: false,
      },
    };
  }

  return { props: { email } };
};

export default Verify;
