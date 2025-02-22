import ExploreSection from "../components/ExploreSection"
import Features from "../components/Features"
import Navbar from "../components/Navbar"

const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-emerald-400">COOKIE DAO</h3>
                        <p className="text-gray-400 text-sm">
                            Building the future of decentralized finance, one block at a time.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-gray-300 font-medium mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Roadmap</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-gray-300 font-medium mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Support</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-gray-300 font-medium mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
                    ©️ 2025 COOKIE DAO. All rights reserved.
                </div>
            </div>
        </footer>
    );
}


const HomeBeforeLogin = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <Navbar />
            <main>
                <div className="container mx-auto px-4">
                    <ExploreSection />
                </div>
                <Features />
                <Footer />
            </main>
        </div>
    )
}

export default HomeBeforeLogin