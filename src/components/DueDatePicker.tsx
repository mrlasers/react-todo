import { format } from 'date-fns'
import * as React from 'react'
import { FiClock } from 'react-icons/fi'

const buttonStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
}

const iconStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
}

const inputStyle: React.CSSProperties = {
  opacity: 0,
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
}

export type DueDatePickerProps = {
  date?: Date
  onChange: any
  displayBlock?: true
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">

export const DueDatePicker: React.FC<DueDatePickerProps> = (props) => {
  const { onChange, date, displayBlock, ...attrs } = props

  const configuredStyle = { display: displayBlock ? "flex" : "inline-flex" }

  return (
    <button {...attrs} style={{ ...buttonStyle, ...configuredStyle }}>
      <FiClock />
      <span>{date?.toString()}</span>
    </button>
  )
}
