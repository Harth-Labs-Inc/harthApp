import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { Work_Sans, Rubik, Raleway } from "next/font/google";
import Head from "next/head";
import App from "next/app";
import "../styles/Styles.modules.scss";
import { AuthProvider } from "../contexts/auth";
import { ResponsiveProvider } from "../contexts/mobile";
import { CreateGatheringFormProvider as GatheringFormProvider } from "../pages/dashboard/video/GatherForm/GatheringFormContext";
import { CreateGatheringFormProvider as GatheringEditFormProvider } from "../pages/dashboard/video/GatherEditForm/GatheringFormContext";
import { useEffect } from "react";
import Cookies from "js-cookie";

const fontClassNames = [];
// google fonts

const work_Sans = Work_Sans({
  subsets: ["latin"],
  variable: "--Work_Sans-font",
  preload: false,
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--Rubik-font",
  preload: false,
});

const rale = Raleway({
  subsets: ["latin"],
  variable: "--Raleway-font",
  // weight: ["300", "400", "700"],
  preload: false,
});

fontClassNames.push(work_Sans.variable);
fontClassNames.push(rubik.variable);
fontClassNames.push(rale.variable);

const themeColors = {
  "light-mode": {
    backgroundColor: "#e8e8ee",
    bodyClass: "light-mode",
    metaThemeColor: "#e8e8ee",
  },
  "dark-mode": {
    backgroundColor: "#38383e",
    bodyClass: "dark-mode",
    metaThemeColor: "#38383e",
  },
};

function MyApp({
  Component,
  pageProps,
  theme,
  hadPreferedTheme,
  hadPreferedTextSize,
  textSize,
}) {
  const router = useRouter();

  useEffect(() => {
    const setVhValue = () => {
      let vh = window.innerHeight;
      let vw = window.innerWidth;
      const isMobile = vw <= 640;
      if (isMobile) {
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      } else {
        document.documentElement.style.setProperty("--vh", `100vh`);
      }
    };
    const preventDragStart = (event) => {
      event.preventDefault();
    };

    setVhValue();
    document.addEventListener("dragstart", preventDragStart);

    const timeoutId = setTimeout(() => {
      setVhValue();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("dragstart", preventDragStart);
    };
  }, []);

  const userTheme = hadPreferedTheme
    ? theme
    : Cookies.get("theme") || "light-mode";
  const userTextSize = hadPreferedTextSize
    ? textSize
    : Cookies.get("textSize") || "text-reg";

  if (!Cookies.get("theme")) {
    Cookies.set("theme", userTheme, { expires: 365 });
  }

  if (!Cookies.get("textSize")) {
    Cookies.set("textSize", userTextSize, { expires: 365 });
  }

  if (typeof document !== "undefined" && userTheme) {
    const currentBodyClass = document.body.className;
    const newBodyClass = themeColors[userTheme]?.bodyClass;
    if (!currentBodyClass || currentBodyClass !== newBodyClass) {
      document.body.classList.add(newBodyClass);
    }
  }

  if (typeof document !== "undefined") {
    const currentBodyClass = document.body.className;

    const newBodyClassTheme = themeColors[userTheme]?.bodyClass;
    if (!currentBodyClass || currentBodyClass !== newBodyClassTheme) {
      document.body.className = newBodyClassTheme;
    }

    if (!currentBodyClass || !currentBodyClass.includes(userTextSize)) {
      document.body.classList.add(userTextSize);
    }
  }

  return (
    <main className={`${fontClassNames.join(" ")}`}>
      <Head>
        <title>Härth</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta property="og:title" content="Härth" key="title" />
        {/* <meta
          name="theme-color"
          content={themeColors[userTheme]?.metaThemeColor}
        /> */}
        <meta name="theme-color" content="#e8e8ee" />
        theme
        <meta name="apple-mobile-web-app-title" content="Härth" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        {/* <link
          rel="manifest"
          href={
            userTheme === "dark-mode"
              ? "/manifest-dark.json"
              : "/manifest-light.json"
          }
        /> */}
        <link rel="icon" type="image/x-icon" href="favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/icons/apple-touch-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/icons/apple-touch-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/apple-touch-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon-180x180.png"
        />
      </Head>
      <ResponsiveProvider>
        <AuthProvider>
          <GatheringFormProvider>
            <GatheringEditFormProvider>
              <Component
                key={router.asPath}
                {...pageProps}
                userTheme={userTheme}
              />
            </GatheringEditFormProvider>
          </GatheringFormProvider>
        </AuthProvider>
      </ResponsiveProvider>
      <Analytics />
    </main>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const req = appContext.ctx.req;
  let cookies = {};

  if (req && req.headers.cookie) {
    req.headers.cookie.split(";").forEach((cookie) => {
      const parts = cookie.match(/(.*?)=(.*)$/);
      if (parts) {
        cookies[parts[1].trim()] = (parts[2] || "").trim();
      }
    });
  }

  const hadPreferedTheme = cookies.theme || false;
  const theme = cookies.theme || "light-mode";

  const hadPreferedTextSize = cookies.textSize || false;
  const textSize = cookies.textSize || "text-reg";

  return {
    ...appProps,
    theme,
    hadPreferedTheme,
    hadPreferedTextSize,
    textSize,
  };
};

export default MyApp;
