import Head from "next/head";
import { useAuth } from "../contexts/auth";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const IndexPage = () => {
    const { user, loading } = useAuth();

    useEffect(() => {
        function handleNetworkChange() {
            if (navigator && navigator.onLine) {
                location.reload();
            }
        }

        screen.orientation.lock("portrait").catch((err) => {
            console.error(err);
        });
        // window.addEventListener("contextmenu", (event) => {
        //     event.preventDefault();
        // });

        window.addEventListener("online", handleNetworkChange);
        window.addEventListener("offline", handleNetworkChange);
        return () => {
            window.removeEventListener("contextmenu", () => {});
            window.removeEventListener("online", handleNetworkChange);
            window.removeEventListener("offline", handleNetworkChange);
        };
    }, []);

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
