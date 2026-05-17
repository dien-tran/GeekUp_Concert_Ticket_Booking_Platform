import React, { useEffect, useState, useMemo } from 'react';
import { Tooltip } from '@mui/material';
import { SeatShowtime } from '../../types';
import { showtimeService } from '../../services/showtimeService';
import { clsx } from 'clsx';

// ===== Seat Button =====
interface SeatButtonProps {
  seat: SeatShowtime;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({ seat, isSelected, isDisabled, onClick }) => {
  const isVip = seat.seatType === 'VIP';
  const isHold = seat.status === 'HOLD';
  const isBooked = seat.status === 'BOOKED';

  const getHoldTooltip = () => {
    if (isHold) {
      const info = seat.heldByUserEmail ? `Held by: ${seat.heldByUserEmail}` : 'Seat is temporarily held';
      if (seat.holdExpireTime) {
        const remaining = Math.max(0, (new Date(seat.holdExpireTime).getTime() - Date.now()) / 1000);
        const m = Math.floor(remaining / 60);
        const s = Math.floor(remaining % 60);
        return `${info}\nExpires in: ${m}m ${s}s`;
      }
      return info;
    }
    return isBooked ? 'This seat has been booked' : '';
  };

  const seatClasses = clsx(
    'w-12 h-12 flex flex-col items-center justify-center rounded-xl border-2 text-[9px] font-bold select-none transition-all duration-150',
    isSelected && 'bg-primary border-primary-dark text-white scale-105 shadow-glow-primary',
    !isSelected && isVip && !isHold && !isBooked && !isDisabled && 'bg-white border-violet-400 text-violet-700 hover:bg-violet-600 hover:border-violet-700 hover:text-white cursor-pointer hover:scale-105',
    !isSelected && !isVip && !isHold && !isBooked && !isDisabled && 'bg-white border-cyan-400 text-cyan-700 hover:bg-cyan-600 hover:border-cyan-700 hover:text-white cursor-pointer hover:scale-105',
    isHold && !isSelected && 'bg-amber-100 border-amber-400 text-amber-700 cursor-not-allowed',
    isBooked && 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60',
  );

  const btn = (
    <button
      className={seatClasses}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
    >
      <span className="text-[10px] font-black leading-none">{seat.seatCode}</span>
      <span className="leading-none mt-0.5">{isVip ? 'VIP' : 'STD'}</span>
      <span className="leading-none">{(seat.price / 1000).toFixed(0)}k</span>
    </button>
  );

  if (isHold || isBooked) {
    return <Tooltip title={getHoldTooltip()} arrow>{btn}</Tooltip>;
  }
  return btn;
};

// ===== Seat Legend =====
export const SeatLegend: React.FC = () => (
  <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
    {[
      { color: 'bg-white border-cyan-400 text-cyan-700', label: 'Standard — Available' },
      { color: 'bg-white border-violet-400 text-violet-700', label: 'VIP — Available' },
      { color: 'bg-primary border-primary-dark text-white', label: 'Selected' },
      { color: 'bg-amber-100 border-amber-400 text-amber-700', label: 'Temporarily Held' },
      { color: 'bg-gray-200 border-gray-300 text-gray-400', label: 'Booked' },
    ].map(item => (
      <div key={item.label} className="flex items-center gap-2">
        <div className={clsx('w-7 h-7 rounded-lg border-2 text-[8px] font-bold flex items-center justify-center', item.color)}>A1</div>
        <span className="text-xs text-gray-600">{item.label}</span>
      </div>
    ))}
  </div>
);

// ===== Seat Map =====
interface SeatMapProps {
  showtimeId: string;
  selectedSeats: SeatShowtime[];
  onSelectSeat: (seat: SeatShowtime) => void;
  onDeselectSeat: (seatCode: string) => void;
  refreshTrigger?: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  showtimeId,
  selectedSeats,
  onSelectSeat,
  onDeselectSeat,
  refreshTrigger = 0,
}) => {
  const [seats, setSeats] = useState<SeatShowtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSeats = async () => {
      try {
        const response = await showtimeService.getSeatsByShowtime(showtimeId);
        if (!cancelled) {
          setSeats(response.data.result || []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Unable to load seat map. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSeats();
    const poll = setInterval(fetchSeats, 1500);
    return () => { cancelled = true; clearInterval(poll); };
  }, [showtimeId, refreshTrigger]);

  const seatsByRow = useMemo(() => {
    const groups: Record<string, SeatShowtime[]> = {};
    seats.forEach(s => {
      const row = s.seatCode.charAt(0);
      if (!groups[row]) groups[row] = [];
      groups[row].push(s);
    });
    return groups;
  }, [seats]);

  const rows = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

  const handleSeatClick = (seat: SeatShowtime) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const currentUserEmail = localStorage.getItem('userEmail');
    if (isSelected) {
      onDeselectSeat(seat.seatCode);
    } else if (seat.status === 'AVAILABLE') {
      onSelectSeat(seat);
    } else if (seat.status === 'HOLD' && currentUserEmail && seat.heldByUserEmail === currentUserEmail) {
      onSelectSeat(seat);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <SeatLegend />

      {/* Stage */}
      <div className="mb-8 text-center">
        <div className="inline-block px-16 py-3 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-sm font-bold text-gray-500 tracking-widest uppercase">
          🎤 Stage / Screen
        </div>
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto pb-4">
        <div className="space-y-2 min-w-max mx-auto">
          {rows.map(row => (
            <div key={row} className="flex items-center gap-2 justify-center">
              <span className="w-6 text-xs font-bold text-gray-400 text-right flex-shrink-0">{row}</span>
              <div className="flex gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                {seatsByRow[row]
                  .sort((a, b) => {
                    const numA = parseInt(a.seatCode.substring(1));
                    const numB = parseInt(b.seatCode.substring(1));
                    return numA - numB;
                  })
                  .map(seat => {
                    const currentUserEmail = localStorage.getItem('userEmail');
                    const isUsersSeat = seat.status === 'HOLD' && currentUserEmail && seat.heldByUserEmail === currentUserEmail;
                    const isDisabled = seat.status !== 'AVAILABLE' && !isUsersSeat && !selectedSeats.some(s => s.id === seat.id);
                    return (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeats.some(s => s.id === seat.id)}
                        isDisabled={isDisabled}
                        onClick={() => handleSeatClick(seat)}
                      />
                    );
                  })}
              </div>
              <span className="w-6 text-xs font-bold text-gray-400 flex-shrink-0">{row}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
