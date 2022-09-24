import "../styles/globals.css";
import { Nav } from "../components/nav/nav";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
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
      {!noNavRoutes.includes(router.pathname) && <Nav />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
