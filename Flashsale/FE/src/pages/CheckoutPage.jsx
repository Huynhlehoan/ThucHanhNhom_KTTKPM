import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Wallet, Banknote } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { checkout as puCheckout } from '@/lib/api.js';
import { createOrder, saveOrder } from '@/lib/mockApi.js'; // fallback
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    paymentMethod: 'credit-card'
  });

  const [errors, setErrors] = useState({});

  // Tự điền thông tin: ưu tiên thông tin giao hàng đã lưu, sau đó dùng profile
  useEffect(() => {
    const savedShipping = (() => {
      try { return JSON.parse(localStorage.getItem('megasale_shipping') || 'null'); } catch { return null; }
    })();

    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name:       savedShipping?.name       || currentUser.name || currentUser.fullName || '',
        email:      currentUser.email         || '',
        phone:      savedShipping?.phone      || currentUser.phone || '',
        address:    savedShipping?.address    || currentUser.address || '',
        city:       savedShipping?.city       || currentUser.city || '',
        district:   savedShipping?.district   || currentUser.district || '',
        postalCode: savedShipping?.postalCode || currentUser.postalCode || '',
      }));
    } else if (savedShipping) {
      // Chưa đăng nhập nhưng đã từng mua hàng → vẫn điền lại
      setFormData(prev => ({ ...prev, ...savedShipping }));
    }
  }, [currentUser]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Họ tên là bắt buộc';
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc';
    if (!formData.city.trim()) newErrors.city = 'Thành phố là bắt buộc';
    if (!formData.district.trim()) newErrors.district = 'Quận/Huyện là bắt buộc';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Mã bưu chính là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (cart.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    setLoading(true);

    try {
      const subtotal = getCartTotal();
      const shippingFee = subtotal >= 50 ? 0 : 9.99;
      const total = subtotal + shippingFee;

      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode
        },
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.flashPrice ?? item.price
        })),
        paymentMethod: formData.paymentMethod,
        total: total
      };

      let response;
      try {
        // Gọi PU3 — Order Processing Unit (Space-Based)
        response = await puCheckout(orderData);
        // PU3 trả về { orderId, estimatedDelivery, ... }
        response = { success: true, data: response };
      } catch (puErr) {
        // Kiểm tra lỗi hết hàng (409 từ PU3)
        if (puErr.message?.includes('Insufficient stock') || puErr.message?.includes('stock')) {
          toast.error(`Hết hàng: ${puErr.message}`, { duration: 6000 });
          setLoading(false);
          return;
        }
        console.warn('PU3 unavailable, falling back to mock:', puErr.message);
        response = await createOrder(orderData);
      }

      if (response.success) {
        // Lưu thông tin giao hàng để lần sau tự điền
        localStorage.setItem('megasale_shipping', JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
        }));

        clearCart();
        navigate('/order-success', {
          state: {
            orderData: {
              orderId: response.data.orderId,
              customer: orderData.customer,
              shipping: orderData.shipping,
              items: orderData.items,
              total: orderData.total,
              estimatedDelivery: response.data.estimatedDelivery
            }
          }
        });
      } else {
        navigate('/order-failed', {
          state: {
            errorData: {
              message: response.error || 'Xử lý thanh toán thất bại',
              items: orderData.items,
              total: orderData.total
            }
          }
        });
      }
    } catch (error) {
      console.error('Order failed:', error);
      
      // Navigate to failure page with error details
      navigate('/order-failed', {
        state: {
          errorData: {
            message: error.message || 'Đã xảy ra lỗi không mong muốn khi xử lý đơn hàng của bạn',
            items: cart.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.flashPrice
            })),
            total: getCartTotal() + (getCartTotal() >= 50 ? 0 : 9.99)
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <>
        <Helmet>
          <title>Thanh toán - MegaSale Store</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <h1 className="text-4xl font-bold mb-4">Giỏ hàng của bạn đang trống</h1>
              <p className="text-muted-foreground mb-8">
                Hãy thêm sản phẩm trước khi thanh toán.
              </p>
              <Link to="/products">
                <Button size="lg" className="rounded-xl font-semibold">
                  Xem sản phẩm
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
        <title>Thanh toán - MegaSale Store</title>
        <meta name="description" content="Hoàn tất mua hàng an toàn. Nhiều phương thức thanh toán." />
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
                  <BreadcrumbLink href="/cart">Giỏ hàng</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Thanh toán</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-4xl font-bold mb-8" style={{letterSpacing: '-0.02em'}}>
              Thanh toán
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forms */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Customer Information */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Thông tin khách hàng</h2>
                      {currentUser && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                          ✓ Tự điền từ tài khoản
                        </span>
                      )}
                    </div>
                    <Separator />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="rounded-xl text-foreground"
                          placeholder="Maya Chen"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="rounded-xl text-foreground"
                          placeholder="maya@example.com"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="rounded-xl text-foreground"
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
                      {localStorage.getItem('megasale_shipping') && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                          ✓ Địa chỉ đã lưu
                        </span>
                      )}
                    </div>
                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="rounded-xl text-foreground"
                        placeholder="456 Market Street"
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Thành phố *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="rounded-xl text-foreground"
                          placeholder="San Francisco"
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive">{errors.city}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Input
                          id="district"
                          value={formData.district}
                          onChange={(e) => handleChange('district', e.target.value)}
                          className="rounded-xl text-foreground"
                          placeholder="CA"
                        />
                        {errors.district && (
                          <p className="text-sm text-destructive">{errors.district}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Mã bưu chính *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleChange('postalCode', e.target.value)}
                          className="rounded-xl text-foreground"
                          placeholder="94102"
                        />
                        {errors.postalCode && (
                          <p className="text-sm text-destructive">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                    <Separator />

                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleChange('paymentMethod', value)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 border border-border rounded-xl p-4 hover:bg-accent transition-colors cursor-pointer">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex items-center gap-3 cursor-pointer flex-1">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Thẻ tín dụng</div>
                            <div className="text-sm text-muted-foreground">Thanh toán an toàn bằng thẻ tín dụng</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border border-border rounded-xl p-4 hover:bg-accent transition-colors cursor-pointer">
                        <RadioGroupItem value="e-wallet" id="e-wallet" />
                        <Label htmlFor="e-wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Wallet className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Ví điện tử</div>
                            <div className="text-sm text-muted-foreground">MoMo, ZaloPay, VNPay</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 border border-border rounded-xl p-4 hover:bg-accent transition-colors cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Banknote className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Thanh toán khi nhận hàng</div>
                            <div className="text-sm text-muted-foreground">Thanh toán khi nhận hàng</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
                      <Separator />

                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg bg-muted flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                              <p className="text-sm font-semibold tabular-nums">${(item.flashPrice * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tạm tính</span>
                          <span className="font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Vận chuyển</span>
                          <span className="font-semibold tabular-nums">
                            {shippingFee === 0 ? 'Miễn phí' : `$${shippingFee.toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-semibold">Tổng cộng</span>
                        <span className="text-2xl font-bold text-primary tabular-nums">
                          ${total.toFixed(2)}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="w-full rounded-xl font-semibold transition-all active:scale-[0.98]"
                      >
                        {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                      </Button>

                      <Alert>
                        <AlertDescription className="text-sm text-muted-foreground">
                          Khi đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;