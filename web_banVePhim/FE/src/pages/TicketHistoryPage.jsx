import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { bookings as mockBookings } from '../data/mockData.js';
import { Button } from '../components/ui/button';

const TicketHistoryPage = () => {
  const { getBookings } = useBooking();
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    const userBookings = getBookings();
    const combined = [...userBookings, ...mockBookings];
    setAllBookings(combined);
  }, [getBookings]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Đã xác nhận': return 'bg-green-500/10 text-green-500';
      case 'Đã hủy': return 'bg-destructive/10 text-destructive';
      case 'Sắp diễn ra': return 'bg-primary/10 text-primary';
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

          {allBookings.length === 0 ? (
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
                      <th className="p-4 font-medium text-muted-foreground">Ghế</th>
                      <th className="p-4 font-medium text-muted-foreground">Ngày/Giờ</th>
                      <th className="p-4 font-medium text-muted-foreground">Giá</th>
                      <th className="p-4 font-medium text-muted-foreground">Trạng thái</th>
                      <th className="p-4 font-medium text-muted-foreground text-right">Thao tác</th>
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
                        <td className="p-4 font-mono text-sm text-foreground">{booking.id}</td>
                        <td className="p-4 font-medium text-foreground">{booking.movieTitle}</td>
                        <td className="p-4 text-primary font-medium">{booking.seats.join(', ')}</td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {booking.date} <br/> {booking.time}
                        </td>
                        <td className="p-4 font-medium text-foreground">${booking.totalAmount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            Xem chi tiết
                          </Button>
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