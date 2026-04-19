import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar.jsx';
import { useBooking } from '../context/BookingContext.jsx';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

const MovieListPage = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { selectMovie } = useBooking();

  const tabs = ['Tất cả', 'Hollywood', 'Bollywood', 'Khác'];

  // GỌI API LẤY DANH SÁCH PHIM TỪ BACKEND
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${GATEWAY_URL}/api/movies`);
        if (response.ok) {
          const data = await response.json();
          // Xử lý chuỗi formats từ DB (VD: "2D, 3D") thành mảng ["2D", "3D"] để UI render được
          const formattedMovies = data.map(m => ({
            ...m,
            formats: m.formats ? m.formats.split(',').map(f => f.trim()) : ['2D']
          }));
          setMovies(formattedMovies);
        }
      } catch (error) {
        console.error("Lỗi tải phim:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const matchesTab = activeTab === 'Tất cả' || movie.genre === activeTab;
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleBook = (movie) => {
    selectMovie(movie);
    navigate(`/booking/${movie.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Danh sách phim - PVR Cinema</title>
        <meta name="description" content="Danh sách các bộ phim đang chiếu tại PVR Cinema" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-foreground">Phim Đang Chiếu</h1>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Đang tải danh sách phim từ Server...</div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Không tìm thấy phim nào phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full">
                    <div className="aspect-[2/3] overflow-hidden relative">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-white">{movie.rating}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-1">
                        {movie.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span>{movie.showsPerDay} suất/ngày</span>
                        <span>{movie.duration}</span>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-4">
                        {movie.formats && movie.formats.map((format) => (
                          <span
                            key={format}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md"
                          >
                            {format}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <Button 
                          onClick={() => handleBook(movie)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Đặt vé
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MovieListPage;