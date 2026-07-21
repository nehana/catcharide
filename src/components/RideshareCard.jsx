const STATUS_LABELS = {
  nationwide: { label: 'Nationwide', className: 'status-nationwide' },
  city_only: { label: 'City Only', className: 'status-city' },
  taxi_only: { label: 'Taxi Dispatch Only', className: 'status-taxi' },
  gray_area: { label: 'Legal Gray Area', className: 'status-gray' },
  banned: { label: 'Banned', className: 'status-banned' },
  absent: { label: 'Not Available', className: 'status-absent' },
};

const PRICE_LABELS = {
  cheap: '$',
  mid: '$$',
  premium: '$$$',
};

function RideshareCard({ app, isRecommended }) {
  const status = STATUS_LABELS[app.status] ?? STATUS_LABELS.absent;
  const priceLabel = PRICE_LABELS[app.price_tier];

  return (
    <div className={`ride-card ${isRecommended ? 'ride-card-highlighted' : ''}`}>
      <div className="ride-card-header">
        <h3>{app.name}</h3>
        <div className="ride-card-badges">
          {priceLabel && <span className="price-pill">{priceLabel}</span>}
          <span className={`status-pill ${status.className}`}>{status.label}</span>
        </div>
      </div>

      {app.pros && (
        <div className="pros-cons">
          <p className="pc-label pc-pro">Why it's a good pick</p>
          <p className="pc-text">{app.pros}</p>
        </div>
      )}

      {app.cons && (
        <div className="pros-cons">
          <p className="pc-label pc-con">Watch out for</p>
          <p className="pc-text">{app.cons}</p>
        </div>
      )}
    </div>
  );
}

export default RideshareCard;