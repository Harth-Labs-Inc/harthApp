import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import "../styles/Styles.modules.scss";
import { AuthProvider } from "../contexts/auth";
import { ResponsiveProvider } from "../contexts/mobile";
import { CreateGatheringFormProvider as GatheringFormProvider } from "../pages/dashboard/video/GatherForm/GatheringFormContext";
import { CreateGatheringFormProvider as GatheringEditFormProvider } from "../pages/dashboard/video/GatherEditForm/GatheringFormContext";
import Layout from "../components/layout";
import TransitionLayout from "../components/Transitions";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // if ("serviceWorker" in navigator) {
    //   window.addEventListener("load", function () {
    //     navigator.serviceWorker.register("/sw.js").then(
    //       function (registration) {},
    //       function (err) {}
    //     );
    //   });
    // }
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
        <Layout>
          <TransitionLayout>
            <GatheringFormProvider>
              <GatheringEditFormProvider>
                <Script src="https://unpkg.com/peerjs@1.3.2/dist/peerjs.min.js" />
                <Component key={router.asPath} {...pageProps} />
              </GatheringEditFormProvider>
            </GatheringFormProvider>
          </TransitionLayout>
        </Layout>
      </AuthProvider>
    </ResponsiveProvider>
  );
}

export default MyApp;
