import React from 'react';
import { motion } from 'framer-motion';

const SeatGrid = ({ seats, selectedSeats, onSeatClick }) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  const getSeatStatus = (seat) => {
    if (seat.status === 'reserved') return 'reserved';
    const isSelected = selectedSeats.some(s => s.row === seat.row && s.number === seat.number);
    return isSelected ? 'selected' : 'available';
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-primary hover:bg-primary/90';
      case 'reserved':
        return 'bg-muted cursor-not-allowed opacity-50';
      case 'available':
      default:
        return 'bg-secondary hover:bg-secondary/80';
    }
  };

  const getSeatTypeLabel = (row) => {
    if (row === 'A' || row === 'B') return 'Ghế VIP - $20';
    if (row === 'C' || row === 'D') return 'Ghế Sofa - $16';
    return 'Ghế Thường - $12';
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <div className="text-sm font-medium text-muted-foreground mb-2">Màn hình</div>
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
      </div>

      <div className="space-y-4">
        {rows.map((row, rowIndex) => {
          const rowSeats = seats.filter(s => s.row === row);
          const showLabel = rowIndex === 0 || rowIndex === 2 || rowIndex === 4;
          
          return (
            <div key={row}>
              {showLabel && (
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  {getSeatTypeLabel(row)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 text-center font-medium text-muted-foreground">
                  {row}
                </div>
                <div className="flex gap-2 flex-1 justify-center">
                  {rowSeats.map((seat) => {
                    const status = getSeatStatus(seat);
                    const isClickable = status !== 'reserved';
                    
                    return (
                      <motion.button
                        key={`${seat.row}${seat.number}`}
                        whileHover={isClickable ? { scale: 1.1 } : {}}
                        whileTap={isClickable ? { scale: 0.95 } : {}}
                        onClick={() => isClickable && onSeatClick(seat)}
                        disabled={!isClickable}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 ${getSeatColor(status)} ${
                          status === 'selected' ? 'text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {seat.number}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-secondary rounded"></div>
          <span className="text-sm text-muted-foreground">Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded"></div>
          <span className="text-sm text-muted-foreground">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted opacity-50 rounded"></div>
          <span className="text-sm text-muted-foreground">Đã đặt</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;