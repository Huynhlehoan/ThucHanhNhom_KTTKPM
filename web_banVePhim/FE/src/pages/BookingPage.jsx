import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { toast } from 'sonner';

const GATEWAY_URL = 'http://localhost:8080';

const BookingPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { selectedSeats, toggleSeat } = useBooking();
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [seats, setSeats] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 1. LẤY CHI TIẾT PHIM VÀ LỊCH CHIẾU
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy thông tin phim
        const movieRes = await fetch(`${GATEWAY_URL}/api/movies/${movieId}`);
        if (!movieRes.ok) throw new Error("Không tìm thấy phim");
        const movieData = await movieRes.json();
        setSelectedMovie(movieData);

        // Lấy lịch chiếu của phim này
        const showsRes = await fetch(`${GATEWAY_URL}/api/movies/${movieId}/shows`);
        if (showsRes.ok) {
          const showsData = await showsRes.json();
          setShows(showsData);
          
          if (showsData.length > 0) {
            fetchSeats(showsData[0].id);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi tải dữ liệu phim.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  // 2. HÀM LẤY SƠ ĐỒ GHẾ
  const fetchSeats = async (showId) => {
    try {
      const res = await fetch(`${GATEWAY_URL}/api/movies/shows/${showId}/seats`);
      if (res.ok) {
        const seatsData = await res.json();
        const formattedSeats = seatsData.map(s => ({
          ...s,
          row: s.rowName,
          number: s.seatNumber
        }));
        setSeats(formattedSeats);
      }
    } catch (e) {
      console.error("Lỗi lấy ghế:", e);
    }
  };

  const selectedShow = shows[0];

// 3. GỬI API ĐẶT VÉ 
  const handleCompleteBooking = async (details) => {
    if (selectedSeats.length === 0) {
      return toast.error("Vui lòng chọn ít nhất 1 ghế!");
    }

    try {
      const userId = details.customerName || "guest_user";
      
      const apiUrl = `${GATEWAY_URL}/api/bookings`;

      // Phải có headers Content-Type và body JSON.stringify
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Báo cho Java biết đây là JSON
        },
        body: JSON.stringify({ 
          userId: userId, 
          movieId: movieId.toString() 
        }) // Gói hàng JSON gửi đi
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success('Đặt vé thành công!');

        // Đóng gói dữ liệu chuẩn để trang Confirmation hiển thị được
        const finalBooking = {
          id: data.id || data.bookingId, 
          movieTitle: selectedMovie.title,
          seats: selectedSeats.map(s => `${s.row}${s.number}`),
          date: new Date().toLocaleDateString('vi-VN'),
          time: selectedShow?.time || 'N/A',
          screen: selectedShow?.screen || 'N/A',
          format: selectedShow?.format || '2D',
          totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
        };
        
        navigate('/confirmation', { state: { booking: finalBooking } });
      } else {
        const errorText = await res.text();
        console.error("Server Error:", errorText);
        toast.error('Lỗi server khi tạo đơn hàng. Backend báo lỗi!');
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error('Lỗi kết nối máy chủ!');
    }
  };

  if (loading || !selectedMovie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang tải phòng chiếu...</p>
      </div>
    );
  }

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
            className="mb-6 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Phim */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
              <div className="bg-card rounded-xl border p-6 sticky top-24">
                <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-full rounded-lg mb-4"/>
                <h2 className="text-xl font-bold mb-2">{selectedMovie.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>{selectedMovie.rating}</span>
                </div>

                {selectedShow && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /> <span>{selectedShow.time}</span></div>
                    <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4" /> <span>{selectedShow.screen}</span></div>
                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs inline-block rounded">{selectedShow.format}</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Ghế */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-6">
              <div className="bg-card rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-6">Chọn ghế</h3>
                {seats.length > 0 ? (
                  <SeatGrid seats={seats} selectedSeats={selectedSeats} onSeatClick={toggleSeat} />
                ) : (
                  <div className="text-center py-10 text-muted-foreground">Đang tải ghế...</div>
                )}
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
              <div className="sticky top-24">
                <OrderSummary orderId={"New Order"} selectedSeats={selectedSeats} onComplete={handleCompleteBooking} />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default BookingPage;