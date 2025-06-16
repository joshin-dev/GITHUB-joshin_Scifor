import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import axios from 'axios';
import './Booking.scss';

const seatsLayout = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => `${String.fromCharCode(65 + row)}${col + 1}`)
);

const FadeInSection = ({ children, delay = 0, y = 40 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

function Booking() {
  const { id } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=851b739379fb869940a149644577eff6&language=en-US`
        );
        setMovieDetails(response.data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const initiateRazorpayPayment = async (amount, bookingDetails) => {
    try {
      setIsProcessingPayment(true);

      const options = {
        key: 'rzp_test_Eho5jxwqV3hNXX', 
        amount: amount * 100, 
        currency: 'INR',
        name: 'CineNest',
        description: `Movie Ticket Booking - ${bookingDetails.movieTitle}`,
        image: '/favicon.ico',
        handler: function (response) {
          handlePaymentSuccess(response, bookingDetails);
        },
        prefill: {
          name: 'Movie Fan',
          email: 'user@cinenest.com',
        },
        notes: {
          movie_id: bookingDetails.movieId,
          seats: bookingDetails.seats.join(', '),
          show_date: bookingDetails.date,
          show_time: bookingDetails.time
        },
        theme: {
          color: '#dc3545'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            console.log('Payment modal closed by user');
          }
        }
      };

      // Check if Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        handlePaymentFailure(response);
      });

      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      setIsProcessingPayment(false);
      alert('Error initiating payment. Please try again.');
    }
  };

  const handlePaymentSuccess = (response, bookingDetails) => {
    console.log('Payment Success:', response);
    setIsProcessingPayment(false);
    
   
    
    alert(
      `🎉 Payment Successful!\n\n` +
      `Payment ID: ${response.razorpay_payment_id}\n` +
      `Movie: ${bookingDetails.movieTitle}\n` +
      `Date: ${bookingDetails.date}\n` +
      `Time: ${bookingDetails.time}\n` +
      `Seats: ${bookingDetails.seats.join(', ')}\n` +
      `Amount Paid: ₹${bookingDetails.amount}\n\n` +
      `Your booking is confirmed! 🎬`
    );
    
    setSelectedSeats([]);
    setDate('');
    setTime('');
  };

  const handlePaymentFailure = (response) => {
    console.error('Payment Failed:', response);
    setIsProcessingPayment(false);
    
    alert(
      `❌ Payment Failed!\n\n` +
      `Error: ${response.error.description}\n` +
      `Please try again or contact support.`
    );
  };

  const handleBooking = async () => {
    if (!date || !time || selectedSeats.length === 0) {
      alert('Please select date, time and at least one seat.');
      return;
    }

    const seatPrice = 180;
    const totalAmount = selectedSeats.length * seatPrice;
    
    const bookingDetails = {
      movieId: id,
      movieTitle: movieDetails?.title || 'Unknown Movie',
      date: date,
      time: time,
      seats: selectedSeats,
      amount: totalAmount
    };

   

    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    // Initiate Razorpay payment
    await initiateRazorpayPayment(totalAmount, bookingDetails);
  };

  const times = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const seatPrice = 180;
  const totalAmount = selectedSeats.length * seatPrice;

  return (
    <>
      <div className="booking-container">
        {movieDetails && (
          <FadeInSection delay={0.1} y={-30}>
            <div className="movie-details">
              <motion.img
                src={`https://image.tmdb.org/t/p/w300${movieDetails.poster_path}`}
                alt={movieDetails.title}
                className="movie-poster"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              <FadeInSection delay={0.4} y={30}>
                <div className="movie-info">
                  <h1 className="movie-title">{movieDetails.title}</h1>
                  <div className="movie-meta">
                    <span className="rating">
                      ⭐ {movieDetails.vote_average?.toFixed(1)}/10
                    </span>
                    <span className="duration">
                      {movieDetails.runtime} min • {movieDetails.release_date?.split('-')[0]}
                    </span>
                  </div>
                  <p className="movie-overview">{movieDetails.overview}</p>
                  <div className="movie-genres">
                    <strong>Genres: </strong>
                    <span>{movieDetails.genres?.map((genre) => genre.name).join(', ')}</span>
                  </div>
                  {movieDetails.production_companies?.length > 0 && (
                    <div className="movie-production">
                      <strong>Production: </strong>
                      <span>{movieDetails.production_companies[0]?.name}</span>
                    </div>
                  )}
                </div>
              </FadeInSection>
            </div>
          </FadeInSection>
        )}

        <FadeInSection delay={0.2}>
          <h2 className="subtitle">Book Seats for {movieDetails?.title || `Movie ID: ${id}`}</h2>
        </FadeInSection>

        <div className="form-section">
          <FadeInSection delay={0.4}>
            <div className="form-group">
              <label>Select Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </FadeInSection>

          <FadeInSection delay={0.6}>
            <div className="form-group">
              <label>Select Time</label>
              <div className="time-options">
                {times.map((t, i) => (
                  <motion.button
                    key={t}
                    className={`time-btn ${time === t ? 'active' : ''}`}
                    onClick={() => setTime(t)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>

        <FadeInSection delay={0.8}>
          <div className="seating-section">
            <p className="screen-label">SCREEN</p>
            <div className="seat-grid">
              {seatsLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="seat-row">
                  {row.map((seat, i) => (
                    <motion.button
                      key={seat}
                      className={`seat-btn ${selectedSeats.includes(seat) ? 'selected' : ''}`}
                      onClick={() => toggleSeat(seat)}
                      whileTap={{ scale: 0.85 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 + rowIndex * 0.05 + i * 0.01 }}
                    >
                      {seat}
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection delay={1.4} y={20}>
          <div className="summary">
            <h3>Booking Summary</h3>
            <p><strong>Movie:</strong> {movieDetails?.title || '-'}</p>
            <p><strong>Date:</strong> {date || '-'}</p>
            <p><strong>Time:</strong> {time || '-'}</p>
            <p><strong>Seats:</strong> {selectedSeats.join(', ') || '-'}</p>
            <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
            <motion.button
              className="confirm-btn"
              onClick={handleBooking}
              disabled={!date || !time || selectedSeats.length === 0 || isProcessingPayment}
              whileTap={{ scale: 0.95 }}
            >
              {isProcessingPayment ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing Payment...
                </>
              ) : (
                'Confirm Booking'
              )}
            </motion.button>
          </div>
        </FadeInSection>
      </div>

      <motion.footer
        className="bg-dark text-white text-center py-4 mt-5"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          width: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <div className="container">
          <p className="mb-2">&copy; 2025 CineNest By Joshin Abraham. All rights reserved.</p>
        </div>
      </motion.footer>
    </>
  );
}

export default Booking;