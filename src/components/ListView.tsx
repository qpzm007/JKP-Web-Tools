import type { AppData } from '../App';
import AppCard from './AppCard';
import { handleAppLaunch } from '../services/appUsage';

interface ListViewProps {
    apps: AppData[];
}

export default function ListView({ apps }: ListViewProps) {
    return (
        <div style={styles.container}>
            <div style={styles.grid}>
                {apps.map(app => (
                    <AppCard 
                        key={app.id} 
                        app={app} 
                        style={styles.cardOverrides} 
                        onClick={async () => {
                            const canLaunch = await handleAppLaunch(app);
                            if (canLaunch) {
                                alert(`[앱 실행 모달 창]\n${app.name}\n- ${app.desc}`);
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: '100%',
        height: '100%',
        overflowY: 'auto' as const,
        padding: '40px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    cardOverrides: {
        position: 'relative' as const,
        width: '100%',
        height: '140px',
        transform: 'none'
    }
};
