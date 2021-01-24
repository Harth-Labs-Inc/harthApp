import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import Dashboad from "../dashboard/index";

const Game = (props) => {
  const { user, loading } = useAuth();
  if (user) {
  }

  return (
    <Dashboad>
      <p>Game</p>
    </Dashboad>
  );
};

export default Game;
