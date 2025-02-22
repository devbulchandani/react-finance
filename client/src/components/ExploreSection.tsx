import { ArrowRight, TrendingUp, Shield, Coins } from 'lucide-react';
import FloatingIcons from './FloatingIcons';

const ExploreSection = () => {
    return (
        <section className="pt-32 pb-20 bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-left">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight">
                            Explore the Future<br />of Plutus
                        </h1>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
                            Discover a new way to manage, invest, and grow your wealth with Plutus.
                            Join thousands of users already transforming their financial future.
                        </p>
                        <button className="group px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-gray-900 rounded-full hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 text-lg font-semibold inline-flex items-center">
                            Start Exploring
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="relative">
                        <FloatingIcons />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
                    {[
                        {
                            icon: <TrendingUp className="w-6 h-6" />,
                            title: "Smart Trading",
                            description: "Manage Assets over multiple wallets on a single dashboard"
                        },
                        {
                            icon: <Shield className="w-6 h-6" />,
                            title: "Secure Storage",
                            description: "Use privy server wallet for instantaneous transfers through inbuilt policies"
                        },
                        {
                            icon: <Coins className="w-6 h-6" />,
                            title: "Multi-Chain Support",
                            description: "Stake on mindshare metrics using PLUTUS AI"
                        }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="relative bg-gradient-to-br from-gray-900/70 to-gray-800/70 backdrop-blur-lg p-6 rounded-3xl border border-gray-700 shadow-md hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 ease-in-out overflow-hidden"
                        >
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50"></div>

                            {/* Icon and Title Container */}
                            <div className="relative z-10 flex items-center space-x-4 mb-4">
                                {/* Icon */}
                                <div className="bg-emerald-400/10 w-12 h-12 rounded-full flex items-center justify-center text-emerald-400 shadow-sm">
                                    {item.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-100 tracking-tight">
                                    {item.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="relative z-10 text-gray-400 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ExploreSection;