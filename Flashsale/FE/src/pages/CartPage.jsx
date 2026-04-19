import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import { toast } from 'sonner';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemove(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    toast.success('Đã xóa khỏi giỏ hàng');
  };

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal + shippingFee;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <>
      <Helmet>
        <title>{`Giỏ hàng (${cart.length}) - MegaSale Store`}</title>
        <meta name="description" content="Xem lại giỏ hàng và tiến hành thanh toán. Miễn phí vận chuyển cho đơn hàng trên $50." />
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
                  <BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-4xl font-bold mb-8" style={{letterSpacing: '-0.02em'}}>
              Giỏ hàng
            </h1>

            {cart.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Giỏ hàng trống</h2>
                <p className="text-muted-foreground mb-8">
                  Hãy thêm sản phẩm để bắt đầu mua sắm.
                </p>
                <Link to="/products">
                  <Button size="lg" className="rounded-xl font-semibold transition-all active:scale-[0.98]">
                    Xem sản phẩm
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="bg-card border border-border rounded-2xl p-4 sm:p-6"
                      >
                        <div className="flex gap-4">
                          <Link to={`/products/${item.id}`} className="flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl bg-muted"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link to={`/products/${item.id}`}>
                              <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>

                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="text-xl font-bold text-primary">
                                ${item.flashPrice.toFixed(2)}
                              </span>
                              {item.originalPrice !== item.flashPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="h-8 w-8 rounded-lg transition-all active:scale-[0.98]"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold tabular-nums">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="h-8 w-8 rounded-lg transition-all active:scale-[0.98]"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(item.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all active:scale-[0.98]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tạm tính ({cart.length} {cart.length === 1 ? 'sản phẩm' : 'sản phẩm'})</span>
                          <span className="font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Vận chuyển</span>
                          <span className="font-semibold tabular-nums">
                            {shippingFee === 0 ? 'Miễn phí' : `$${shippingFee.toFixed(2)}`}
                          </span>
                        </div>
                        {subtotal < 50 && subtotal > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Thêm ${(50 - subtotal).toFixed(2)} để được miễn phí vận chuyển
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-semibold">Tổng cộng</span>
                        <span className="text-2xl font-bold text-primary tabular-nums">
                          ${total.toFixed(2)}
                        </span>
                      </div>

                      <Link to="/checkout">
                        <Button size="lg" className="w-full rounded-xl font-semibold transition-all active:scale-[0.98]">
                          Tiến hành thanh toán
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>

                      <Link to="/products">
                        <Button variant="outline" size="lg" className="w-full rounded-xl font-semibold transition-all active:scale-[0.98]">
                          Tiếp tục mua sắm
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CartPage;