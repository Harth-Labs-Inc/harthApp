import { useState, useEffect } from "react";
import { HarthLogoDark } from "public/images/harth-logo-dark";
import { HarthLogoLight } from "public/images/harth-logo-light";
import Cookies from "js-cookie";

export const DisplayLogo = () => {
    const [theme, setTheme] = useState(null);

    useEffect(() => {
        const savedTheme = Cookies.get('theme');
        setTheme(savedTheme);
    }, []);


    if (theme == "dark-mode") {
        return <HarthLogoLight />;
    }

    return <HarthLogoDark />;
};
