import { createContext, useEffect, useReducer } from "react";

import "../styles/Styles.modules.scss";
import { AuthProvider, ProtectRoute } from "../contexts/auth";
import Layout from "../components/layout";
import useWindowSize from "../components/hooks/useWindowSize";
import reducer from "../store/reducer";

const initialState = {
  screenSize: "isDesktop",
};

export const Context = createContext(initialState);

function MyApp({ Component, pageProps }) {
  const size = useWindowSize();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (size.width < 768) {
      dispatch({type: "SET_MOBILE"})
    }
    if (size.width >= 768) {
      dispatch({type: "SET_DESKTOP"})
    }
  }, [size])

 

  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     window.addEventListener("load", function () {
  //       navigator.serviceWorker.register("/sw.js").then(
  //         function (registration) {},
  //         function (err) {}
  //       );
  //     });
  //   }
  //   //disable right click
  //   // window.addEventListener(
  //   //   "contextmenu",
  //   //   function (e) {
  //   //     e.preventDefault();
  //   //   },
  //   //   false
  //   // );
  // }, []);
  return (
    <Context.Provider value={[state, dispatch]}>
      <AuthProvider>
        <ProtectRoute>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ProtectRoute>
      </AuthProvider>
    </Context.Provider>
  );
}

export default MyApp;
