import React, { useState, useEffect, useRef } from 'react';
import styles from '../../assets/scss/components/common/CustomDatePicker.module.scss';
import { BsCalendar, BsChevronLeft, BsChevronRight } from 'react-icons/bs';

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

const CustomDatePicker = ({ value, onChange, placeholder = "Select date", required, name }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years from 1940 to current year + 10
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: (currentYear + 10) - 1940 + 1 }, (_, i) => 1940 + i);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setViewDate(date);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // --- NEW: Handle Dropdown Changes ---
  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setViewDate(new Date(viewDate.getFullYear(), newMonth, 1));
  };

  const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setViewDate(new Date(newYear, viewDate.getMonth(), 1));
  };
  // ------------------------------------

  const handleDateClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const isSelected = (day: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return selected.getDate() === day && 
           selected.getMonth() === month && 
           selected.getFullYear() === year;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.empty}`}></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayClasses = `${styles.dayCell} 
        ${isSelected(d) ? styles.selected : ''} 
        ${isToday(d) ? styles.today : ''}`;

      days.push(
        <div key={d} className={dayClasses} onClick={() => handleDateClick(d)}>
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className={styles.datePickerContainer} ref={containerRef}>
      <div className={styles.inputWrapper} onClick={() => setIsOpen(!isOpen)}>
        <input 
          type="text" 
          readOnly 
          value={value} 
          placeholder={placeholder}
          required={required}
          name={name}
        />
        <BsCalendar className={styles.calendarIcon} />
      </div>

      {isOpen && (
        <div className={styles.calendarDropdown}>
          <div className={styles.header}>
            <button type="button" onClick={handlePrevMonth}><BsChevronLeft /></button>
            
            {/* --- NEW: Dropdowns for Month and Year --- */}
            <div className={styles.headerSelectors}>
              <select value={month} onChange={handleMonthSelect}>
                {monthNames.map((m, index) => (
                  <option key={m} value={index}>{m}</option>
                ))}
              </select>
              <select value={year} onChange={handleYearSelect}>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {/* ----------------------------------------- */}

            <button type="button" onClick={handleNextMonth}><BsChevronRight /></button>
          </div>

          <div className={styles.grid}>
            {daysOfWeek.map(day => (
              <div key={day} className={styles.dayName}>{day}</div>
            ))}
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;