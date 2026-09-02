import React from 'react'

interface IconProps {
  name: string
  size?: number
  fill?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * Icon – wraps Google Material Symbols Rounded from https://fonts.google.com/icons
 */
export function Icon({ name, size = 20, fill = false, className = '', style = {} }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded select-none leading-none inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        verticalAlign: 'middle',
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
