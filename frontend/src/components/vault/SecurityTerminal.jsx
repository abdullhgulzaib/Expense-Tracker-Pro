import React, { useEffect, useRef } from 'react';

/**
 * Authentic Security Terminal Component.
 * Pure CSS telemetry component.
 */
function SecurityTerminal({
  logs = [],
  activeStep = '',
  className = '',
}) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`vault-terminal ${className}`}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '6px',
          marginBottom: '8px',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}
        >
          SECURITY TERMINAL
        </span>
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {logs.map((log) => {
          const isError = log.status === 'ERROR' || log.status === 'WARN';
          const isSuccess = log.status === 'OK';

          return (
            <div key={log.id} className="vault-terminal-line">
              <span style={{ color: isError ? '#f87171' : isSuccess ? '#cbd5e1' : '#38bdf8' }}>
                ▶ {log.text}
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  marginLeft: '8px',
                  color: isError ? '#f87171' : isSuccess ? '#10b981' : '#38bdf8',
                }}
              >
                {log.status || '...'}
              </span>
            </div>
          );
        })}

        {activeStep && (
          <div style={{ color: '#38bdf8', fontSize: '0.68rem', paddingTop: '2px' }}>
            ▶ {activeStep}
            <span className="vault-terminal-cursor" />
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default SecurityTerminal;
