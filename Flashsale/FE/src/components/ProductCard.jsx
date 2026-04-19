import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import CountdownTimer from './CountdownTimer.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    
    addToCart(product, 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <Link to={`/products/${product.id}`}>
      <div className="group h-full flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground font-bold text-sm px-3 py-1">
              -{product.discount}%
            </Badge>
          )}
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-col flex-1 p-5">
          {/* Flexible Content Area */}
          <div className="space-y-3 flex-1">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({Math.floor(Math.random() * 400) + 100} đánh giá)
              </span>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                ${product.flashPrice.toFixed(2)}
              </span>
              {product.originalPrice !== product.flashPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${product.stock < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {product.stock === 0 ? 'Hết hàng' : `${product.stock} còn lại`}
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="bg-accent rounded-xl p-3 text-center">
              <div className="text-xs font-medium text-accent-foreground mb-1">
                Kết thúc sau
              </div>
              <CountdownTimer endTime={product.saleEndTime} />
            </div>
          </div>

          {/* Add to Cart Button - Fixed Height, Pushed to Bottom */}
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full h-12 mt-4 font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;