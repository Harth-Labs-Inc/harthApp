import React from "react";

const Button = (props) => {
  return (
    <button className="btn" {...props}>
      {props.text}
    </button>
  );
};

export default Button;
