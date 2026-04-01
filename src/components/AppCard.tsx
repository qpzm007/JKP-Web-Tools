import type { CSSProperties } from 'react';
import type { AppData } from '../App';

interface AppCardProps {
    app: AppData;
    style?: CSSProperties;
    onClick?: () => void;
}

export default function AppCard({ app, style, onClick }: AppCardProps) {
    return (
        <div style={{ ...styles.card, ...style }} onClick={onClick}>
            <span style={styles.tag}>{app.tag}</span>
            <div style={styles.content}>
                <h3 style={styles.title}>{app.name}</h3>
                <p style={styles.desc}>{app.desc}</p>
            </div>
        </div>
    );
}

const styles: { [key: string]: CSSProperties } = {
    card: {
        width: '260px',
        height: '130px',
        background: 'var(--card-bg)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--card-shadow)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 1)',
        overflow: 'hidden',
        pointerEvents: 'auto',
        transition: 'box-shadow 0.2s ease',
        cursor: 'pointer'
    },
    tag: {
        alignSelf: 'flex-start',
        background: '#e8eaed',
        color: '#3c4043',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600
    },
    content: {
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        fontSize: '18px',
        fontWeight: 700,
        marginBottom: '6px',
        color: 'var(--text-main)'
    },
    desc: {
        fontSize: '13px',
        color: 'var(--text-sub)',
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    }
};
