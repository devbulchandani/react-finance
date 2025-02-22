import { useEffect, useState } from 'react';
import privy from "../assets/privy.jpeg";
import coinbase from "../assets/coinbase.jpg";

const FloatingIcons = () => {
    const [rotation, setRotation] = useState(0);

    const icons = [
        { src: privy, alt: "Privy" },
        { src: "https://cryptologos.cc/logos/ethereum-eth-logo.png", alt: "Ethereum" },
        { src: coinbase, alt: "Coinbase" },
        { src: "https://cryptologos.cc/logos/solana-sol-logo.png", alt: "Solana" },
        { src: "https://cryptologos.cc/logos/cardano-ada-logo.png", alt: "Cardano" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation((prev) => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden">
            {/* Central Text */}
            <div className="absolute z-20 text-center bg-gray-900/80 backdrop-blur-none px-8 py-4 rounded-full border border-gray-700 shadow-md">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    POWERED BY
                </span>
            </div>

            {/* Rotating Icons */}
            {icons.map((icon, index) => {
                const angle = ((index * (360 / icons.length) + rotation) * Math.PI) / 180;
                const radius = 200; // Increased radius for better spacing
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <div
                        key={icon.alt}
                        className="absolute transition-all duration-500 ease-in-out hover:scale-110"
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
                        }}
                    >
                        {/* Icon Container */}
                        <div className="bg-gray-900/80 p-4 rounded-full shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all border border-gray-700">
                            <img
                                src={icon.src}
                                alt={icon.alt}
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FloatingIcons;