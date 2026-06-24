export default function ForecastCards({ title, subtitle, items, tempLabel, type = 'hourly' }) {
  return (
    <section className="panel">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{subtitle}</h3>
        </div>
        <span className="pill">Live data</span>
      </div>
      <div className={type === 'hourly' ? 'hourly-grid' : 'forecast-grid'}>
        {items.map((item) => (
          type === 'hourly' ? (
            <article key={item.time} className="mini-card">
              <span>{item.label}</span>
              <strong>{item.temperature.toFixed(0)}{tempLabel}</strong>
              <small>{item.text}</small>
              <small>{item.rain ?? 0}% rain chance</small>
            </article>
          ) : (
            <article key={item.date} className="forecast-card">
              <h4>{item.label}</h4>
              <p>{item.text}</p>
              <strong>{item.max.toFixed(0)} / {item.min.toFixed(0)}{tempLabel}</strong>
              <span>Rain {item.rain}%</span>
              <span>{item.sunrise} · {item.sunset}</span>
            </article>
          )
        ))}
      </div>
    </section>
  );
}
