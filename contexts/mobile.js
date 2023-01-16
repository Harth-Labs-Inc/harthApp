import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const SizeContext = createContext({});
export const MobileContext = createContext(false);

export const ResponsiveProvider = (props) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    useEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        const onResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        window.addEventListener("load", onResize);
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("load", onResize);
            window.removeEventListener("resize", onResize);
        };
    }, []);
    const isMobile = width <= 640;

    const sizeContext = useMemo(() => ({ width }), [width]);
    const mobileContext = useMemo(() => ({ isMobile }), [isMobile]);

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
