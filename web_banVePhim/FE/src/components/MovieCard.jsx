import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext.jsx';

const MovieCard = ({ movie, index }) => {
  const navigate = useNavigate();
  const { selectMovie } = useBooking();

  const handleClick = () => {
    selectMovie(movie);
    navigate('/book-show');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={handleClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-white">{movie.rating}</span>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-1">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>{movie.showsPerDay} shows/day</span>
            <span>{movie.duration}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {movie.formats.map((format) => (
              <span
                key={format}
                className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;