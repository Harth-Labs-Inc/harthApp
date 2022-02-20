export const Button = (props) => {
  return (
    <button className="btn" {...props}>
      {props.text}
    </button>
  )
}

export const Choice = (props) => {
  return (
    <button className="choice-btn" {...props}>
      {props.text}
    </button>
  )
}

export const BackBtn = (props) => {
  return <button id="go-back" aria-label={props.ariaLabel} {...props}></button>
}

export const CloseBtn = (props) => {
  return (
    <button
      className="close-modal"
      aria-label="Close this Modal"
      {...props}
    ></button>
  )
}

export const TextBtn = (props) => {
  return (
    <button className="text-btn" {...props}>
      {props.text}
    </button>
  )
}
