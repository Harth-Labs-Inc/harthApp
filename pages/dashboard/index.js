import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import NavLayout from "../../components/navLayout";

const dashboard = ({ props, children }) => {
  const { user, loading } = useAuth();
  if (user) {
    console.log(user);
  }

  return <NavLayout>{children}</NavLayout>;
};

export default dashboard;
