import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
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

import "../styles/Styles.modules.scss";
import { AuthProvider } from "../contexts/auth";
import { ResponsiveProvider } from "../contexts/mobile";
import { CreateGatheringFormProvider as GatheringFormProvider } from "../pages/dashboard/video/GatherForm/GatheringFormContext";
import { CreateGatheringFormProvider as GatheringEditFormProvider } from "../pages/dashboard/video/GatherEditForm/GatheringFormContext";
import Layout from "../components/layout";
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

    useEffect(() => {
        function registerSW() {
            navigator.serviceWorker.register("/sw.js").then(
                (reg) => {
                    console.info("Service worker registered: ", reg.scope);
                },
                (err) => {
                    console.error("Service worker registration failed: ", err);
                }
            );
        }
        if (document.readyState === "complete") {
            registerSW();
        } else {
            window.addEventListener("load", registerSW);
            return () => window.removeEventListener("load", registerSW);
        }
    }, []);
    return (
        <main className={`${fontClassNames.join(" ")}`}>
            <ResponsiveProvider>
                <AuthProvider>
                    <Layout>
                        <TransitionLayout>
                            <GatheringFormProvider>
                                <GatheringEditFormProvider>
                                    <Script src="https://unpkg.com/peerjs@1.3.2/dist/peerjs.min.js" />
                                    <Component
                                        key={router.asPath}
                                        {...pageProps}
                                    />
                                </GatheringEditFormProvider>
                            </GatheringFormProvider>
                        </TransitionLayout>
                    </Layout>
                </AuthProvider>
            </ResponsiveProvider>
            <Analytics />
        </main>
    );
}

export default MyApp;
