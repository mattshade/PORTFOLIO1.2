import './AuraGridBackground.css'

export function AuraGridBackground() {
  return (
    <div className="aura-grid-bg" aria-hidden="true">
      <div className="auras-container">
        <div className="aura aura-1"></div>
        <div className="aura aura-2"></div>
        <div className="aura aura-3"></div>
      </div>
      <div className="aura-grid-wrapper">
        <div className="aura-grid"></div>
      </div>
    </div>
  )
}
