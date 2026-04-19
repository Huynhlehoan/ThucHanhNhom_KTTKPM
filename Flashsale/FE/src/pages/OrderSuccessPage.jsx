import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Package, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { toast } from 'sonner';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/');
      return;
    }
    
    toast.success('Đặt hàng thành công');
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 14);
  const formattedDeliveryDate = estimatedDeliveryDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <Helmet>
        <title>Đặt hàng thành công - MegaSale Store</title>
        <meta name="description" content="Đơn hàng của bạn đã được đặt thành công. Cảm ơn bạn đã mua sắm tại MegaSale." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-gradient-to-b from-success-light to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-success/10 rounded-full mb-6 animate-scale-in">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{letterSpacing: '-0.02em'}}
              >
                Đặt hàng thành công              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground mb-2"
              >
                Cảm ơn bạn đã mua hàng
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground"
              >
                Mã đơn hàng: <span className="font-mono font-semibold text-foreground">{orderData.orderId}</span>
              </motion.p>
            </motion.div>

            {/* Order Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-6 space-y-6"
            >
              {/* Estimated Delivery */}
              <div className="flex items-start gap-4 bg-success-light rounded-xl p-4">
                <Calendar className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-success mb-1">Dự kiến giao hàng</h3>
                  <p className="text-sm text-muted-foreground">{formattedDeliveryDate}</p>
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                      </div>
                      <p className="font-semibold tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-semibold tabular-nums">
                      ${orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-semibold tabular-nums">
                      {orderData.total >= 50 ? 'Miễn phí' : '$9.99'}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">
                    ${orderData.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Họ tên</p>
                      <p className="font-medium">{orderData.customer.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="font-medium">{orderData.customer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Điện thoại</p>
                      <p className="font-medium">{orderData.customer.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Địa chỉ giao hàng</p>
                      <p className="font-medium">
                        {orderData.shipping.address}, {orderData.shipping.city}, {orderData.shipping.district} {orderData.shipping.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Confirmation Message */}
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Chúng tôi đã gửi email xác nhận đến <span className="font-semibold text-foreground">{orderData.customer.email}</span> với thông tin đơn hàng và theo dõi vận chuyển.
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto rounded-xl font-semibold transition-all active:scale-[0.98]">
                  Tiếp tục mua sắm
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto rounded-xl font-semibold transition-all active:scale-[0.98]"
                onClick={() => window.print()}
              >
                Xem chi tiết đơn hàng
              </Button>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OrderSuccessPage;