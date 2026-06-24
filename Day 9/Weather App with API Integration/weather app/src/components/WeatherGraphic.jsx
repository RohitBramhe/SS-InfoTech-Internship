export default function WeatherGraphic({ theme, condition, rainChance, humidity }) {
  const rainDrops = Array.from({ length: 18 }, (_, index) => index);
  const snowFlakes = Array.from({ length: 14 }, (_, index) => index);
  const particles = Array.from({ length: theme === 'stormy' ? 12 : 8 }, (_, index) => ({
    id: index,
    left: `${6 + (index * 11) % 88}%`,
    top: `${10 + (index * 7) % 72}%`,
    size: 4 + (index % 3) * 2,
    delay: `${(index % 5) * 0.12}s`,
    duration: `${2.8 + (index % 4) * 0.6}s`,
  }));

  return (
    <section className={`panel graphic-card ${theme}`}>
      <div className="graphic-copy">
        <p className="eyebrow">Live forecast graphic</p>
        <h2>Animated weather preview</h2>
        <p className="lede">A soft sky, cloud motion, and cartoon-style weather effects react to the real API prediction you chose.</p>
        <div className="prediction-badges">
          <span>Prediction: {condition || 'Loading weather...'}</span>
          <span>Rain chance: {rainChance ?? 0}%</span>
          <span>Humidity: {humidity ?? 0}%</span>
        </div>
      </div>
      <div className={`weather-visual ${theme}`} aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="weather-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
        <div className="sun-burst" />
        <div className="cloud cloud-one" />
        <div className="cloud cloud-two" />
        <div className="cloud cloud-three" />
        {theme === 'stormy' && <div className="thunderbolt" />}
        {theme === 'rainy' && (
          <div className="rain-layer">
            {rainDrops.map((item) => (
              <span key={item} style={{ left: `${(item * 7) % 97}%`, animationDelay: `${(item % 5) * 0.1}s` }} />
            ))}
          </div>
        )}
        {theme === 'snowy' && (
          <div className="snow-layer">
            {snowFlakes.map((item) => (
              <span key={item} style={{ left: `${(item * 7) % 97}%`, animationDelay: `${(item % 4) * 0.15}s` }} />
            ))}
          </div>
        )}
        {theme === 'misty' && <div className="mist-band" />}
      </div>
    </section>
  );
}
