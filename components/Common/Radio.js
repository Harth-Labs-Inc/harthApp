import { useState } from 'react'

const RadioButton = (props) => {
  return (
    <>
      <input
        name={props.name}
        id={props.id}
        className="radio-button"
        onChange={props.changed}
        value={props.value}
        type="radio"
        checked={props.isSelected}
      />
      <label htmlFor={props.id}>{props.label}</label>
    </>
  )
}

export default RadioButton
