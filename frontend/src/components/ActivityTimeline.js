import React from 'react';

function ActivityTimeline({ lead }) {
  const activities = [];

  // Add creation event
  if (lead.createdAt) {
    activities.push({
      type: 'created',
      timestamp: new Date(lead.createdAt),
      message: 'Lead created',
    });
  }

  // Add update event if different from creation
  if (lead.updatedAt && lead.updatedAt !== lead.createdAt) {
    activities.push({
      type: 'updated',
      timestamp: new Date(lead.updatedAt),
      message: 'Lead updated',
    });
  }

  // Add analysis event if lead has been analyzed
  if (lead.score) {
    activities.push({
      type: 'analyzed',
      timestamp: new Date(lead.updatedAt),
      message: `Lead analyzed - Score: ${lead.score}/100, Urgency: ${lead.urgency}`,
    });
  }

  // Sort by timestamp descending
  activities.sort((a, b) => b.timestamp - a.timestamp);

  const getIcon = (type) => {
    const icons = {
      'created': '✨',
      'updated': '✏️',
      'analyzed': '🤖',
    };
    return icons[type] || '📌';
  };

  return (
    <div className="activity-timeline">
      <h2>📅 Activity Timeline</h2>
      
      {activities.length > 0 ? (
        <div className="timeline">
          {activities.map((activity, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-icon">
                {getIcon(activity.type)}
              </div>
              <div className="timeline-content">
                <h3>{activity.message}</h3>
                <p className="timeline-date">
                  {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No activity recorded</p>
      )}
    </div>
  );
}

export default ActivityTimeline;
