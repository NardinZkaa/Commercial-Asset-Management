import { CheckCircle, Clock, Truck, AlertTriangle, User, Building } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ComponentType<any>;
  user?: string;
}

interface TransferTimelineProps {
  transferId: string;
  events: TimelineEvent[];
}

export default function TransferTimeline({ transferId, events }: TransferTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 border-emerald-500';
      case 'current': return 'bg-blue-500 border-blue-500 animate-pulse';
      case 'pending': return 'bg-slate-300 border-slate-300';
      default: return 'bg-slate-300 border-slate-300';
    }
  };

  const getLineColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'current': return 'bg-blue-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Transfer Timeline</h3>
      
      <div className="relative">
        {events.map((event, index) => {
          const IconComponent = event.icon;
          const isLast = index === events.length - 1;
          
          return (
            <div key={event.id} className="relative flex items-start space-x-4 pb-8">
              {/* Timeline Line */}
              {!isLast && (
                <div className={`absolute left-4 top-8 w-0.5 h-full ${getLineColor(event.status)}`} />
              )}
              
              {/* Timeline Icon */}
              <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(event.status)}`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              
              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-slate-900">{event.title}</h4>
                  <span className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                {event.user && (
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <User className="w-3 h-3" />
                    <span>by {event.user}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}