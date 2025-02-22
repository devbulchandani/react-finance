import { usePrivy } from "@privy-io/react-auth"
import HomeAfterLogin from "./pages/HomeAfterLogin";
import HomeBeforeLogin from "./pages/HomeBeforeLogin";
import { Navigate, Route, Routes } from "react-router";
import Profile from "./pages/Profile";
import WalletTracker from "./pages/WalletTracker";

import { useEffect } from "react";
import { addUserToDatabase } from "./apiClient";
import SavedWalletsPage from "./pages/SavedWalletPage";
import TransactionPage from "./pages/Transactions";
import SubscriptionManager from "./pages/SubscriptionManager";
import OrderPage from "./pages/MarketPlace";
import MerchantDashboard from "./pages/MerchantDashboard";

function App() {
  const { authenticated, user } = usePrivy();
  useEffect(() => {
    if (authenticated) {
      addUserToDatabase(user);
    }

  }, [user]);

  return (
    <>
      {authenticated ? <HomeAfterLogin /> : <HomeBeforeLogin />}
      <div className="ml-64 px-3">
        <Routes>
          {authenticated && (
            <>
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/watcher" element={<WalletTracker />} />
              <Route path="/subscriptions" element={<SubscriptionManager />} />
              <Route path="/saved-wallets" element={<SavedWalletsPage />} />
              <Route path="/transactions" element={<TransactionPage />} />
              <Route path="/market-place" element={<OrderPage />} />
              <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
              {/* <Route path="/chat-bot" element={<AgentDetails />} />
              <Route path='/governance' element={<Governance />} />
              <Route path='/stake' element={<StakeTokens />} /> */}
            </>
          )}
        </Routes>
      </div>
    </>
  )
}

export default App
