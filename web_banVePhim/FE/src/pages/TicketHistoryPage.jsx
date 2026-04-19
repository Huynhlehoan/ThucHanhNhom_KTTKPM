import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

const TicketHistoryPage = () => {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // Nếu user.id chưa có, có thể do chưa login lại
      if (!user || !user.id || user.id === "undefined") {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching history for user:", user.id);
        const response = await fetch(`${GATEWAY_URL}/api/bookings?userId=${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(b => ({
            id: b.id,
            movieTitle: `Phim ID: ${b.movieId}`,
            seats: ['Ghế tiêu chuẩn'],
            date: new Date().toLocaleDateString(),
            time: 'N/A',
            totalAmount: b.amount,
            status: b.status === "PENDING" ? "Đang xử lý" : 
                    b.status === "CONFIRMED" ? "Đã xác nhận" : "Đã hủy"
          }));
          setAllBookings(formattedData);
        } else {
          const errorData = await response.text();
          toast.error("Lỗi lấy lịch sử: " + errorData);
        }
      } catch (error) {
        console.error("Lỗi fetch:", error);
        toast.error("Không thể kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

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
          
          {!user || !user.id || user.id === "undefined" ? (
            <div className="text-center py-10 bg-yellow-500/10 border border-yellow-500 rounded-xl">
               <p className="text-yellow-600">Bạn cần đăng xuất và đăng nhập lại để đồng bộ ID tài khoản.</p>
               <Button className="mt-4" onClick={() => window.location.href='/login'}>Đến trang Đăng nhập</Button>
            </div>
          ) : loading ? (
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