import { Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import Layout from './components/Layout'
import Explore from './pages/Explore'
import Collection from './pages/Collection'
import VaultDetail from './pages/VaultDetail'
import MyVaults from './pages/MyVaults'
import CreateCollection from './pages/CreateCollection'
import RevenueDashboard from './pages/RevenueDashboard'

export default function App() {
  return (
    <WalletProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/collection/:id" element={<Collection />} />
          <Route path="/vault/:id" element={<VaultDetail />} />
          <Route path="/my-vaults" element={<MyVaults />} />
          <Route path="/create" element={<CreateCollection />} />
          <Route path="/revenue/:collectionId" element={<RevenueDashboard />} />
        </Routes>
      </Layout>
    </WalletProvider>
  )
}
