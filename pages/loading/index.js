import { useAuth } from "../../contexts/auth";
import React, { useEffect } from "react";

const Loading = (props) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) window.location.pathname = "/";
  }, [loading]);

  return (
    <>
      <h1>loading...</h1>
    </>
  );
};

export default Loading;
