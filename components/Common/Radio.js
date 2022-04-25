import { useState } from 'react'

const RadioButton = (props) => {
  const { name, id, onChange, value, isSelected, label } = props
  return (
    <>
      <input
        name={name}
        id={id}
        className="radio-button"
        onChange={onChange}
        value={value}
        type="radio"
        checked={isSelected}
      />
      <label htmlFor={id}>{label}</label>
    </>
  )
}

export default RadioButton
