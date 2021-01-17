import { useAuth } from "../contexts/auth";
import Auth from "./auth/index";
import Dashboard from "./dashboard/index";

const IndexPage = () => {
  const { user, loading } = useAuth();

  const AuthOrDashboard = () => {
    if (loading) return null;
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
