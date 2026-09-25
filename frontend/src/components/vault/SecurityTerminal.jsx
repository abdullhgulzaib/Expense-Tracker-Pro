import React, { useEffect, useRef } from 'react';

/**
 * Authentic Security Terminal Component.
 * Displays real-time HTTP & state lifecycle logs without fake hacker text.
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
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2 select-none">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          SECURITY TERMINAL
        </span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      </div>

      <div className="space-y-1">
        {logs.map((log) => {
          const isError = log.status === 'ERROR' || log.status === 'WARN';
          const isSuccess = log.status === 'OK';
          const isPending = log.status === 'PENDING';

          return (
            <div key={log.id} className="vault-terminal-line">
              <span className={isError ? 'text-rose-400' : isSuccess ? 'text-slate-300' : 'text-cyan-400'}>
                ▶ {log.text}
              </span>
              <span
                className={`font-mono font-bold text-[10px] ml-2 ${
                  isError
                    ? 'text-rose-400'
                    : isSuccess
                    ? 'text-emerald-400'
                    : isPending
                    ? 'text-cyan-400 animate-pulse'
                    : 'text-slate-500'
                }`}
              >
                {log.status || '...'}
              </span>
            </div>
          );
        })}

        {activeStep && (
          <div className="text-cyan-300 animate-pulse text-[11px] pt-0.5">
            ▶ {activeStep}
            <span className="vault-terminal-cursor"></span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default SecurityTerminal;
