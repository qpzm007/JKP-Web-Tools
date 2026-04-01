import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import type { AppData } from '../App';
import AppCard from './AppCard';
import { handleAppLaunch } from '../services/appUsage';

interface GravityViewProps {
    apps: AppData[];
    isActive: boolean;
    onAppOpen?: (app: AppData) => void;
}

interface CardBodyMap {
    id: string | number;
    body: Matter.Body;
}

export default function GravityView({ apps, isActive, onAppOpen }: GravityViewProps) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    
    const [cardMaps, setCardMaps] = useState<CardBodyMap[]>([]);
    const [bodyPositions, setBodyPositions] = useState<Record<string | number, { x: number, y: number, angle: number }>>({});

    useEffect(() => {
        if (!sceneRef.current) return;

        const { Engine, Render, Runner, World, Composite, Bodies, Mouse, MouseConstraint, Events } = Matter;

        const cw = sceneRef.current.clientWidth || window.innerWidth || 800;
        const ch = sceneRef.current.clientHeight || window.innerHeight || 600;

        const engine = Engine.create();
        const world = engine.world;
        engineRef.current = engine;

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: cw,
                height: ch,
                background: 'transparent',
                wireframes: false
            }
        });
        
        render.canvas.style.background = 'transparent';
        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.zIndex = '10';

        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);
        Render.run(render);
        renderRef.current = render;

        const wallOpts = { isStatic: true, render: { visible: false } };
        const ground = Bodies.rectangle(cw / 2, ch + 30, cw * 2, 60, { ...wallOpts, restitution: 0.5 });
        const leftWall = Bodies.rectangle(-30, ch / 2, 60, ch * 2, wallOpts);
        const rightWall = Bodies.rectangle(cw + 30, ch / 2, 60, ch * 2, wallOpts);
        const ceiling = Bodies.rectangle(cw / 2, -1000, cw * 2, 60, wallOpts);

        Composite.add(world, [ground, leftWall, rightWall, ceiling]);

        const cardWidth = 260;
        const cardHeight = 130;
        const initCardMaps: CardBodyMap[] = [];

        apps.forEach((app, idx) => {
            const startX = Math.random() * (cw - cardWidth) + cardWidth / 2;
            // stagger spawn positions higher up
            const startY = -400 - (idx * 200) - (Math.random() * 300);

            const body = Bodies.rectangle(startX, startY, cardWidth, cardHeight, {
                restitution: 0.6,
                friction: 0.1,
                density: 0.05,
                chamfer: { radius: 20 },
                render: { visible: false }
            });
            // Attach payload
            (body as any).appData = app;

            initCardMaps.push({ id: app.id, body });
            Composite.add(world, body);
        });

        setCardMaps(initCardMaps);

        Events.on(engine, 'afterUpdate', () => {
            const newPos: Record<string | number, { x: number, y: number, angle: number }> = {};
            initCardMaps.forEach((map) => {
                newPos[map.id] = {
                    x: map.body.position.x,
                    y: map.body.position.y,
                    angle: map.body.angle
                };
            });
            setBodyPositions(newPos);
        });

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Composite.add(world, mouseConstraint);
        render.mouse = mouse;

        let isDragging = false;
        Events.on(mouseConstraint, 'startdrag', () => { isDragging = true; });
        Events.on(mouseConstraint, 'enddrag', () => { setTimeout(() => { isDragging = false; }, 50); });

        Events.on(mouseConstraint, 'mouseup', async (event) => {
            const mousePos = event.mouse.position;
            const clickedBodies = Matter.Query.point(Composite.allBodies(world), mousePos);
            const validBodies = clickedBodies.filter(b => !b.isStatic && (b as any).appData);
            
            if (validBodies.length > 0 && !isDragging) {
                const clickedBody = validBodies[0] as any;
                const canLaunch = await handleAppLaunch(clickedBody.appData);
                if (canLaunch && onAppOpen) {
                    onAppOpen(clickedBody.appData);
                }
            }
        });

        const handleResize = () => {
            if (!sceneRef.current) return;
            const newCw = sceneRef.current.clientWidth;
            const newCh = sceneRef.current.clientHeight;
            render.canvas.width = newCw;
            render.canvas.height = newCh;
            Matter.Body.setPosition(ground, { x: newCw / 2, y: newCh + 30 });
            Matter.Body.setPosition(rightWall, { x: newCw + 30, y: newCh / 2 });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) {
                render.canvas.remove();
            }
            World.clear(world, false);
            Engine.clear(engine);
        };
    }, [apps]);

    useEffect(() => {
        if (!runnerRef.current || !engineRef.current) return;
        if (isActive) {
            Matter.Runner.run(runnerRef.current, engineRef.current);
        } else {
            Matter.Runner.stop(runnerRef.current);
        }
    }, [isActive]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div ref={sceneRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
            
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
                {cardMaps.map((map) => {
                    const pos = bodyPositions[map.id];
                    if (!pos) return null;
                    
                    const cardWidth = 260;
                    const cardHeight = 130;
                    const x = pos.x - (cardWidth / 2);
                    const y = pos.y - (cardHeight / 2);

                    return (
                        <AppCard 
                            key={map.id} 
                            app={apps.find(a => a.id === map.id)!}
                            style={{
                                position: 'absolute',
                                transform: `translate(${x}px, ${y}px) rotate(${pos.angle}rad)`,
                                willChange: 'transform'
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
