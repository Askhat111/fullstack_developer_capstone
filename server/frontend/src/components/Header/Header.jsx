import React from 'react';
import "../assets/style.css";
import "../assets/bootstrap.min.css";

export default function Header() {
  const username = sessionStorage.getItem('username');

  async function logout(event) {
    event.preventDefault();
    const response = await fetch('/djangoapp/logout');
    if (response.ok) {
      sessionStorage.removeItem('username');
      window.location.assign('/');
    }
  }

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: 'darkturquoise', minHeight: '1in' }}>
        <div className="container-fluid">
          <a className="navbar-brand" href="/"><strong>Dealerships</strong></a>
          <div className="navbar-nav me-auto">
            <a className="nav-link" href="/">Home</a>
            <a className="nav-link" href="/about">About Us</a>
            <a className="nav-link" href="/contact">Contact Us</a>
          </div>
          <div className="d-flex align-items-center gap-3">
            {username ? <><span className="username">{username}</span><a className="nav-link" href="/djangoapp/logout" onClick={logout}>Logout</a></> : <a className="nav-link" href="/login">Login</a>}
          </div>
        </div>
      </nav>
    </header>
  );
}
