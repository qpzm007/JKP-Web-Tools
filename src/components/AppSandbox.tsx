import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { AppData } from '../App';

interface AppSandboxProps {
    app: AppData;
    onClose: () => void;
}

export default function AppSandbox({ app, onClose }: AppSandboxProps) {
    const isLink = app.executionType === 'link';

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        <h3 style={styles.title}>{app.name}</h3>
                        <span style={styles.tag}>{app.tag}</span>
                    </div>
                    <div style={styles.controls}>
                        {isLink && (
                            <a href={app.contentInfo} target="_blank" rel="noreferrer" style={styles.externalBtn}>
                                <ExternalLink size={16} /> 새 창
                            </a>
                        )}
                        <button style={styles.closeBtn} onClick={onClose} aria-label="닫기">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                
                <div style={styles.content}>
                    {isLink ? (
                        <iframe 
                            src={app.contentInfo} 
                            style={styles.iframe} 
                            title={app.name} 
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                    ) : (
                        <iframe 
                            srcDoc={app.contentInfo} 
                            style={styles.iframe} 
                            title={app.name} 
                            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2vw'
    },
    modal: {
        width: '100%',
        height: '100%',
        maxWidth: '1400px',
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 30px',
        borderBottom: '1px solid #f0f0f0',
        background: 'rgba(255, 255, 255, 0.9)',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    title: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 800,
        color: '#111',
        letterSpacing: '-0.5px'
    },
    tag: {
        background: '#f1f3f4',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#5f6368'
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    externalBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '20px',
        color: '#1a73e8',
        fontSize: '14px',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'all 0.2s'
    },
    closeBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        background: '#f1f3f4',
        border: 'none',
        borderRadius: '50%',
        color: '#202124',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    content: {
        flex: 1,
        width: '100%',
        background: '#fafafa',
        position: 'relative'
    },
    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#fff'
    }
};
