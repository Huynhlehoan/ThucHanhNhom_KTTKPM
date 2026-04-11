import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Film, Mail, Lock, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!isLogin && !name) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      const result = login(email, password);
      if (result.success) {
        toast.success('Đăng nhập thành công');
        navigate('/');
      }
    } else {
      const result = register(email, password, name);
      if (result.success) {
        toast.success('Đăng ký thành công');
        navigate('/');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Đăng nhập' : 'Đăng ký'} - PVR Cinema</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Film className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? 'Đăng nhập để tiếp tục đặt vé' : 'Đăng ký để trải nghiệm dịch vụ tốt nhất'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-foreground">Họ tên</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nhập họ tên của bạn"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">Mật khẩu</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 active:scale-[0.98] py-6 text-lg"
              >
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;