import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Header = ({ activeTab, onTabChange, searchQuery, onSearchChange, onMenuClick }) => {
  const tabs = ['Hollywood', 'Bollywood', 'Others'];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;