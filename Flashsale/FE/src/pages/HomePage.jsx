import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Truck, CreditCard } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import CountdownTimer from '@/components/CountdownTimer.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { getProducts as puGetProducts } from '@/lib/api.js';
import { getProducts as mockGetProducts } from '@/lib/mockApi.js';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const saleEndTime = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response;
        try {
          // Gọi PU1 — Product Processing Unit (Data Grid / Redis)
          response = await puGetProducts();
          // PU1 có thể trả về mảng trực tiếp hoặc { data: [...] }
          const list = Array.isArray(response) ? response : (response.data || response.products || []);
          setProducts(list.slice(0, 4));
        } catch {
          // Fallback mock khi PU1 chưa online
          response = await mockGetProducts();
          setProducts(response.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Helmet>
        <title>MegaSale - Flash Sale thiết bị công nghệ giá tốt</title>
        <meta name="description" content="Mua sắm các ưu đãi Flash Sale tốt nhất trên thiết bị điện tử và công nghệ cao cấp. Ưu đãi có thời hạn với mức giảm đến 31%. Miễn phí vận chuyển cho đơn hàng trên $50." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1641803216631-47d43eb4f35e)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(2px)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Flash Sale đang diễn ra
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6" style={{letterSpacing: '-0.02em'}}>
                  Sản phẩm công nghệ với{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    giá không thể tốt hơn
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  Ưu đãi có thời hạn trên các thiết bị điện tử mới nhất. Tiết kiệm đến 31% với miễn phí vận chuyển cho đơn hàng trên $50.
                </p>

                <div className="bg-accent rounded-2xl p-6 mb-8 inline-block">
                  <div className="text-sm font-medium text-accent-foreground mb-2">
                    Kết thúc sau
                  </div>
                  <CountdownTimer endTime={saleEndTime} />
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link to="/products">
                    <Button size="lg" className="rounded-xl font-semibold text-base px-8 transition-all active:scale-[0.98]">
                      Mua ngay
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{letterSpacing: '-0.02em'}}>
                  Ưu đãi nổi bật
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Sản phẩm được chọn lọc với mức giảm giá lớn nhất. Mua ngay trước khi hết hàng.
                </p>
              </div>

              {loading ? (
                <LoadingSpinner type="products" count={4} />
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {products.map((product) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div className="text-center mt-12">
                <Link to="/products">
                  <Button variant="outline" size="lg" className="rounded-xl font-semibold transition-all active:scale-[0.98]">
                    Xem tất cả sản phẩm
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Truck,
                    title: 'Miễn phí vận chuyển',
                    description: 'Cho đơn hàng trên $50'
                  },
                  {
                    icon: Shield,
                    title: 'Bảo hành 1 năm',
                    description: 'Cho tất cả thiết bị điện tử'
                  },
                  {
                    icon: CreditCard,
                    title: 'Thanh toán an toàn',
                    description: 'Nhiều phương thức thanh toán'
                  },
                  {
                    icon: Zap,
                    title: 'Ưu đãi Flash',
                    description: 'Ưu đãi mới mỗi ngày'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;