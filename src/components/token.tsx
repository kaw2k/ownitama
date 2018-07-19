import * as React from 'react'
import { Piece } from 'interfaces'

export const Token: React.SFC<{
  piece: Piece
  disabled?: boolean
  onClick?: () => void
}> = ({ piece: { type, color }, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`token ${type} ${color}`}>
    <div />
  </button>
)
