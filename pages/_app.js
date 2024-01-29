import { useRouter } from "next/router";
import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Work_Sans, Rubik, Raleway } from "next/font/google";
import Head from "next/head";
import "../styles/Styles.modules.scss";
import { AuthProvider } from "../contexts/auth";
import { ResponsiveProvider } from "../contexts/mobile";
import { CreateGatheringFormProvider as GatheringFormProvider } from "../pages/dashboard/video/GatherForm/GatheringFormContext";
import { CreateGatheringFormProvider as GatheringEditFormProvider } from "../pages/dashboard/video/GatherEditForm/GatheringFormContext";
import { useEffect } from "react";

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

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState('#38383e'); //light mode

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

  useEffect(() => {
    let storedTheme = localStorage.getItem("interface-theme");
    if (!storedTheme) {
      localStorage.setItem("interface-theme", "dark-mode");
      storedTheme = "dark-mode";
    }
    document.body.classList.add(storedTheme);

    if (storedTheme == "light-mode") {
      setThemeColor('#e8e8ee');
    }

    let themeColorMetaTag = document.querySelector('meta[name="theme-color"]');

    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute('content', themeColor);
    } else {
      // If the meta tag does not exist, create it
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      metaTag.setAttribute('content', themeColor);//
      document.head.appendChild(metaTag);
    }
     
  }, []);

  return (
    <main className={`${fontClassNames.join(" ")}`}>
      <Head>
        <title>Härth</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta property="og:title" content="Härth" key="title" />
        <meta name="theme-color" content="#38383e" />
        <meta name="apple-mobile-web-app-title" content="Härth" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <link rel="manifest" href="/manifest.json" />

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
              <Component key={router.asPath} {...pageProps} />
            </GatheringEditFormProvider>
          </GatheringFormProvider>
        </AuthProvider>
      </ResponsiveProvider>
      <Analytics />
    </main>
  );
}

export default MyApp;
