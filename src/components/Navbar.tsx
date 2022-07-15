import * as React from 'react'
import { useState } from 'react'
import './Navbar.scss'

type NavbarProps = {
  onDeleteAll?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onDeleteAll }) => {
  const [showTools, setShowTools] = useState(false)

  return (
    <nav className='navbar'>
      <span onClick={() => setShowTools(!showTools)}>Tasks</span>
      <ul className={showTools ? 'show' : ''}>
        <li
          onClick={() => {
            setShowTools(false)
            onDeleteAll && onDeleteAll()
          }}>
          Delete All
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
