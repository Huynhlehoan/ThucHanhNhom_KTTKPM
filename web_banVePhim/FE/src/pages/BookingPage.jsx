import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { movies, seats as initialSeats, shows } from '../data/mockData.js';
import { toast } from 'sonner';

const BookingPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { selectMovie, selectedMovie, selectedSeats, toggleSeat, createBooking } = useBooking();
  const [orderId] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);

  useEffect(() => {
    const movie = movies.find(m => m.id === parseInt(movieId));
    if (movie) {
      selectMovie(movie);
    } else {
      navigate('/movies');
    }
  }, [movieId, navigate, selectMovie]);

  if (!selectedMovie) return null;

  const movieShows = shows.filter(show => show.movieId === selectedMovie.id);
  const selectedShow = movieShows[0]; // Default to first show for simplicity

  const handleCompleteBooking = (details) => {
    const booking = createBooking(details.paymentMethod, {
      name: details.customerName,
      contact: details.customerContact
    });
    
    toast.success('Đặt vé thành công!');
    navigate('/confirmation', { state: { booking } });
  };

  return (
    <>
      <Helmet>
        <title>{`Đặt vé ${selectedMovie.title} - PVR Cinema`}</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
          <Button
            variant="ghost"
            onClick={() => navigate('/movies')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách phim
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Movie Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg mb-4"
                />
                
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {selectedMovie.title}
                </h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-foreground">{selectedMovie.rating}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>

                {selectedShow && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedShow.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedShow.screen}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">
                        {selectedShow.format}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                        {selectedShow.language}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Center: Seat Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-6"
            >
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">Chọn ghế của bạn</h3>
                <SeatGrid
                  seats={initialSeats}
                  selectedSeats={selectedSeats}
                  onSeatClick={toggleSeat}
                />
              </div>
            </motion.div>

            {/* Right: Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="sticky top-24">
                <OrderSummary
                  orderId={orderId}
                  selectedSeats={selectedSeats}
                  onComplete={handleCompleteBooking}
                />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default BookingPage;