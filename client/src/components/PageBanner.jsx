// A poster-style hero banner used at the top of every page: a themed
// photograph with the page title and subtitle overlaid on a gradient
// scrim for readability. Images are hotlinked from Unsplash (free to
// use commercially, no attribution required) rather than bundled —
// nothing to download or rename.
export default function PageBanner({ image, title, subtitle, children }) {
  return (
    <div className="page-banner" style={{ backgroundImage: `url(${image})` }}>
      <div className="page-banner-scrim"></div>
      <div className="page-banner-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children && <div className="page-banner-actions">{children}</div>}
      </div>
    </div>
  );
}
