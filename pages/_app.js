import '../styles/Styles.modules.scss'
import { AuthProvider, ProtectRoute } from '../contexts/auth'
import { ResponsiveProvider } from '../contexts/mobile'
import Layout from '../components/layout'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {},
          function (err) {},
        )
      })
    }
    //disable right click
    // window.addEventListener(
    //   "contextmenu",
    //   function (e) {
    //     e.preventDefault();
    //   },
    //   false
    // );
  }, [])
  return (
    <ResponsiveProvider>
      <AuthProvider>
        <ProtectRoute>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ProtectRoute>
      </AuthProvider>
    </ResponsiveProvider>
  )
}

export default MyApp
