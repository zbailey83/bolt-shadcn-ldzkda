import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Wallet, BarChart3, PieChart } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const UPDATE_INTERVAL = 30000; // 30 seconds

const Dashboard = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);

  const fetchBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    } else {
      setBalance(null);
    }
  }, [publicKey, connection]);

  const fetchSolPrice = useCallback(async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      setSolPrice(null);
    }
  }, []);

  const updateData = useCallback(() => {
    fetchBalance();
    fetchSolPrice();
    setTimeout(updateData, UPDATE_INTERVAL);
  }, [fetchBalance, fetchSolPrice]);

  useEffect(() => {
    updateData();
    // Cleanup function
    return () => {
      // No need to clear any interval now
    };
  }, [updateData]);

  const totalValue = balance !== null && solPrice !== null ? balance * solPrice : null;

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Solana Portfolio Dashboard</h1>
        <WalletMultiButton />
      </header>

      {publicKey ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wallet Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated every 30 seconds
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalValue !== null ? `$${totalValue.toFixed(2)}` : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  SOL Price: ${solPrice !== null ? solPrice.toFixed(2) : 'Loading...'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Portfolio Diversity
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1 Asset</div>
                <p className="text-xs text-muted-foreground">
                  100% SOL
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ... (keep the rest of the component unchanged) */}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Solana Portfolio Dashboard</CardTitle>
            <CardDescription>Connect your wallet to view your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">To get started, click the "Select Wallet" button in the top right corner and connect your Solana wallet.</p>
            <WalletMultiButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;