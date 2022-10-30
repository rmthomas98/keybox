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
  toaster,
  Small,
} from "evergreen-ui";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/router";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    const { email, password, confirmPassword } = data;
    await toaster.closeAll();

    if (password !== confirmPassword) {
      // show error message
      toaster.danger("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const res = await axios.post("/api/signup", data);

    if (res.data.error) {
      // show error message
      setIsLoading(false);
      toaster.danger(res.data.message);
      return;
    }

    // console.log(res.data);
    // setIsLoading(false)
    // return;

    // redirect to email verification
    await router.push({ pathname: "/verify", query: { email } });
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
          width="100%"
          background="tint2"
          padding={24}
          marginTop={20}
          elevation={1}
        >
          <form onSubmit={handleSubmit(submit)}>
            <Heading size={700} marginBottom={20} textAlign="center">
              Create Your Account
            </Heading>
            <div style={{ position: "relative" }}>
              <TextInputField
                label="Email"
                type="email"
                placeholder="Email"
                marginBottom={30}
                {...register("email", { required: true })}
              />
              <Text
                className={styles.errorText}
                style={{
                  opacity: errors.email?.type === "required" ? 1 : 0,
                }}
              >
                <Small color="#D14343">* Required Field</Small>
              </Text>
            </div>
            <div style={{ position: "relative" }}>
              <TextInputField
                label="Password (12 characters min)"
                placeholder="Password"
                marginBottom={30}
                type={showPassword ? "text" : "password"}
                {...register("password", { required: true, minLength: 12 })}
              />
              <Text
                className={styles.errorText}
                style={{
                  opacity: errors.password?.type === "required" ? 1 : 0,
                }}
              >
                <Small color="#D14343">* Required Field</Small>
              </Text>
              <Text
                className={styles.errorText}
                style={{
                  opacity: errors.password?.type === "minLength" ? 1 : 0,
                }}
              >
                <Small color="#D14343">
                  * Password must be 12 characters long
                </Small>
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
            <div style={{ position: "relative" }}>
              <TextInputField
                label="Confirm Password"
                placeholder="Confirm Password"
                marginBottom={30}
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword", { required: true })}
              />
              <Text
                className={styles.errorText}
                style={{
                  opacity: errors.confirmPassword?.type === "required" ? 1 : 0,
                }}
              >
                <Small color="#D14343">* Required Field</Small>
              </Text>
            </div>
            <Button
              appearance="primary"
              intent={"success"}
              width="100%"
              size="large"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create account
            </Button>
            <div className={styles.accountText}>
              <Text color="muted" marginRight={5}>
                Already have an account?
              </Text>
              <NextLink href="/login" passHref>
                <Link color="neutral">Log in</Link>
              </NextLink>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
