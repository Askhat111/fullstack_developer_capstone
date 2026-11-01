import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

export default function PostReview() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [cars, setCars] = useState([]);
  const [review, setReview] = useState('');
  const [modelKey, setModelKey] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/djangoapp/dealer/${id}`).then((response) => response.json()),
      fetch('/djangoapp/get_cars').then((response) => response.json()),
    ]).then(([dealerData, carsData]) => {
      setDealer(dealerData.dealer?.[0] || null);
      setCars(carsData.CarModels || []);
    }).catch(() => setMessage('Could not load dealership or car list.'));
  }, [id]);

  async function submit(event) {
    event.preventDefault();
    if (!sessionStorage.getItem('username')) {
      setMessage('Please log in before submitting a review.');
      return;
    }
    const selected = cars.find((car) => `${car.CarMake}|||${car.CarModel}` === modelKey);
    if (!selected || !date || !year || !review.trim()) {
      setMessage('Complete each field before submitting.');
      return;
    }
    try {
      const response = await fetch('/djangoapp/add_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealership: Number(id), review: review.trim(), purchase: true,
          purchase_date: date, car_make: selected.CarMake, car_model: selected.CarModel,
          car_year: Number(year),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Review could not be saved.');
      window.location.assign(`/dealer/${id}`);
    } catch (error) { setMessage(error.message); }
  }

  return (
    <div>
      <Header />
      <main className="review-form-page">
        <h1>Write a review</h1>
        {dealer && <p>Dealership: <strong>{dealer.full_name}</strong></p>}
        <form onSubmit={submit}>
          <label htmlFor="review">Your review</label>
          <textarea id="review" required rows="6" value={review} onChange={(event) => setReview(event.target.value)} />
          <label htmlFor="purchase-date">Purchase date</label>
          <input id="purchase-date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
          <label htmlFor="car">Car make and model</label>
          <select id="car" required value={modelKey} onChange={(event) => setModelKey(event.target.value)}>
            <option value="">Choose a car</option>
            {cars.map((car) => <option key={`${car.CarMake}-${car.CarModel}`} value={`${car.CarMake}|||${car.CarModel}`}>{car.CarMake} {car.CarModel}</option>)}
          </select>
          <label htmlFor="year">Model year</label>
          <input id="year" type="number" min="2015" max="2023" required value={year} onChange={(event) => setYear(event.target.value)} />
          <button className="postreview" type="submit">Post review</button>
          {message && <p role="alert">{message}</p>}
        </form>
      </main>
    </div>
  );
}
