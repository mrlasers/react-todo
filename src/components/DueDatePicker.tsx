import { format } from 'date-fns'
import * as React from 'react'
import { FiClock } from 'react-icons/fi'

const buttonStyle: React.CSSProperties = {
  position: 'relative',
}

const inputStyle: React.CSSProperties = {
  opacity: 0,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
}

export type DueDatePickerProps = {
  date?: Date
  onChange: any
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>

export const DueDatePicker: React.FC<DueDatePickerProps> = (props) => {
  const { onChange, date, ...attrs } = props

  // const text =  format(date, 'MMM d')

  return (
    <button {...attrs} style={buttonStyle}>
      <FiClock />
      <span>{date?.toString()}</span>
    </button>
  )
}
