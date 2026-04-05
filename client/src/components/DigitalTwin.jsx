import React from 'react';

const DigitalTwin = ({ score }) => {
    // Determine the state of our avatar based on the health score
    let twinState = {
        emoji: '😊',
        status: 'Excellent Health',
        color: '#10b981', // Emerald green
        animation: 'none',
        message: 'Your adherence is great! Keep it up.'
    };

    if (score < 80 && score >= 50) {
        twinState = {
            emoji: '😐',
            status: 'Needs Attention',
            color: '#f59e0b', // Amber
            animation: 'none',
            message: 'You have missed a few doses. Try to stay on schedule.'
        };
    } else if (score < 50) {
        twinState = {
            emoji: '🤒',
            status: 'Health at Risk',
            color: '#ef4444', // Red
            animation: 'pulse 2s infinite', // Only pulse when it's critical
            message: 'Adherence is low. Please take your medication to recover.'
        };
    }

    return (
        <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '24px', 
            border: `2px solid ${twinState.color}`,
            boxShadow: `0 4px 14px ${twinState.color}30`,
            textAlign: 'center',
            transition: 'all 0.5s ease',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>👤 Health Avatar</h3>
            
            <div style={{
                fontSize: '80px',
                margin: '20px 0',
                animation: twinState.animation,
                transition: 'all 0.5s ease'
            }}>
                {twinState.emoji}
            </div>

            <h4 style={{ margin: '0 0 10px 0', color: twinState.color, fontSize: '1.2em' }}>
                {twinState.status}
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.9em', margin: 0, lineHeight: '1.5' }}>
                {twinState.message}
            </p>

            {/* CSS Animations injected directly for the alert state */}
            <style>
                {`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default DigitalTwin;