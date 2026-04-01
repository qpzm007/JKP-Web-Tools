import type { AppData } from '../App';
import AppCard from './AppCard';
import { handleAppLaunch } from '../services/appUsage';

interface ListViewProps {
    apps: AppData[];
    onAppOpen?: (app: AppData) => void;
}

export default function ListView({ apps, onAppOpen }: ListViewProps) {
    return (
        <div className="w-full h-full overflow-y-auto px-4 py-6 bg-slate-50">
            <div className="grid gap-4 mx-auto max-w-7xl" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {apps.map(app => (
                    <div key={app.id} style={{ height: '190px', width: '100%' }}>
                        <AppCard 
                            app={app} 
                            onClick={async () => {
                                const canLaunch = await handleAppLaunch(app);
                                if (canLaunch && onAppOpen) {
                                    onAppOpen(app);
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}


