'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Card } from './card';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, minDate, placeholder, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < min;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (isDateDisabled(newDate)) return;

    setSelectedDate(newDate);
    const dateString = newDate.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = isDateDisabled(date);
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={`p-2 text-sm rounded-md transition-all ${
            isSelected
              ? 'bg-primary text-primary-foreground font-bold'
              : isDisabled
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'hover:bg-accent text-foreground'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          placeholder={placeholder || 'Select date'}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="cursor-pointer bg-background/50 border-border/50 pr-10"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          📅
        </button>
      </div>

      {isOpen && (
        <Card className="absolute z-50 mt-2 p-4 border border-border/50 bg-background shadow-xl">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="hover:bg-accent"
            >
              ←
            </Button>
            <div className="font-semibold text-sm">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="hover:bg-accent"
            >
              →
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow.getDate());
                setViewDate(tomorrow);
              }}
              className="flex-1 text-xs"
            >
              Tomorrow
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                handleDateSelect(nextWeek.getDate());
                setViewDate(nextWeek);
              }}
              className="flex-1 text-xs"
            >
              Next Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                handleDateSelect(nextMonth.getDate());
                setViewDate(nextMonth);
              }}
              className="flex-1 text-xs"
            >
              Next Month
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
