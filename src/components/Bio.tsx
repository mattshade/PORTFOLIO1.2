import './Bio.css'

export function Bio() {
  return (
    <section id="bio" className="bio" aria-label="About">
      <div className="bio-inner">
        <h2 className="section-title bio-section-title">Summary</h2>
        <div className="bio-block">
          <p className="bio-typography-wall">
            Hands-on <span className="bird-perch">engineering & design leader</span> with deep experience building consumer platforms, <span className="highlight-text">scaling teams</span>, modernizing digital products, and applying <span className="bird-perch">AI to real workflow problems</span>. <br /><br />
            Combines leadership across engineering, product, design, and editorial with strong technical depth in web, mobile, cloud, and <span className="highlight-text">AI-enabled systems</span>. <br /><br />
            Known for translating <span className="bird-perch">prototypes & experimentation</span> into practical platform improvements, sustainable team growth, and measurable operational impact.
          </p>
        </div>
      </div>
    </section>
  )
}
