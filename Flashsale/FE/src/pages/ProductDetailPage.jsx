import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Minus, Plus, ShoppingCart, Package, Shield, Truck } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import CountdownTimer from '@/components/CountdownTimer.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { getProductById as puGetProduct, getStock } from '@/lib/api.js';
import { getProductById as mockGetProduct, getRelatedProducts } from '@/lib/mockApi.js';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [liveStock, setLiveStock] = useState(null); // real-time từ PU4

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi PU1 — Product PU
        let productData;
        try {
          const raw = await puGetProduct(id);
          productData = raw.data || raw;
        } catch {
          const res = await mockGetProduct(id);
          productData = res.data;
        }
        setProduct(productData);

        // Gọi PU4 — Inventory PU để lấy stock real-time
        try {
          const stockRes = await getStock(id);
          setLiveStock(stockRes.stock ?? stockRes.quantity ?? stockRes);
        } catch {
          setLiveStock(null);
        }

        // Related products
        const relatedRes = await getRelatedProducts(id, 4);
        setRelatedProducts(relatedRes.data || []);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // ── Polling stock real-time mỗi 3 giây (demo multi-machine) ──────────────
  useEffect(() => {
    if (!product) return;
    const interval = setInterval(async () => {
      try {
        const stockRes = await getStock(id);
        const newStock = stockRes.stock ?? stockRes.quantity ?? stockRes;
        setLiveStock(prev => {
          // Nếu stock vừa về 0 → thông báo hết hàng
          if (prev > 0 && newStock === 0) {
            toast.error('Sản phẩm vừa hết hàng!', { duration: 5000 });
          }
          return newStock;
        });
      } catch {
        // BE offline → giữ nguyên giá trị cũ
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/signin', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    const stock = liveStock ?? product.stock;

    if (stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    if (quantity > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm`);
      return;
    }

    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const incrementQuantity = () => {
    const stock = liveStock ?? product?.stock ?? 0;
    if (product && quantity < stock) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Đang tải... - MegaSale Store</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <LoadingSpinner type="product-detail" />
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Không tìm thấy sản phẩm - MegaSale Store</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <h1 className="text-4xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
              <p className="text-muted-foreground mb-8">
                Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.
              </p>
              <Link to="/products">
                <Button className="rounded-xl">
                  Xem tất cả sản phẩm
                </Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product.name} - MegaSale Store`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
            >
              {/* Image */}
              <div className="relative">
                <div className="sticky top-24">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.discount > 0 && (
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-bold text-lg px-4 py-2">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="rounded-lg">
                      {({
                        'Wearables': 'Đồng hồ thông minh',
                        'Audio': 'Âm thanh',
                        'Computers': 'Máy tính',
                        'Mobile': 'Điện thoại',
                        'Displays': 'Màn hình',
                        'Accessories': 'Phụ kiện',
                      })[product.category] || product.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({Math.floor(Math.random() * 400) + 100} đánh giá)
                      </span>
                    </div>
                  </div>

                  <h1 className="text-4xl font-bold leading-tight mb-4" style={{letterSpacing: '-0.02em'}}>
                    {product.name}
                  </h1>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="rounded-lg">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="bg-accent rounded-2xl p-6 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      ${product.flashPrice.toFixed(2)}
                    </span>
                    {product.originalPrice !== product.flashPrice && (
                      <span className="text-xl text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-accent-foreground mb-2">
                      Flash sale kết thúc sau
                    </div>
                    <CountdownTimer endTime={product.saleEndTime} />
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  {(() => {
                    const stock = liveStock ?? product.stock;
                    return (
                      <span className={`font-medium ${stock < 20 ? 'text-destructive' : 'text-foreground'}`}>
                        {stock === 0 ? 'Hết hàng' : `${stock} sản phẩm còn lại`}
                        {liveStock !== null && (
                          <span className="ml-2 text-xs text-muted-foreground">(live)</span>
                        )}
                      </span>
                    );
                  })()}
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Số lượng</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="rounded-xl transition-all active:scale-[0.98]"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg tabular-nums">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= (liveStock ?? product.stock)}
                      className="rounded-xl transition-all active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart */}
                <Button 
                  onClick={handleAddToCart}
                  disabled={(liveStock ?? product.stock) === 0}
                  size="lg"
                  className="w-full rounded-xl font-semibold text-lg py-6 transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ
                </Button>

                {/* Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Miễn phí vận chuyển</div>
                      <div className="text-xs text-muted-foreground">Cho đơn hàng trên $50</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Bảo hành 1 năm</div>
                      <div className="text-xs text-muted-foreground">Bảo hành toàn diện</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Đổi trả dễ dàng</div>
                      <div className="text-xs text-muted-foreground">Chính sách 30 ngày</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-8" style={{letterSpacing: '-0.02em'}}>
                  Sản phẩm liên quan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetailPage;