import Head from "next/head";
import { useAuth } from "../contexts/auth";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";

const IndexPage = () => {
  const [swReg, setSwReg] = useState(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (navigator && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          setSwReg(registration);
        })
        .catch((err) => {
          console.log(err);
          setSwReg({});
        });
    }
    function handleNetworkChange() {
      if (navigator && navigator.onLine) {
        location.reload();
      }
    }

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
    return () => {
      window.removeEventListener("contextmenu", () => {});
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      setSwReg(null);
    };
  }, []);

  const AuthOrDashboard = ({ user, loading, swReg }) => {
    if (loading || !swReg) {
      return null;
    }
    if (user) {
      const Dashboard = dynamic(() => import("./dashboard/index"), {
        loading: () => null,
      });
      return Dashboard ? <Dashboard swReg={swReg}></Dashboard> : null;
    }
    if (!user) {
      const Auth = dynamic(() => import("../pages/auth/index"), {
        loading: () => null,
      });
      return Auth ? <Auth></Auth> : null;
    }
  };

  return (
    <>
      <Head>
        <title>Härth</title>
      </Head>

      <AuthOrDashboard
        swReg={swReg}
        user={user}
        loading={loading}
      ></AuthOrDashboard>
    </>
  );
};

export default IndexPage;
