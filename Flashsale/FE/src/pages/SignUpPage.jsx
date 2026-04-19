import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setError('');
  };

  const passwordRules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!isPasswordValid) {
      setError('Mật khẩu chưa đáp ứng đủ yêu cầu.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup(formData.fullName, formData.email, formData.password);
    
    if (result.success) {
      toast.success('Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } else {
      setIsSubmitting(false);
      setError(result.error || 'Tạo tài khoản thất bại.');
      toast.error('Đăng ký thất bại');
    }
  };

  const RuleIndicator = ({ met, text }) => (
    <div className={`flex items-center text-xs ${met ? 'text-success' : 'text-muted-foreground'}`}>
      {met ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <XCircle className="w-3 h-3 mr-1.5 opacity-50" />}
      {text}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Đăng ký - MegaSale Store</title>
      </Helmet>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-muted/30">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center items-center gap-2 group mb-6">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-2 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MegaSale
            </span>
          </Link>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Tạo tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/signin" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-border">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="rounded-xl text-foreground"
                  placeholder="Maya Chen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-xl text-foreground"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="rounded-xl text-foreground"
                  placeholder="Tạo mật khẩu mạnh"
                />
                {formData.password && (
                  <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-muted rounded-xl">
                    <RuleIndicator met={passwordRules.length} text="Tối thiểu 8 ký tự" />
                    <RuleIndicator met={passwordRules.upper} text="1 chữ hoa" />
                    <RuleIndicator met={passwordRules.number} text="1 chữ số" />
                    <RuleIndicator met={passwordRules.special} text="1 ký tự đặc biệt" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rounded-xl text-foreground"
                  placeholder="Nhập lại mật khẩu"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || (formData.password && !isPasswordValid)}
                className="w-full rounded-xl h-12 font-semibold text-base transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;