import "../styles/globals.css";
import { Nav } from "../components/nav/nav";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "../components/sidebar/sidebar";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const noNavRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify",
    "/app/new-trial",
    "/app/new-subscription",
  ];

  const checkRoute = () => {
    const route = router.pathname;
    if (
      route === "/app/choose-plan" ||
      route === "/app/new-trial" ||
      route === "/app/new-subscription"
    ) {
      return true;
    }

    return false;
  };

  return (
    <>
      <SessionProvider session={session}>
        {checkRoute() && (
          <div>
            {!noNavRoutes.includes(router.pathname) && <Nav />}
            <Component {...pageProps} />
          </div>
        )}
        {!router.pathname.includes("/app") && !checkRoute() && (
          <div>
            {!noNavRoutes.includes(router.pathname) && <Nav />}
            <Component {...pageProps} />
          </div>
        )}
        {router.pathname.includes("/app") && !checkRoute() && (
          <div className="app-wrapper">
            <Sidebar />
            <div className="app-container">
              <Nav />
              <div className="app-content-wrapper">
                <div className="app-content">
                  <Component {...pageProps} />
                </div>
              </div>
            </div>
          </div>
        )}
      </SessionProvider>
    </>
  );
}

export default MyApp;
