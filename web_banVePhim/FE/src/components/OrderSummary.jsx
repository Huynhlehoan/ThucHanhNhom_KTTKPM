import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Wallet, Banknote } from 'lucide-react';

const OrderSummary = ({ orderId, selectedSeats, onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const discount = 0;
  const tax = subtotal * 0.18;
  const total = subtotal - discount + tax;

  const handleComplete = () => {
    if (selectedSeats.length === 0) return;
    
    onComplete({
      paymentMethod,
      customerName: customerName || 'Khách',
      customerContact: customerContact || 'N/A'
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Tóm tắt đơn hàng</h3>
        <p className="text-sm text-muted-foreground">Mã đơn: {orderId}</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Ghế đã chọn</h4>
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa chọn ghế nào</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <div
                key={`${seat.row}${seat.number}`}
                className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                {seat.row}{seat.number}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tạm tính</span>
          <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Giảm giá</span>
          <span className="font-medium text-foreground">-${discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Thuế (18%)</span>
          <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span className="text-foreground">Tổng cộng</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="font-medium text-foreground">Phương thức thanh toán</h4>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
              <Banknote className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Tiền mặt</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
              <Wallet className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Chuyển khoản (UPI)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Thẻ tín dụng/Ghi nợ</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="font-medium text-foreground">Thông tin khách hàng (Tùy chọn)</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-foreground">Họ tên</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập họ tên của bạn"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label htmlFor="contact" className="text-foreground">Số điện thoại</Label>
            <Input
              id="contact"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleComplete}
        disabled={selectedSeats.length === 0}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 active:scale-[0.98]"
      >
        Xác nhận đặt vé
      </Button>
    </div>
  );
};

export default OrderSummary;