import * as React from 'react'
import { Piece } from '../interfaces'

export const Token: React.SFC<{
  piece: Piece
  disabled?: boolean
  onClick?: () => void
  className?: string
}> = ({ piece: { type, color }, disabled, onClick, className = '' }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`token ${type} ${color} ${className}`}>
    <div />
  </button>
)
