import "../styles/globals.css";
import { Nav } from "../components/nav/nav";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const noNavRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify",
  ];

  return (
    <>
      <SessionProvider session={session}>
        {!noNavRoutes.includes(router.pathname) && <Nav />}
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}

export default MyApp;
