import { useAuth } from "../contexts/auth";

import Auth from "../pages/auth/index";
import Dashboard from "./dashboard/index";

const IndexPage = () => {
  const { user, loading } = useAuth();

  const AuthOrDashboard = () => {
    if (loading) return null;
    // console.log(pathname);
    if (user) return <Dashboard></Dashboard>;
    if (!user) return <Auth></Auth>;
  };

  return (
    <>
      <AuthOrDashboard></AuthOrDashboard>
    </>
  );
};

export default IndexPage;
