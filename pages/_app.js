import "../styles/Styles.modules.scss";
import { AuthProvider, ProtectRoute } from "../contexts/auth";
import Layout from "../components/layout";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log(
              "Service Worker registration successful with scope: ",
              registration.scope
            );
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
    if ("setAppBadge" in navigator) {
      canvas.addEventListener("pointerdown", () => {
        navigator.setAppBadge(1);
      });
    }
  }, []);
  return (
    <AuthProvider>
      <ProtectRoute>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ProtectRoute>
    </AuthProvider>
  );
}

export default MyApp;
