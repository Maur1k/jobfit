export function ReviewPanel(props: { text: string; onUse: () => void; onDiscard: () => void }) {
  return (
    <section className="card review-panel" aria-labelledby="resume-review-title">
      <h3 id="resume-review-title">Review extracted text</h3>
      <p className="muted">Check the text before adding it to your Master Resume.</p>
      <pre className="extracted-text">{props.text}</pre>
      <div className="row-actions">
        <button type="button" className="primary" onClick={props.onUse}>Use this text</button>
        <button type="button" onClick={props.onDiscard}>Discard</button>
      </div>
    </section>
  );
}
