import "../styles/globals.css";
import { Nav } from "../components/nav/nav";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "../components/sidebar/sidebar";
import NextNProgress from "nextjs-progressbar";
import { useEffect, useState } from "react";
import { SearchContext } from "../components/context/search";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [searchValue, setSearchValue] = useState("");
  const [checkRoute, setCheckRoute] = useState(false);

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

  useEffect(() => {
    const route = router.pathname;

    if (
      route === "/app/choose-plan" ||
      route === "/app/new-trial" ||
      route === "/app/new-subscription"
    ) {
      setCheckRoute(true);
      return;
    }

    setCheckRoute(false);
  }, [router.pathname]);

  // const checkRoute = () => {
  //   const route = router.pathname;
  //   if (
  //     route === "/app/choose-plan" ||
  //     route === "/app/new-trial" ||
  //     route === "/app/new-subscription"
  //   ) {
  //     return true;
  //   }
  //
  //   return false;
  // };

  return (
    <>
      {router.pathname.includes("/app") && (
        <NextNProgress color="#3366FF" height={2} startPosition={0} />
      )}
      <SessionProvider session={session}>
        <SearchContext.Provider value={{ searchValue, setSearchValue }}>
          {checkRoute && (
            <div>
              {!noNavRoutes.includes(router.pathname) && <Nav />}
              <Component {...pageProps} />
            </div>
          )}
          {!router.pathname.includes("/app") && !checkRoute && (
            <div>
              {!noNavRoutes.includes(router.pathname) && <Nav />}
              <Component {...pageProps} />
            </div>
          )}
          {router.pathname.includes("/app") && !checkRoute && (
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
        </SearchContext.Provider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
