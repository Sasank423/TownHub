
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Book, Home } from 'lucide-react';
import { Reservation } from '../utils/mockData';
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarProps {
  reservations: Reservation[];
}

export const Calendar: React.FC<CalendarProps> = ({ reservations }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDayReservations, setSelectedDayReservations] = useState<Reservation[]>([]);
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const prevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const getReservationsForDay = (day: Date) => {
    return reservations.filter(res => {
      const startDate = new Date(res.startDate);
      const endDate = new Date(res.endDate);
      
      return (
        isSameDay(startDate, day) || 
        isSameDay(endDate, day) || 
        (day > startDate && day < endDate)
      );
    });
  };
  
  const handleDayClick = (day: Date, dayReservations: Reservation[]) => {
    setSelectedDay(day);
    setSelectedDayReservations(dayReservations);
    setShowDialog(true);
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
          Reservation Calendar
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded hover:bg-secondary text-foreground"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <h3 className="py-2 text-foreground">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button 
            onClick={nextMonth}
            className="p-2 rounded hover:bg-secondary text-foreground"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div 
            key={day} 
            className="text-center text-sm py-2 font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the start of month */}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 border border-transparent"></div>
        ))}
        
        {daysInMonth.map((day, i) => {
          const dayReservations = getReservationsForDay(day);
          const isCurrentDay = isToday(day);
          
          return (
            <div 
              key={i}
              className={`h-24 border rounded-md p-1 cursor-pointer transition-all duration-200 ${
                isCurrentDay ? 'border-primary bg-primary/10' : 'border-border'
              } hover:border-primary/50 hover:bg-primary/5`}
              onClick={() => handleDayClick(day, dayReservations)}
            >
              <div className="text-right mb-1">
                <span className={`text-sm ${isCurrentDay ? 'font-semibold text-primary' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1 overflow-hidden">
                {dayReservations.slice(0, 2).map((res, idx) => (
                  <div 
                    key={idx}
                    className={`text-xs px-1 py-0.5 rounded truncate flex items-center ${
                      res.itemType === 'book' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}
                    title={res.title}
                  >
                    {res.itemType === 'book' ? (
                      <Book size={10} className="mr-1 flex-shrink-0" />
                    ) : (
                      <Home size={10} className="mr-1 flex-shrink-0" />
                    )}
                    <span className="truncate">{res.title}</span>
                  </div>
                ))}
                
                {dayReservations.length > 2 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayReservations.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Empty cells for days after the end of month */}
        {Array.from({ length: 6 - endOfMonth(currentMonth).getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-24 border border-transparent"></div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedDayReservations.length 
                ? `${selectedDayReservations.length} reservation(s) on this day`
                : 'No reservations for this day'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDayReservations.length > 0 ? (
            <div className="max-h-72 overflow-y-auto pr-1">
              {selectedDayReservations.map((res, idx) => (
                <div 
                  key={idx} 
                  className={`mb-3 p-3 rounded-md ${
                    res.itemType === 'book' 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'bg-purple-50 dark:bg-purple-900/20'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      res.itemType === 'book' 
                        ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300' 
                        : 'bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300'
                    }`}>
                      {res.itemType === 'book' ? <Book size={18} /> : <Home size={18} />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{res.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(res.startDate), 'MMM d')} - {format(new Date(res.endDate), 'MMM d, yyyy')}
                      </div>
                      <div className={`mt-1 inline-flex text-xs px-2 py-0.5 rounded-full ${
                        res.status === 'Approved' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : res.status === 'Pending'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {res.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="p-3 rounded-full bg-secondary/50 mb-3">
                <CalendarIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No reservations for this day</p>
              <button 
                className="mt-4 text-primary hover:underline text-sm font-medium"
                onClick={() => {
                  setShowDialog(false);
                  toast("You can reserve a book or room from the catalog pages");
                }}
              >
                Make a reservation
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
