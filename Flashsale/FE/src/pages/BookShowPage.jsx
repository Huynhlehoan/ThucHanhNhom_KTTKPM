import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import Sidebar from '../components/Sidebar.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { toast } from 'sonner';

const BookShowPage = () => {
  const navigate = useNavigate();
  const { selectedMovie, selectedSeats, toggleSeat, createBooking } = useBooking();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderId] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // State mới để lưu dữ liệu từ API
  const [currentShow, setCurrentShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedMovie) {
      navigate('/');
      return;
    }

    const loadShowAndSeats = async () => {
      try {
        setLoading(true);
        // 1. Lấy danh sách suất chiếu của phim từ Movie Service
        const showRes = await fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/movies/${selectedMovie.id}/shows`);
        const showData = await showRes.json();
        setShows(showData);
        
        // Auto select first show and fetch seats
        if (showData.length > 0) {
          const firstShow = showData[0];
          setCurrentShow(firstShow);
          
          const seatRes = await fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/movies/shows/${firstShow.id}/seats`);
          const seatsData = await seatRes.json();
          setSeats(seatsData);
        } else {
          toast.error("Phim này hiện chưa có lịch chiếu!");
        }
      } catch (error) {
        console.error("Lỗi API:", error);
        toast.error("Không thể kết nối đến máy chủ lấy dữ liệu ghế");
      } finally {
        setLoading(false);
      }
    };

    loadShowAndSeats();
  }, [selectedMovie, navigate]);

  if (!selectedMovie) return null;

  const handleCompleteBooking = (details) => {
    // Gọi hàm tạo booking (Nhớ truyền currentShow.id vào đây nếu cần lưu vào DB)
    createBooking(details.paymentMethod, {
      name: details.customerName,
      contact: details.customerContact,
      showId: currentShow?.id
    });
    
    toast.success('Đặt vé thành công!');
    navigate('/ticket-history');
  };

  return (
    <>
      <Helmet>
        <title>{`Đặt vé ${selectedMovie.title} - PVR Cinema`}</title>
      </Helmet>

      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cột 1: Thông tin phim */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
                <div className="bg-card rounded-xl border p-6 sticky top-6">
                  <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-full rounded-lg mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span>{selectedMovie.rating}</span>
                  </div>
                  
                  {currentShow && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" /> <span>{currentShow.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" /> <span>{currentShow.screen}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Cột 2: Sơ đồ ghế */}
              <motion.div className="lg:col-span-6">
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="text-xl font-semibold mb-6">Chọn vị trí ghế</h3>
                  {loading ? (
                    <div className="flex flex-col items-center py-20">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <p className="mt-4 text-muted-foreground">Đang tải sơ đồ ghế...</p>
                    </div>
                  ) : (
                    <SeatGrid
                      seats={seats} // Dữ liệu ghế từ API
                      selectedSeats={selectedSeats}
                      onSeatClick={toggleSeat}
                    />
                  )}
                </div>
              </motion.div>

              {/* Cột 3: Tổng tiền */}
              <motion.div className="lg:col-span-3">
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