import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatAge = (months) => {
  if (months < 12) return months + 'm';
  if (months === 12) return '1y';
  if (months % 12 === 0) return months/12 + 'y';
  const years = Math.floor(months/12); const rem = months % 12;
  return `${years}y ${rem}m`;
};
const formatRange = (range=[]) => range.length===2 ? `${formatAge(range[0])} - ${formatAge(range[1])}` : '';

const renderStars = (rating) => {
  if (rating == null) return null;
  const max = 3;
  return (
    <span style={{display:'inline-flex', gap:2, marginLeft:4}} aria-label={`Yunsol rating ${rating} of ${max}`}>
      {Array.from({length: max}).map((_,i)=>(
        <span key={i} style={{filter: i < rating ? 'none':'grayscale(1) opacity(.35)'}}>{'⭐'}</span>
      ))}
    </span>
  );
};

const PlaceCardNew = ({ place, onFeatureClick }) => {
  const navigate = useNavigate();
  const go = () => navigate(`/place/${place.id}`);
  const pick = place.yunsolExperience?.hasVisited;
  const rating = place.yunsolExperience?.rating;
  return (
    <div className="place-card-new" onClick={go} role="button" tabIndex={0} onKeyDown={(e)=> e.key==='Enter' && go() }>
      <div className="place-visual">
        <span aria-hidden>{place.icon}</span>
        {pick && (
          <div className="badge-toddler" title="Yunsol's Pick" style={{
            position:'absolute', top:8, left:8, display:'flex', alignItems:'center', gap:4,
            background:'linear-gradient(90deg,var(--color-primary),var(--color-warm))', color:'#fff',
            padding:'4px 10px', borderRadius:20, fontSize:'0.65rem', letterSpacing:'0.5px', fontWeight:600,
            boxShadow:'0 2px 4px rgba(0,0,0,0.15)'
          }}>
            <span style={{fontSize:'0.9rem'}}>👶</span>
            Yunsol's Pick
            {renderStars(rating)}
          </div>
        )}
      </div>
      <div className="place-body">
        <div>
          <div className="place-name" style={{display:'flex', alignItems:'center', gap:6}}>
            {place.name}
          </div>
          <p className="place-desc">{place.description}</p>
        </div>
        <div className="feature-tags">
          {(place.features||[]).slice(0,6).map(f => (
            <span key={f} className="tag clickable" onClick={(e)=>{e.stopPropagation(); onFeatureClick?.(f);}}>{f}</span>
          ))}
        </div>
        <div className="place-meta-new">
          <span className="meta-pill" title="Age Range">{formatRange(place.ageRange)}</span>
          <span className="price-pill" title="Pricing">{place.pricing||'Free'}</span>
        </div>
        <div className="card-footer">Details →</div>
      </div>
    </div>
  );
};

export default PlaceCardNew;
