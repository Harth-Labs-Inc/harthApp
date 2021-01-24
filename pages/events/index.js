import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import Dashboad from "../dashboard/index";

const Events = (props) => {
  const { user, loading } = useAuth();
  if (user) {
  }

  return (
    <Dashboad>
      <p>Events</p>
    </Dashboad>
  );
};

export default Events;
