import React, { useEffect, useState } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import reviewIcon from "../assets/reviewicon.png";

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/djangoapp/get_dealers');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load dealerships.');
        setDealers(data.dealers || []);
        setStates([...new Set((data.dealers || []).map((dealer) => dealer.state))].sort());
      } catch (err) { setError(err.message); }
    }
    load();
  }, []);

  async function filterByState(state) {
    setSelectedState(state);
    try {
      const response = await fetch(`/djangoapp/get_dealers/${encodeURIComponent(state)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not filter dealerships.');
      setDealers(data.dealers || []);
      setError('');
    } catch (err) { setError(err.message); }
  }

  const loggedIn = Boolean(sessionStorage.getItem('username'));
  return (
    <div>
      <Header />
      <main className="dealer-list">
        <h1>Find a dealership</h1>
        <label htmlFor="state">Filter by state </label>
        <select id="state" value={selectedState} onChange={(event) => filterByState(event.target.value)}>
          <option value="All">All States</option>
          {states.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
        {error && <p role="alert">{error}</p>}
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th>ID</th><th>Dealer Name</th><th>City</th><th>Address</th><th>ZIP</th><th>State</th>{loggedIn && <th>Review</th>}</tr></thead>
            <tbody>{dealers.map((dealer) => (
              <tr key={dealer.id}>
                <td>{dealer.id}</td>
                <td><a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a></td>
                <td>{dealer.city}</td><td>{dealer.address}</td><td>{dealer.zip}</td><td>{dealer.state}</td>
                {loggedIn && <td><a href={`/postreview/${dealer.id}`}><img src={reviewIcon} className="review_icon" alt={`Review ${dealer.full_name}`} /></a></td>}
              </tr>
            ))}</tbody>
          </table>
          {!error && dealers.length === 0 && <p>No dealerships found in this state.</p>}
        </div>
      </main>
    </div>
  );
}
