import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle2, Printer, Home, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar.jsx';

const TicketConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Xác nhận vé - PVR Cinema</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8 no-print">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Đặt vé thành công!</h1>
              <p className="text-muted-foreground">Cảm ơn bạn đã chọn PVR Cinema. Dưới đây là thông tin vé của bạn.</p>
            </div>

            {/* Printable Ticket Area */}
            <div id="printable-ticket" className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
              <div className="bg-primary p-6 text-primary-foreground flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">PVR Cinema</h2>
                  <p className="opacity-90 text-sm">Vé xem phim điện tử</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Mã đơn hàng</p>
                  <p className="font-mono font-bold text-lg">{booking.id}</p>
                </div>
              </div>

              <div className="p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tên phim</p>
                    <h3 className="text-2xl font-bold text-foreground">{booking.movieTitle}</h3>
                    <span className="inline-block mt-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">
                      {booking.format}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-4 h-4"/> Ngày</p>
                      <p className="font-medium text-foreground">{booking.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-4 h-4"/> Giờ</p>
                      <p className="font-medium text-foreground">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-4 h-4"/> Phòng chiếu</p>
                      <p className="font-medium text-foreground">{booking.screen}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Ticket className="w-4 h-4"/> Ghế</p>
                      <p className="font-medium text-primary text-lg">{booking.seats.join(', ')}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Tổng thanh toán</p>
                      <p className="text-2xl font-bold text-foreground">${booking.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
                  <div className="w-32 h-32 bg-white p-2 rounded-lg mb-4">
                    {/* Fake QR Code using a generic image or CSS pattern */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`} 
                      alt="QR Code" 
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Quét mã này tại cổng rạp</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center no-print">
              <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                In vé
              </Button>
              <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                <Home className="w-4 h-4" />
                Quay lại trang chủ
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default TicketConfirmationPage;