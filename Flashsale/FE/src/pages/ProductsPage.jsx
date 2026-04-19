import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { getProducts as puGetProducts } from '@/lib/api.js';
import { getProducts as mockGetProducts } from '@/lib/mockApi.js';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let list;
        try {
          const response = await puGetProducts();
          list = Array.isArray(response) ? response : (response.data || response.products || []);
        } catch {
          const response = await mockGetProducts();
          list = response.data;
        }
        setProducts(list);
        setFilteredProducts(list);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    // Search filter
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.flashPrice - b.flashPrice);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.flashPrice - a.flashPrice);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, sortBy, products]);

  const categoryMap = {
    'All': 'Tất cả',
    'Wearables': 'Đồng hồ thông minh',
    'Audio': 'Âm thanh',
    'Computers': 'Máy tính',
    'Mobile': 'Điện thoại',
    'Displays': 'Màn hình',
    'Accessories': 'Phụ kiện',
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <>
      <Helmet>
        <title>Tất cả sản phẩm - MegaSale</title>
        <meta name="description" content="Duyệt toàn bộ bộ sưu tập thiết bị điện tử cao cấp với giá Flash Sale." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
                  Sản phẩm
                </h1>
                <p className="text-muted-foreground">
                  Hiển thị {filteredProducts.length} kết quả
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm kiếm sản phẩm..." 
                    className="pl-10 rounded-xl bg-card border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-xl lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Bộ lọc</SheetTitle>
                    </SheetHeader>
                    <div className="py-6 space-y-8">
                      <div>
                        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                          Danh mục
                        </h3>
                        <div className="space-y-2">
                          {categories.map(category => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === category 
                                  ? 'bg-primary text-primary-foreground font-medium' 
                                  : 'hover:bg-accent text-foreground'
                              }`}
                            >
                              {categoryMap[category] || category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-64 shrink-0 space-y-8">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                    Danh mục
                  </h3>                  <div className="space-y-1">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-4 py-2 rounded-xl transition-all duration-200 ${
                          selectedCategory === category 
                            ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20' 
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        {categoryMap[category] || category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                    Sắp xếp
                  </h3>
                  <select 
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Nổi bật</option>
                    <option value="price-low">Giá: Thấp đến Cao</option>
                    <option value="price-high">Giá: Cao đến Thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {loading ? (
                  <LoadingSpinner type="products" count={6} />
                ) : filteredProducts.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                      <X className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
                    <p className="text-muted-foreground mb-6">
                      Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc để tìm sản phẩm bạn cần.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="rounded-xl"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;