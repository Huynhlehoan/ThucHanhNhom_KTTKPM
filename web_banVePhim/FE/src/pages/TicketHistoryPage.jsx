import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { Button } from '../components/ui/button';

const GATEWAY_URL = 'http://localhost:8080';

const TicketHistoryPage = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // GỌI API LẤY LỊCH SỬ ĐẶT VÉ
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${GATEWAY_URL}/api/bookings`);
        if (response.ok) {
          const data = await response.json();
          // Map data từ Backend cho khớp với table UI
          const formattedData = data.map(b => ({
            id: b.id,
            movieTitle: `Phim ID: ${b.movieId}`, // Đồ án nếu không map chéo DB thì hiển thị tạm ID phim
            seats: ['Ghế tiêu chuẩn'], 
            date: new Date().toLocaleDateString(),
            time: 'N/A',
            totalAmount: b.amount,
            status: b.status === "PENDING" ? "Đang xử lý" : 
                    b.status === "CONFIRMED" ? "Đã xác nhận" : "Đã hủy"
          }));
          setAllBookings(formattedData);
        }
      } catch (error) {
        console.error("Chưa có API Get All Bookings hoặc lỗi mạng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Đã xác nhận': return 'bg-green-500/10 text-green-500';
      case 'Đã hủy': return 'bg-destructive/10 text-destructive';
      case 'Đang xử lý': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Helmet>
        <title>Lịch sử vé - PVR Cinema</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-foreground mb-8">Lịch sử đặt vé</h1>

          {loading ? (
             <p className="text-center text-muted-foreground">Đang tải dữ liệu...</p>
          ) : allBookings.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Bạn chưa có lịch sử đặt vé nào.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="p-4 font-medium text-muted-foreground">Mã đơn</th>
                      <th className="p-4 font-medium text-muted-foreground">Phim</th>
                      <th className="p-4 font-medium text-muted-foreground">Ngày/Giờ</th>
                      <th className="p-4 font-medium text-muted-foreground">Giá</th>
                      <th className="p-4 font-medium text-muted-foreground">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((booking, index) => (
                      <motion.tr 
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4 font-mono text-sm text-foreground">{booking.id.split('-')[0]}...</td>
                        <td className="p-4 font-medium text-foreground">{booking.movieTitle}</td>
                        <td className="p-4 text-muted-foreground text-sm">{booking.date}</td>
                        <td className="p-4 font-medium text-foreground">{booking.totalAmount.toLocaleString()}đ</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default TicketHistoryPage;