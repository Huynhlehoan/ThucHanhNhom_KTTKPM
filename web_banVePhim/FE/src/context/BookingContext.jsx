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

  // Lưu lại phim người dùng vừa chọn và xóa ghế cũ đi
  const selectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedSeats([]);
  };

  // Lưu lại suất chiếu người dùng chọn
  const selectShow = (show) => {
    setSelectedShow(show);
  };

  // Xử lý logic chọn/bỏ chọn ghế trên sơ đồ
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

  const resetBooking = () => {
    setSelectedMovie(null);
    setSelectedShow(null);
    setSelectedSeats([]);
  };

  const value = {
    selectedMovie,
    selectedShow,
    selectedSeats,
    selectMovie,
    selectShow,
    toggleSeat,
    clearSeats,
    resetBooking
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};