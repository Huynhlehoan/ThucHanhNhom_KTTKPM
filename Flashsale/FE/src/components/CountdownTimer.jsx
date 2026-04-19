import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  function calculateTimeLeft(end) {
    const difference = new Date(end) - new Date();
    
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endTime);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (timeLeft.expired) {
    return (
      <div className="text-sm font-medium text-muted-foreground">
        Đã kết thúc
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <TimeUnit value={timeLeft.hours} label="h" />
      <span className="text-foreground font-semibold">:</span>
      <TimeUnit value={timeLeft.minutes} label="m" />
      <span className="text-foreground font-semibold">:</span>
      <TimeUnit value={timeLeft.seconds} label="s" />
    </div>
  );
};

const TimeUnit = ({ value, label }) => {
  return (
    <div className="flex items-center gap-0.5">
      <span className="font-mono font-bold text-lg tabular-nums text-primary">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
};

export default CountdownTimer;