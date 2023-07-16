import { useRouter } from "next/router";
// import { Analytics } from "@vercel/analytics/react";
import {
  Righteous,
  Arvo,
  Ubuntu,
  Work_Sans,
  Asap,
  Asap_Condensed,
  Rubik,
  Montserrat,
  Open_Sans,
} from "next/font/google";
import localFont from "next/font/local";
import Head from "next/head";
import "../styles/Styles.modules.scss";
import { AuthProvider } from "../contexts/auth";
import { ResponsiveProvider } from "../contexts/mobile";
import { CreateGatheringFormProvider as GatheringFormProvider } from "../pages/dashboard/video/GatherForm/GatheringFormContext";
import { CreateGatheringFormProvider as GatheringEditFormProvider } from "../pages/dashboard/video/GatherEditForm/GatheringFormContext";
import TransitionLayout from "../components/Transitions";

const fontClassNames = [];
// google fonts
const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--righteous-font",
  preload: false,
});
const arvo = Arvo({
  weight: "400",
  subsets: ["latin"],
  variable: "--Arvo-font",
  preload: false,
});
const ubuntu = Ubuntu({
  weight: "400",
  subsets: ["latin"],
  variable: "--Ubuntu-font",
  preload: false,
});
const work_Sans = Work_Sans({
  //weight: "400",
  subsets: ["latin"],
  variable: "--Work_Sans-font",
  preload: false,
});
const asap = Asap({
  weight: "400",
  subsets: ["latin"],
  variable: "--Asap-font",
  preload: false,
});
const asap_Condensed = Asap_Condensed({
  weight: "400",
  subsets: ["latin"],
  variable: "--Asap_Condensed-font",
  preload: false,
});
const rubik = Rubik({
  //weight: "400",
  subsets: ["latin"],
  variable: "--Rubik-font",
  preload: false,
});

const montserrat = Montserrat({
  //weight: "400",
  subsets: ["latin"],
  variable: "--Montserrat-font",
  preload: false,
});

const opensans = Open_Sans({
  //weight: "400",
  subsets: ["latin"],
  variable: "--Open_Sans-font",
  preload: false,
});

// local fonts
const coopbl = localFont({
  src: "../public/fonts/COOPBL.ttf",
  variable: "--COOPBL-font",
  preload: true,
});

fontClassNames.push(coopbl.className);
fontClassNames.push(righteous.variable);
fontClassNames.push(arvo.variable);
fontClassNames.push(ubuntu.variable);
fontClassNames.push(work_Sans.variable);
fontClassNames.push(asap.variable);
fontClassNames.push(asap_Condensed.variable);
fontClassNames.push(rubik.variable);
fontClassNames.push(montserrat.variable);
fontClassNames.push(opensans.variable);

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <main className={`${fontClassNames.join(" ")}`}>
      <Head>
        <title>Härth</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta property="og:title" content="Härth" key="title" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="icon" type="image/x-icon" href="favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/icons/apple-touch-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="64x64"
          href="/icons/apple-touch-icon-64x64.png"
        />
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
          sizes="128x128"
          href="/icons/apple-touch-icon-128x128.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/apple-touch-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/apple-touch-icon-167x167.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon-180x180.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="256x256"
          href="/icons/apple-touch-icon-256x256.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/icons/apple-touch-icon-512x512.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="1024x1024"
          href="/icons/apple-touch-icon-1024x1024.png"
        />
        <link rel="icon" type="image/png" sizes="16x16" href="favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="36x36"
          href="/icons/icon-36x36.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/icons/icon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="70x70"
          href="/icons/icon-70x70.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="72x72"
          href="/icons/icon-72x72.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/icons/icon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="128x128"
          href="/icons/icon-128x128.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="144x144"
          href="/icons/icon-144x144.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="150x150"
          href="/icons/icon-150x150.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="256x256"
          href="/icons/icon-256x256.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="310x310"
          href="/icons/icon-310x310.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="384x384"
          href="/icons/icon-384x384.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/icon-512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="1024x1024"
          href="/icons/icon-1024x1024.png"
        />

        <meta name="theme-color" content="#1a1a1f" />

        <meta name="apple-mobile-web-app-title" content="Härth" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <ResponsiveProvider>
        <AuthProvider>
          <TransitionLayout>
            <GatheringFormProvider>
              <GatheringEditFormProvider>
                <Component key={router.asPath} {...pageProps} />
              </GatheringEditFormProvider>
            </GatheringFormProvider>
          </TransitionLayout>
        </AuthProvider>
      </ResponsiveProvider>
      {/* <Analytics /> */}
    </main>
  );
}

export default MyApp;
