import { useEffect, useState } from 'react';

export default function useFullHeight() {
    const [height, setHeight] = useState<string | number>('100vh');

    useEffect(() => {
        const updateHeight = () => {
            if (window.innerHeight >= 700) {
                setHeight(window.innerHeight);
            }
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return height;
}