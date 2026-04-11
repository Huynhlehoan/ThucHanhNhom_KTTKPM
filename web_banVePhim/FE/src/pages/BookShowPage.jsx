import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import Sidebar from '../components/Sidebar.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { seats as initialSeats, shows } from '../data/mockData.js';
import { toast } from 'sonner';

const BookShowPage = () => {
  const navigate = useNavigate();
  const { selectedMovie, selectedSeats, toggleSeat, createBooking, resetBooking } = useBooking();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderId] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);

  useEffect(() => {
    if (!selectedMovie) {
      navigate('/');
    }
  }, [selectedMovie, navigate]);

  if (!selectedMovie) {
    return null;
  }

  const movieShows = shows.filter(show => show.movieId === selectedMovie.id);
  const selectedShow = movieShows[0];

  const handleCompleteBooking = (details) => {
    const booking = createBooking(details.paymentMethod, {
      name: details.customerName,
      contact: details.customerContact
    });
    
    toast.success('Booking confirmed');
    navigate('/ticket-history');
  };

  return (
    <>
      <Helmet>
        <title>{`Book ${selectedMovie.title} - PVR Cinema`}</title>
        <meta name="description" content={`Book tickets for ${selectedMovie.title}`} />
      </Helmet>

      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to movies
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-3"
              >
                <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="w-full aspect-[2/3] object-cover rounded-lg mb-4"
                  />
                  
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {selectedMovie.title}
                  </h2>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-foreground">{selectedMovie.rating}</span>
                    <span className="text-muted-foreground">/ 10</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {selectedMovie.description}
                  </p>

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
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {selectedShow.format}
                        </span>
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                          {selectedShow.language}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="lg:col-span-6"
              >
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-6">Select your seats</h3>
                  <SeatGrid
                    seats={initialSeats}
                    selectedSeats={selectedSeats}
                    onSeatClick={toggleSeat}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="lg:col-span-3"
              >
                <div className="sticky top-6">
                  <OrderSummary
                    orderId={orderId}
                    selectedSeats={selectedSeats}
                    onComplete={handleCompleteBooking}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookShowPage;