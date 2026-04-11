import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);

  const generateOrderId = () => {
    return `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const selectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedSeats([]);
  };

  const selectShow = (show) => {
    setSelectedShow(show);
  };

  const toggleSeat = (seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.row === seat.row && s.number === seat.number);
      if (exists) {
        return prev.filter(s => !(s.row === seat.row && s.number === seat.number));
      } else {
        return [...prev, seat];
      }
    });
  };

  const clearSeats = () => {
    setSelectedSeats([]);
  };

  const createBooking = (paymentMethod, customerDetails) => {
    const orderId = generateOrderId();
    const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const discount = 0;
    const tax = subtotal * 0.18;
    const total = subtotal - discount + tax;

    const booking = {
      id: orderId,
      movieTitle: selectedMovie.title,
      seats: selectedSeats.map(s => `${s.row}${s.number}`),
      date: new Date().toISOString().split('T')[0],
      time: selectedShow?.time || 'TBD',
      screen: selectedShow?.screen || 'TBD',
      format: selectedShow?.format || selectedMovie.formats[0],
      totalAmount: total,
      status: 'Confirmed',
      paymentMethod,
      customerDetails,
      createdAt: new Date().toISOString()
    };

    setBookingDetails(booking);
    
    const existingBookings = JSON.parse(localStorage.getItem('pvr_bookings') || '[]');
    existingBookings.unshift(booking);
    localStorage.setItem('pvr_bookings', JSON.stringify(existingBookings));

    return booking;
  };

  const getBookings = () => {
    return JSON.parse(localStorage.getItem('pvr_bookings') || '[]');
  };

  const resetBooking = () => {
    setSelectedMovie(null);
    setSelectedShow(null);
    setSelectedSeats([]);
    setBookingDetails(null);
  };

  const value = {
    selectedMovie,
    selectedShow,
    selectedSeats,
    bookingDetails,
    selectMovie,
    selectShow,
    toggleSeat,
    clearSeats,
    createBooking,
    getBookings,
    resetBooking
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};