import './TipCard.css'

const TipCard = ({ tip }) => {
  return (
    <div className="tip-card">
      <div className="tip-icon">{tip.icon}</div>
      <h3 className="tip-title">{tip.title}</h3>
      <p className="tip-description">{tip.description}</p>
    </div>
  )
}

export default TipCard
