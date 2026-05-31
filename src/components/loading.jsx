import React from 'react';

const Loading = () => {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', width: '100%', gap: '15px', color: '#122C5F'
        }}>
            {/* Un spinner simple */}
            <div style={{
                width: '50px', height: '50px', border: '5px solid #f3f3f3',
                borderTop: '5px solid #122C5F', borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p>Cargando información portuaria...</p>
            
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Loading;