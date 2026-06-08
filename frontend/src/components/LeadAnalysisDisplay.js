import React from 'react';

function LeadAnalysisDisplay({ lead, onAnalyze, isAnalyzing }) {
  const getScoreColor = (score) => {
    if (score >= 70) return '#34a853';
    if (score >= 40) return '#fbbc04';
    return '#ea4335';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'LOW': '#9e9e9e',
      'MEDIUM': '#f57c00',
      'HIGH': '#d32f2f',
    };
    return colors[urgency] || '#666';
  };

  return (
    <div className="lead-analysis-section">
      <h2>🤖 AI Analysis</h2>
      
      {lead.score ? (
        <div className="analysis-results">
          <div className="analysis-item">
            <label>Quality Score</label>
            <div className="score-display" style={{ color: getScoreColor(lead.score) }}>
              {lead.score}/100
            </div>
          </div>

          <div className="analysis-item">
            <label>Urgency Level</label>
            <div 
              className="urgency-display" 
              style={{ 
                backgroundColor: getUrgencyColor(lead.urgency),
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              {lead.urgency || 'Not determined'}
            </div>
          </div>

          {lead.summary && (
            <div className="analysis-item full-width">
              <label>AI Summary</label>
              <p className="summary-text">{lead.summary}</p>
            </div>
          )}

          <button 
            className="btn-primary"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '🔄 Analyzing...' : '🔄 Re-analyze'}
          </button>
        </div>
      ) : (
        <div className="no-analysis">
          <p>This lead has not been analyzed yet.</p>
          <button 
            className="btn-primary"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '🔄 Analyzing...' : '🤖 Analyze Lead'}
          </button>
        </div>
      )}
    </div>
  );
}

export default LeadAnalysisDisplay;
