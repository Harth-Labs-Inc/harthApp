import Head from "next/head";
import { useAuth } from "../contexts/auth";
import dynamic from "next/dynamic";
// import Auth from "../pages/auth/index";
// import Dashboard from "./dashboard/index";

const IndexPage = () => {
    const { user, loading } = useAuth();

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
