import React, { useState } from "react";
import Header from "../Header/Header";
import "./Register.css";

export default function Register() {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    const response = await fetch("/djangoapp/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, firstName, lastName, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      sessionStorage.setItem("username", data.userName);
      window.location.assign("/");
    } else {
      setMessage(data.error || "Could not create account.");
    }
  }

  return (
    <>
      <Header />
      <main className="register_container">
        <h1>Create an account</h1>
        <form className="inputs" onSubmit={submit}>
          <label className="input">Username <input required minLength="3" autoComplete="username" value={userName} onChange={(event) => setUserName(event.target.value)} /></label>
          <label className="input">First Name <input required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
          <label className="input">Last Name <input required autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
          <label className="input">Email <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="input">Password <input required minLength="8" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="action_button" type="submit">Register</button>
          {message && <p role="alert">{message}</p>}
        </form>
      </main>
    </>
  );
}
