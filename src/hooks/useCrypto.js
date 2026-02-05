import { useState, useEffect } from 'react';
import CryptoClientV2 from '../data/CryptoClient';

export const useCrypto = () => {
    const [crypto] = useState(() => new CryptoClientV2());
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        crypto.initialize()
            .then(() => setIsReady(true))
            .catch(err => console.error('Crypto init failed:', err));
    }, [crypto]);

    return { crypto, isReady };
};
