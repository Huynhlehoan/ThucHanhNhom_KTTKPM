import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar.jsx';
import { movies } from '../data/mockData.js';

const HomePage = () => {
  const navigate = useNavigate();
  const featuredMovies = movies.slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Trang chủ - PVR Cinema</title>
        <meta name="description" content="Trải nghiệm điện ảnh đỉnh cao tại PVR Cinema" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1694705268819-80fcf37e35ac" 
                alt="Cinema Theater" 
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight"
              >
                Trải nghiệm điện ảnh <span className="text-primary">đỉnh cao</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              >
                Hệ thống rạp chiếu phim hiện đại nhất với âm thanh sống động và hình ảnh sắc nét. Đặt vé ngay hôm nay để không bỏ lỡ những siêu phẩm điện ảnh.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/movies')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full"
                >
                  Đặt vé ngay
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Featured Movies */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Phim Đang Chiếu</h2>
                <p className="text-muted-foreground">Những tác phẩm điện ảnh hot nhất hiện nay</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/movies')} className="text-primary hover:text-primary/80">
                Xem tất cả &rarr;
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/booking/${movie.id}`)}
                >
                  <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 text-foreground line-clamp-1">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{movie.genre}</p>
                      <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                        Đặt vé
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default HomePage;