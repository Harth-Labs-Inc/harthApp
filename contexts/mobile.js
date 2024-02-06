import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const SizeContext = createContext({});
export const MobileContext = createContext(false);

export const ResponsiveProvider = (props) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth);
    const onResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("load", onResize);
    // window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("load", onResize);
      // window.removeEventListener("resize", onResize);
    };
  }, []);
  const isMobile = width <= 640;

  const sizeContext = useMemo(() => ({ width }), [width]);
  const mobileContext = useMemo(() => ({ isMobile }), [isMobile]);

  useEffect(() => {
    const disableContextMenu = (event) => {
      if (isMobile) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableContextMenu);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, [isMobile]);

  return (
    <SizeContext.Provider value={sizeContext}>
      <MobileContext.Provider value={mobileContext}>
        {props.children}
      </MobileContext.Provider>
    </SizeContext.Provider>
  );
};

export const useSize = () => useContext(SizeContext);
export const useMobile = () => useContext(MobileContext);
