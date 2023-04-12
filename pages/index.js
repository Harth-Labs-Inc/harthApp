import Head from "next/head";
import { useAuth } from "../contexts/auth";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const IndexPage = () => {
  const { user, loading } = useAuth();

  // useEffect(() => {
  //     function handleVisibilityChange() {
  //         let storedValue = localStorage.getItem("forceReload");
  //         if (!storedValue) {
  //             localStorage.setItem("forceReload", true);
  //         } else {
  //             localStorage.removeItem("forceReload");
  //             location.reload();
  //         }
  //     }
  //     document.addEventListener(
  //         "visibilitychange",
  //         handleVisibilityChange,
  //         false
  //     );
  //     return () => {
  //         document.removeEventListener(
  //             "visibilitychange",
  //             handleVisibilityChange,
  //             false
  //         );
  //     };
  // }, []);

  // useEffect(() => {
  //     document.addEventListener("contextmenu", (event) => {
  //         event.preventDefault();
  //     });

  //     return () => {
  //         window.removeEventListener("contextmenu", () => {});
  //     };
  // }, []);

  const AuthOrDashboard = ({ user, loading }) => {
    if (loading) {
      return null;
    }
    if (user) {
      const Dashboard = dynamic(() => import("./dashboard/index"), {
        loading: () => null,
      });
      return Dashboard ? <Dashboard></Dashboard> : null;
    }
    if (!user) {
      const Auth = dynamic(() => import("../pages/auth/index"), {
        loading: () => null,
      });
      return Auth ? <Auth></Auth> : null;
    }
  };

  // console.log(isLaptopOpen, "isLaptopOpen");
  // console.log(prevIsLaptopOpenRef.current, "prevIsLaptopOpen");

  return (
    <>
      <Head>
        <title>Härth</title>
      </Head>

      <AuthOrDashboard user={user} loading={loading}></AuthOrDashboard>
    </>
  );
};

export default IndexPage;
