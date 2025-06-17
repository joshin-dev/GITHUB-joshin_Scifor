import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';
import { motion, useInView } from 'framer-motion';
import { useKeenSlider } from 'keen-slider/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'keen-slider/keen-slider.min.css';
import clapperboard from '../assets/clapperboard.png';

const MovieCard = ({ movie, index, isMobile = false }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  const [hovering, setHovering] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');
  const iframeRef = React.useRef(null);

  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  useEffect(() => {
    let timeout;

    if (hovering && !isTouchDevice && !trailerKey) {
      timeout = setTimeout(async () => {
        try {
          const res = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=851b739379fb869940a149644577eff6`
          );
          const trailer = res.data.results.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          if (trailer) {
            setTrailerKey(trailer.key);
          }
        } catch (error) {
          console.error('Error fetching trailer:', error);
        }
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [hovering, trailerKey, movie.id, isTouchDevice]);

  const handleCardClick = () => {
    // Stop trailer before opening YouTube
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
    setTrailerKey('');
    setHovering(false);

    if (trailerKey) {
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
    } else {
      axios
        .get(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=851b739379fb869940a149644577eff6`)
        .then((res) => {
          const trailer = res.data.results.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          if (trailer) {
            setTrailerKey(trailer.key);
            window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
          }
        });
    }
  };

  useEffect(() => {
    if (!hovering && !isTouchDevice) {
      const timeout = setTimeout(() => {
        // Stop iframe before clearing trailer key
        if (iframeRef.current) {
          iframeRef.current.src = 'about:blank';
        }
        setTrailerKey('');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [hovering, isTouchDevice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    };
  }, []);

  // Handle visibility change (when user returns from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && trailerKey && iframeRef.current) {
        // Reset iframe when page becomes visible again
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = 'about:blank';
          }
          setTrailerKey('');
          setHovering(false);
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trailerKey]);

  const cardStyle = isMobile ? {
    cursor: 'pointer',
    position: 'relative',
    height: '100%',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  } : {
    cursor: 'pointer',
    position: 'relative',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    zIndex: 1,
  };

  return (
    <motion.div
      ref={ref}
      className="card h-100"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={!isMobile ? {
        scale: 1.05,
        y: -10,
        zIndex: 5, 
        boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      } : {}}
      onMouseEnter={() => !isTouchDevice && setHovering(true)}
      onMouseLeave={() => !isTouchDevice && setHovering(false)}
      onClick={handleCardClick}
      style={cardStyle}
    >
      {hovering && trailerKey && !isTouchDevice ? (
        <iframe
          ref={iframeRef}
          width="100%"
          height="300"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`}
          title="Movie Trailer"
          allow="autoplay"
          allowFullScreen
          style={{ borderRadius: isMobile ? '15px 15px 0 0' : '10px' }}
        />
      ) : (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          className="card-img-top"
          alt={movie.title}
          style={{
            borderRadius: isMobile ? '15px 15px 0 0' : '15px 15px 0 0',
            height: isMobile ? '300px' : '350px',
            objectFit: 'cover',
            width: '100%'
          }}
        />
      )}

      <div className="card-body d-flex flex-column" style={{ padding: isMobile ? '1rem' : '1.25rem' }}>
        <div
          style={{
            opacity: hovering && trailerKey && !isTouchDevice ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          <h5 className="card-title" style={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
            {movie.title}
          </h5>
          <p className="card-text" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            {movie.overview.slice(0, isMobile ? 60 : 80)}...
          </p>
        </div>

        <Link
          to={`/booking/${movie.id}`}
          className="btn btn-danger mt-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            borderRadius: '8px'
          }}
        >
          Book Tickets
        </Link>
      </div> 
    </motion.div>
  );
};

const MovieSection = ({ title, movies }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 435;
  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1.3,
      spacing: 15,
    },
    breakpoints: {
      '(min-width: 436px)': {
        slides: { perView: 3, spacing: 15 },
      },
    },
  });

  if (!movies.length) return null;

  return (
    <>
      <motion.h2
        className="mb-4 mt-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {title} - Now in Theaters
      </motion.h2>
      {isMobile ? (
        <div 
          ref={sliderRef} 
          className="keen-slider"
          style={{ 
            padding: '0 10px',
            marginBottom: '20px'
          }}
        >
          {movies.map((movie, index) => (
            <div 
              key={movie.id} 
              className="keen-slider__slide"
              style={{
                display: 'flex',
                alignItems: 'stretch',
                minHeight: '450px'
              }}
            >
              <MovieCard movie={movie} index={index} isMobile={true} />
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          {movies.map((movie, index) => (
            <div key={movie.id} className="col-12 col-md-6 col-lg-4 mb-4" style={{ zIndex: 0 }}>
              <MovieCard movie={movie} index={index} isMobile={false} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Helper function to filter movies by genre
const filterMoviesByGenre = (movies, genreId) => {
  return movies.filter(movie => 
    movie.genre_ids && movie.genre_ids.includes(genreId)
  );
};

function Home() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [romanceMovies, setRomanceMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [animatedMovies, setAnimatedMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Check if this is the first time loading the app
  const [showIntro, setShowIntro] = useState(() => {
    // Check if intro has been shown before in this session
    return !sessionStorage.getItem('introShown');
  });

  const query = useQuery();
  const searchTerm = query.get('search') || '';

  // Mark intro as shown when component mounts
  useEffect(() => {
    if (showIntro) {
      sessionStorage.setItem('introShown', 'true');
    }
  }, [showIntro]);

  useEffect(() => {
    async function fetchNowPlayingMovies() {
      setLoading(true);
      try {
        // Fetch multiple pages to get more movies for genre filtering
        const pages = [1, 2, 3];
        const allMovies = [];

        for (const page of pages) {
          const res = await axios.get(
            `https://api.themoviedb.org/3/movie/now_playing?api_key=851b739379fb869940a149644577eff6&language=en-US&page=${page}&region=US`
          );
          allMovies.push(...res.data.results);
        }

        // Filter out movies without posters and sort by popularity
        const validMovies = allMovies
          .filter(movie => movie.poster_path && movie.backdrop_path)
          .sort((a, b) => b.popularity - a.popularity);

        setNowPlayingMovies(validMovies.slice(0, 8));

        // Filter by genres from now playing movies
        const actionGenreMovies = filterMoviesByGenre(validMovies, 28).slice(0, 6); // Action
        const romanceGenreMovies = filterMoviesByGenre(validMovies, 10749).slice(0, 6); // Romance
        const dramaGenreMovies = filterMoviesByGenre(validMovies, 18).slice(0, 6); // Drama
        const animatedGenreMovies = filterMoviesByGenre(validMovies, 16).slice(0, 6); // Animation
        const comedyGenreMovies = filterMoviesByGenre(validMovies, 35).slice(0, 6); // Comedy
        const horrorGenreMovies = filterMoviesByGenre(validMovies, 27).slice(0, 6); // Horror

        setActionMovies(actionGenreMovies);
        setRomanceMovies(romanceGenreMovies);
        setDramaMovies(dramaGenreMovies);
        setAnimatedMovies(animatedGenreMovies);
        setComedyMovies(comedyGenreMovies);
        setHorrorMovies(horrorGenreMovies);

      } catch (err) {
        console.error('Failed to fetch now playing movies:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!searchTerm) {
      fetchNowPlayingMovies();
      setSearchResults([]);
      setSearching(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) return;

      setSearching(true);
      try {
        // First, get all currently playing movies (multiple pages for comprehensive search)
        const nowPlayingPages = [1, 2, 3, 4, 5];
        const allNowPlayingMovies = [];

        for (const page of nowPlayingPages) {
          const res = await axios.get(
            `https://api.themoviedb.org/3/movie/now_playing?api_key=851b739379fb869940a149644577eff6&language=en-US&page=${page}&region=US`
          );
          allNowPlayingMovies.push(...res.data.results);
        }

        // Filter currently playing movies by search term
        const searchLower = searchTerm.toLowerCase();
        const filteredNowPlaying = allNowPlayingMovies.filter(movie => 
          movie.poster_path && 
          (movie.title.toLowerCase().includes(searchLower) ||
           movie.overview.toLowerCase().includes(searchLower))
        );

        // If we found matches in now playing movies, use those
        if (filteredNowPlaying.length > 0) {
          setSearchResults(filteredNowPlaying.slice(0, 12));
        } else {
          // If no matches in now playing, search all movies but warn user
          const generalSearchRes = await axios.get(
            `https://api.themoviedb.org/3/search/movie/now_playing?api_key=851b739379fb869940a149644577eff6&query=${encodeURIComponent(searchTerm)}`
          );
          const generalResults = generalSearchRes.data.results.filter(movie => movie.poster_path);
          setSearchResults(generalResults.slice(0, 12));
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
      setSearching(false);
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleSelect = (selectedIndex) => {
    setCarouselIndex(selectedIndex);
  };

  // Show intro animation only on first load
  
if (showIntro) {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '100vh',
        width: '100vw',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      <motion.img
        src={clapperboard}
        alt="clapperboard"
        initial={{ scale: 0 }}
        animate={{ 
          scale: window.innerWidth <= 768 ? 1 : 1.5, 
          rotate: 10 
        }}
        transition={{ duration: 1 }}
        onAnimationComplete={() => setShowIntro(false)}
        style={{ 
          width: window.innerWidth <= 768 ? '150px' : '200px',
          maxWidth: '80vw',
          height: 'auto',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <motion.div
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="container mt-4"
        style={{ flex: 1 }}
      >
        {searchTerm ? (
          <>
            <h3 style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
              Search Results for "{searchTerm}" {searching && '(Searching...)'}
            </h3>
            {searchResults.length ? (
              <>
                <div className="row" style={{ position: 'relative', zIndex: 1 }}>
                  {searchResults.map((movie, index) => (
                    <div key={movie.id} className="col-12 col-md-6 col-lg-4 mb-4" style={{ zIndex: 0 }}>
                      <MovieCard movie={movie} index={index} isMobile={false} />
                    </div>
                  ))}
                </div>
                {/* Check if results are from now playing movies */}
                {!nowPlayingMovies.some(nowPlaying => 
                  searchResults.some(result => result.id === nowPlaying.id)
                ) && searchResults.length > 0 && (
                  <div className="alert alert-warning mt-3" role="alert">
                    <strong>Note:</strong> Some of these movies may not be currently playing in theaters. 
                    For the most accurate theater listings, please check your local cinema.
                  </div>
                )}
              </>
            ) : (
              !searching && (
                <div style={{ 
                  position: 'relative', 
                  zIndex: 10, 
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <div className="text-center">
                    <h4 className="mb-3">No movies found for "{searchTerm}"</h4>
                    <p className="text-muted">
                      Try searching for movies that are currently playing in theaters, or check your spelling.
                    </p>
                    <Link to="/" className="btn btn-danger mt-3">
                      Browse All Movies
                    </Link>
                  </div>
                </div>
              )
            )}
          </>
        ) : (
          <>
            <Carousel
              activeIndex={carouselIndex}
              onSelect={handleSelect}
              controls={false}
              indicators
              interval={3000}
              pause={false}
              fade
            >
              {nowPlayingMovies.slice(0, 6).map((movie, i) => (
                <Carousel.Item key={movie.id}>
                  <motion.div
                    style={{
                      borderRadius: '15px',
                      overflow: 'hidden',
                      perspective: 1000,
                      height: '400px',
                      width: '100%',
                      margin: 'auto',
                    }}
                    initial={{ scale: 0.9, rotateY: 0 }}
                    animate={i === carouselIndex ? { scale: 1.1, rotateY: 15 } : { scale: 0.9, rotateY: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                    <motion.img
                      className="d-block w-100"
                      src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                      alt={movie.title}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  </motion.div>
                  <Carousel.Caption>
                    <h5>{movie.title}</h5>
                    <p>{movie.overview.slice(0, 100)}...</p>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>

            <MovieSection title="Latest" movies={nowPlayingMovies} />
            <MovieSection title="Action" movies={actionMovies} />
            <MovieSection title="Comedy" movies={comedyMovies} />
            <MovieSection title="Romance" movies={romanceMovies} />
            <MovieSection title="Drama" movies={dramaMovies} />
            <MovieSection title="Horror" movies={horrorMovies} />
            <MovieSection title="Animated" movies={animatedMovies} />
          </>
        )}
      </motion.div>

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
          marginTop: 'auto'
        }}
      >
        <div className="container">
          <p className="mb-2">&copy; 2025 CineNest By Joshin Abraham. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}

export default Home;