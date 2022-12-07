import { useEffect } from "react";
import { useRouter } from "next/router";

import "../styles/Styles.modules.scss";
import { AuthProvider, ProtectRoute } from "../contexts/auth";
import { ResponsiveProvider } from "../contexts/mobile";
import Layout from "../components/layout";

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", function () {
                navigator.serviceWorker.register("/sw.js").then(
                    function (registration) {},
                    function (err) {}
                );
            });
        }
        //disable right click
        // window.addEventListener(
        //     "contextmenu",
        //     function (e) {
        //         e.preventDefault();
        //     },
        //     false
        // );
    }, []);
    return (
        <ResponsiveProvider>
            <AuthProvider>
                <ProtectRoute>
                    <Layout>
                        <Component key={router.asPath} {...pageProps} />
                    </Layout>
                </ProtectRoute>
            </AuthProvider>
        </ResponsiveProvider>
    );
}

export default MyApp;
