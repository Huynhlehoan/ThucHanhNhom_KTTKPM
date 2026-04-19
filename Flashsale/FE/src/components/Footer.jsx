import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted text-muted-foreground border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-2">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MegaSale
                </span>
                <span className="text-lg font-bold text-foreground ml-1">
                  Store
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Điểm đến tin cậy cho các ưu đãi Flash Sale trên thiết bị điện tử và công nghệ cao cấp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <span className="font-semibold text-foreground text-sm tracking-wide uppercase mb-4 block">
              Liên kết nhanh
            </span>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm hover:text-primary transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm hover:text-primary transition-colors">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="text-sm hover:text-primary transition-colors">
                  Thanh toán
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <span className="font-semibold text-foreground text-sm tracking-wide uppercase mb-4 block">
              Hỗ trợ
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">
                  Thông tin vận chuyển
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">
                  Đổi trả
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <span className="font-semibold text-foreground text-sm tracking-wide uppercase mb-4 block">
              Liên hệ
            </span>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:support@megasale.store" className="hover:text-primary transition-colors">
                  support@megasale.store
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+18005551234" className="hover:text-primary transition-colors">
                  1-800-555-1234
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>123 Commerce Street, San Francisco, CA 94102</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            {currentYear} MegaSale Store. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm hover:text-primary transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-sm hover:text-primary transition-colors">
              Điều khoản dịch vụ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;