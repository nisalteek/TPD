export default function Loader({ label = 'Initializing TPD System' }) {
  return (
    <div className="boot-loader">
      <div className="boot-grid"></div>
      <div className="boot-core">
        <div className="orbit-ring"></div>
        <div className="orbit-ring orbit-ring-2"></div>
        <i className="fa-solid fa-graduation-cap boot-icon"></i>
      </div>
      <p className="boot-label">{label}<span className="boot-dots"><span>.</span><span>.</span><span>.</span></span></p>
      <div className="boot-bar-track"><div className="boot-bar-fill"></div></div>
    </div>
  );
}
