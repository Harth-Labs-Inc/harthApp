import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const SizeContext = createContext({});
export const MobileContext = createContext(false);

export const ResponsiveProvider = (props) => {
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0,
    });
    useEffect(() => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
        const onResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener("load", onResize);
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("load", onResize);
            window.removeEventListener("resize", onResize);
        };
    }, []);
    const isMobile = dimensions.width <= 640;

    const sizeContext = useMemo(() => ({ dimensions }), [dimensions]);
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
