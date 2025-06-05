import  { useState } from 'react';

const FeedbackForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const feedbackData = {
      fullName,
      email,
      feedbackRating,
      feedback,
    };

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      const data = await response.json();
      console.log('Submitted data:', data);

      setSubmitted(true);
      setFullName('');
      setEmail('');
      setFeedbackRating('');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const formStyle = {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '4px',
    display: 'block',
  };

  const buttonStyle = {
    padding: '10px',
    width: '100%',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  const messageStyle = {
    color: 'green',
    marginTop: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
  };

  return (
    <div style={formStyle}>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Full Name:</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Feedback Rating:</label>
        <select
          value={feedbackRating}
          onChange={(e) => setFeedbackRating(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Select a rating</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>

        <label style={labelStyle}>Feedback:</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
          rows="4"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Submit Feedback</button>
      </form>

      {submitted && <div style={messageStyle}>Feedback submitted successfully!</div>}
    </div>
  );
};

export default FeedbackForm;
