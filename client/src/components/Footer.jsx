export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo"><i className="fa-solid fa-graduation-cap"></i> TPD System</div>
          <p>Teacher Performance &amp; Development Tracking System — helping schools track progress, encourage growth, and celebrate excellence.</p>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p><i className="fa-solid fa-location-dot"></i> No. 45, Galle Road, Colombo 03, Sri Lanka</p>
          <p><i className="fa-solid fa-phone"></i> +94 11 234 5678</p>
          <p><i className="fa-solid fa-envelope"></i> info@tpdsystem.lk</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <p><a href="/login">Sign In</a></p>
          <p><a href="/register">Register</a></p>
          <p><a href="/verify/sample">Verify a Certificate</a></p>
        </div>

        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} TPD System. All rights reserved. Proudly built in Sri Lanka 🇱🇰</p>
      </div>
    </footer>
  );
}
