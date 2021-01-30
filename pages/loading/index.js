import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/auth";

const Loading = (props) => {
  const { user, loading } = useAuth();
  const { pathname } = useRouter();

  useEffect(() => {
    console.log(pathname);
    if (loading) return;
    if (!user) window.location.pathname = "/";
  }, [loading]);

  return <></>;
};

export default Loading;
