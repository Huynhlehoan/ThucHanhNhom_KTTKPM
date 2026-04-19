import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Wallet, History, RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

const WalletHistoryPage = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);

  const fetchWalletData = async () => {
    if (!user) return;
    try {
      // 1. Lấy số dư hiện tại (Read Model - CQRS)
      const walletRes = await fetch(`${GATEWAY_URL}/api/payments/wallet/${user.id}`);
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData);
      }

      // 2. Lấy lịch sử sự kiện (Event Store - Event Sourcing)
      const historyRes = await fetch(`${GATEWAY_URL}/api/payments/history/${user.id}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.reverse()); // Hiển thị mới nhất lên đầu
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu ví", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const handleReplay = async () => {
    setReplaying(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/payments/replay/${user.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const newBalance = await res.json();
        toast.success(`Hồi phục số dư thành công: ${newBalance.toLocaleString()}đ`);
        fetchWalletData();
      }
    } catch (error) {
      toast.error("Lỗi khi thực hiện Replay");
    } finally {
      setReplaying(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Ví của tôi - PVR Cinema</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ví của tôi</h1>
              <p className="text-muted-foreground">Theo dõi và truy vết lịch sử giao dịch (Event Sourcing)</p>
            </div>
            
            <Button 
              onClick={handleReplay} 
              disabled={replaying || loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${replaying ? 'animate-spin' : ''}`} />
              Replay số dư
            </Button>
          </div>

          {/* Wallet Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-lg mb-8 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-primary-foreground/80 text-sm font-medium mb-1">Số dư hiện tại</p>
              <h2 className="text-4xl font-bold">
                {wallet ? wallet.balance.toLocaleString() : '0'}đ
              </h2>
              <div className="mt-6 flex items-center gap-2 text-primary-foreground/60 text-xs">
                <Wallet className="w-4 h-4" />
                <span>CQRS Read Model: WalletReadModel Table</span>
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>

          {/* History Section */}
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Lịch sử truy vết (Event Store)
          </h3>

          {loading ? (
            <p className="text-center py-10 text-muted-foreground">Đang tải lịch sử...</p>
          ) : history.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">Chưa có giao dịch nào được ghi nhận.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border p-4 rounded-xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {event.amount > 0 ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {event.eventType === 'ACCOUNT_INITIALIZED' ? 'Khởi tạo tài khoản' : 'Thanh toán vé xem phim'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${event.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                    {event.amount > 0 ? '+' : ''}{event.amount.toLocaleString()}đ
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default WalletHistoryPage;
