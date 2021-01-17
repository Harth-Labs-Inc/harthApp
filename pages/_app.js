import "../styles/Styles.modules.scss";
import { AuthProvider, ProtectRoute } from "../contexts/auth";
import Layout from "../components/layout";

function MyApp({ Component, pageProps }) {
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
