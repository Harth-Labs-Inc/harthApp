import { useState, useEffect } from "react";
import { HarthLogoDark } from "public/images/harth-logo-dark";
import { HarthLogoLight } from "public/images/harth-logo-light";
import Cookies from "js-cookie";

export const DisplayLogo = () => {
  const [theme, setTheme] = useState(Cookies.get("theme"));

  const updateTheme = () => {
    const savedTheme = Cookies.get("theme");
    setTheme(savedTheme);
  };

  useEffect(() => {
    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateTheme();
        }
      });
    });

    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => bodyObserver.disconnect();
  }, []);

  return theme === "dark-mode" ? <HarthLogoLight /> : <HarthLogoDark />;
};
