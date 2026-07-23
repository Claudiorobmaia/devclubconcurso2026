const DEFAULT_COLOR = 'purple'

const courseColorHex = {
  purple: '#a855f7',
  blue: '#3b82f6',
  green: '#22c55e',
  emerald: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
  cyan: '#06b6d4',
}

const courseColorClasses = {
  purple: 'border-purple-500/30 text-purple-400',
  blue: 'border-blue-500/30 text-blue-400',
  green: 'border-green-500/30 text-green-400',
  emerald: 'border-emerald-500/30 text-emerald-400',
  orange: 'border-orange-500/30 text-orange-400',
  red: 'border-red-500/30 text-red-400',
  cyan: 'border-cyan-500/30 text-cyan-400',
}

const badgeColorClasses = {
  purple: 'bg-purple-500/20 border-purple-400/30',
  blue: 'bg-blue-500/20 border-blue-400/30',
  green: 'bg-green-500/20 border-green-400/30',
  emerald: 'bg-emerald-500/20 border-emerald-400/30',
  orange: 'bg-orange-500/20 border-orange-400/30',
  red: 'bg-red-500/20 border-red-400/30',
  cyan: 'bg-cyan-500/20 border-cyan-400/30',
}

function getCourseColor(colorKey) {
  if (!courseColorHex[colorKey]) {
    console.warn(`Cor "${colorKey}" não mapeada. Usando fallback "${DEFAULT_COLOR}".`)
  }

  return {
    hex: courseColorHex[colorKey] || courseColorHex[DEFAULT_COLOR],
    classes: courseColorClasses[colorKey] || courseColorClasses[DEFAULT_COLOR],
  }
}

export { DEFAULT_COLOR, courseColorHex, courseColorClasses, badgeColorClasses, getCourseColor }
