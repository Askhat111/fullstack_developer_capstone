import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import positiveIcon from "../assets/positive.png";
import neutralIcon from "../assets/neutral.png";
import negativeIcon from "../assets/negative.png";

export default function Dealer() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/djangoapp/dealer/${id}`).then((response) => response.json().then((data) => ({ response, data }))),
      fetch(`/djangoapp/reviews/dealer/${id}`).then((response) => response.json().then((data) => ({ response, data }))),
    ]).then(([dealerResult, reviewResult]) => {
      if (!active) return;
      if (!dealerResult.response.ok) throw new Error(dealerResult.data.error || 'Could not load dealership.');
      if (!reviewResult.response.ok) throw new Error(reviewResult.data.error || 'Could not load reviews.');
      setDealer(dealerResult.data.dealer?.[0] || null);
      setReviews(reviewResult.data.reviews || []);
    }).catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, [id]);

  const sentimentIcon = { positive: positiveIcon, neutral: neutralIcon, negative: negativeIcon };
  return (
    <div>
      <Header />
      <main className="dealer-detail">
        {error && <p role="alert">{error}</p>}
        {!dealer && !error ? <p>Loading dealership…</p> : dealer && <>
          <div className="dealer-heading">
            <div><h1>{dealer.full_name}</h1><p>{dealer.city}, {dealer.address}, ZIP {dealer.zip}, {dealer.state}</p></div>
            {sessionStorage.getItem('username') && <Link className="action_button" to={`/postreview/${dealer.id}`}>Write a review</Link>}
          </div>
          <h2>Customer reviews</h2>
          {reviews.length === 0 ? <p>No reviews yet.</p> : <div className="reviews_panel">
            {reviews.map((review) => <article className="review_panel" key={review.id}>
              <img src={sentimentIcon[review.sentiment] || neutralIcon} className="emotion_icon" alt={`${review.sentiment || 'neutral'} sentiment`} />
              <p className="review">{review.review}</p>
              <p className="reviewer">{review.name} · {review.car_make} {review.car_model} {review.car_year}</p>
            </article>)}
          </div>}
        </>}
      </main>
    </div>
  );
}
