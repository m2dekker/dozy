import React from 'react';
import { DayItinerary, Activity } from '@/lib/planner';

interface ItineraryDayProps {
  day: DayItinerary;
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="activity-card">
      <div className="activity-time">{activity.time}</div>
      <div className="activity-details">
        <h4 className="activity-title">{activity.title}</h4>
        <div className="activity-location">📍 {activity.location}</div>
        <p className="activity-description">{activity.description}</p>
        {activity.tip && (
          <div className="activity-tip">
            💡 <span>{activity.tip}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ItineraryDay({ day }: ItineraryDayProps) {
  return (
    <div className="itinerary-day">
      <div className="day-header">
        <h3>Day {day.day}</h3>
        {day.date && <span className="day-date">{day.date}</span>}
      </div>

      {day.morning && day.morning.length > 0 && (
        <div className="time-period">
          <div className="period-label">🌅 Morning</div>
          <div className="activities">
            {day.morning.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {day.afternoon && day.afternoon.length > 0 && (
        <div className="time-period">
          <div className="period-label">☀️ Afternoon</div>
          <div className="activities">
            {day.afternoon.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {day.evening && day.evening.length > 0 && (
        <div className="time-period">
          <div className="period-label">🌙 Evening</div>
          <div className="activities">
            {day.evening.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
