'use client';

import { useState, useMemo, useEffect } from 'react';
import { Expense, Category } from '@/lib/types';
import { getExpenses, getCategories, deleteExpense } from '@/lib/data';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setCategories(getCategories());
  }, [refresh]);

  const expenses = useMemo(() => getExpenses(), [refresh]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      map.set(e.expenseDate, (map.get(e.expenseDate) || 0) + e.amount);
    });
    return map;
  }, [expenses]);

  const maxDayTotal = useMemo(() => {
    return Math.max(...Array.from(dailyTotals.values()), 1);
  }, [dailyTotals]);

  const getHeatStyle = (amount: number) => {
    if (amount === 0) return { backgroundColor: '#FAFAFA', color: '#C0BEB8' };
    const intensity = amount / maxDayTotal;
    if (intensity < 0.2) return { backgroundColor: '#E8E8E8', color: '#555' };
    if (intensity < 0.4) return { backgroundColor: '#C8C8C8', color: '#333' };
    if (intensity < 0.6) return { backgroundColor: '#A0A0A0', color: '#FFF' };
    if (intensity < 0.8) return { backgroundColor: '#787878', color: '#FFF' };
    return { backgroundColor: '#505050', color: '#FFF' };
  };

  const selectedExpenses = selectedDate ? expenses.filter(e => e.expenseDate === selectedDate) : [];

  const handleDelete = (id: string) => {
    if (confirm('确定删除这笔支出吗？')) {
      deleteExpense(id);
      setRefresh(r => r + 1);
    }
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <h1 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>日历</h1>

      {/* Month Navigator */}
      <div className="flex items-center justify-between rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E3DE' }}>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 rounded-md hover:bg-gray-50">
          <ChevronLeft size={18} style={{ color: '#555' }} />
        </button>
        <div className="text-base font-semibold" style={{ color: '#1A1A1A' }}>
          {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
        </div>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 rounded-md hover:bg-gray-50">
          <ChevronRight size={18} style={{ color: '#555' }} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E3DE' }}>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['一', '二', '三', '四', '五', '六', '日'].map(d => (
            <div key={d} className="text-center text-xs py-1" style={{ color: '#9A9894' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const ds = format(day, 'yyyy-MM-dd');
            const total = dailyTotals.get(ds) || 0;
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const heat = getHeatStyle(total);
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(ds)}
                className="aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-all"
                style={{
                  backgroundColor: inMonth ? heat.backgroundColor : 'transparent',
                  color: inMonth ? heat.color : '#D5D3CE',
                  outline: selectedDate === ds ? '2px solid #555' : today && inMonth ? '1px solid #999' : 'none',
                }}
              >
                <span className="font-medium">{format(day, 'd')}</span>
                {total > 0 && <span className="text-[10px] opacity-80">¥{total.toFixed(0)}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs justify-end" style={{ color: '#9A9894' }}>
          <span>少</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FAFAFA', border: '1px solid #E5E3DE' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E8E8E8' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#C8C8C8' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#A0A0A0' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#787878' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#505050' }} />
          </div>
          <span>多</span>
        </div>
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E3DE' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
              {format(parseISO(selectedDate), 'M月d日')} 明细
              <span className="ml-2" style={{ color: '#9A9894' }}>共 ¥{(dailyTotals.get(selectedDate) || 0).toFixed(2)}</span>
            </div>
            <button onClick={() => setSelectedDate(null)} className="p-1 rounded-md hover:bg-gray-50">
              <X size={16} style={{ color: '#9A9894' }} />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedExpenses.length === 0 && (
              <div className="text-center text-sm py-4" style={{ color: '#9A9894' }}>当日无支出记录</div>
            )}
            {selectedExpenses.map(exp => {
              const cat = categories.find(c => c.id === exp.categoryId);
              return (
                <div key={exp.id} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: '#F8F7F5' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: cat?.color || '#999' }}>
                      <CategoryIcon name={cat?.icon || 'MoreHorizontal'} size={14} />
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: '#1A1A1A' }}>{exp.description || cat?.name}</div>
                      <div className="text-xs" style={{ color: '#9A9894' }}>{exp.expenseTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>¥{exp.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="transition-colors"
                      style={{ color: '#9A9894' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#9E6A5E')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9A9894')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
