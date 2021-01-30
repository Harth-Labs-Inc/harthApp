import React from "react";
import Router from "next/router";

export const Button = (props) => {
  return (
    <button className="btn" {...props}>
      {props.text}
    </button>
  );
};

export const Choice = (props) => {
  return (
    <button className="choice-btn" {...props}>
      {props.text}
      <span className="material-icons">keyboard_arrow_right</span>
    </button>
  );
};
