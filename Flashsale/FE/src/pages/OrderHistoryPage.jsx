import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, AlertTriangle, ArrowLeft, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { toast } from 'sonner';

const OrderFailedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const errorData = location.state?.errorData;

  useEffect(() => {
    if (!errorData) {
      navigate('/');
      return;
    }
    
    toast.error('Order failed. Please try again.');
  }, [errorData, navigate]);

  if (!errorData) {
    return null;
  }

  const handleTryAgain = () => {
    navigate('/checkout', { 
      state: { 
        preserveCart: true,
        previousAttempt: errorData 
      } 
    });
  };

  return (
    <>
      <Helmet>
        <title>Order failed - MegaSale Store</title>
        <meta name="description" content="Your order could not be processed. Please try again or contact support." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-gradient-to-b from-error-light to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Error Icon */}
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
              <div className="inline-flex items-center justify-center w-24 h-24 bg-destructive/10 rounded-full mb-6 animate-shake">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{letterSpacing: '-0.02em'}}
              >
                Order failed
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground"
              >
                We couldn't process your order
              </motion.p>
            </motion.div>

            {/* Error Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-6 space-y-6"
            >
              {/* Error Message */}
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription className="ml-2">
                  <span className="font-semibold">Error: </span>
                  {errorData.message || 'An unexpected error occurred while processing your payment. Please check your payment details and try again.'}
                </AlertDescription>
              </Alert>

              <Separator />

              {/* Order Details That Were Attempted */}
              {errorData.items && errorData.items.length > 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Order details</h2>
                    <div className="space-y-3">
                      {errorData.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-foreground tabular-nums">
                        ${errorData.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Help Information */}
              <div className="bg-muted rounded-xl p-4 space-y-3">
                <h3 className="font-semibold">What can you do?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Check your payment information and try again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Try a different payment method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Contact your bank if the issue persists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Reach out to our support team at support@megasale.store</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                onClick={handleTryAgain}
                className="w-full sm:w-auto rounded-xl font-semibold transition-all active:scale-[0.98]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Try again
              </Button>
              
              <Link to="/products">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl font-semibold transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Continue shopping
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OrderFailedPage;