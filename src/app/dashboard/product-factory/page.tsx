'use client';
import { useState } from 'react';
import { Rocket, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { runAutoPilotPipeline } from '@/lib/factory-pipeline';

export default function ProductFactoryPage() {
  const [autoPilotStatus, setAutoPilotStatus] = useState<string | null>(null);
  const [isAutoPiloting, setIsAutoPiloting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAutoPilot = async () => {
    setIsAutoPiloting(true);
    setError(null);
    setAutoPilotStatus('Starting auto-pilot...');
    
    try {
      // Assuming a dummy user ID for now, since auth is not fully hooked up in this isolated component
      const userId = '00000000-0000-0000-0000-000000000000';
      
      const result = await runAutoPilotPipeline(userId);

      if (!result.success) {
        setError(result.error || 'Auto-pilot failed');
        setAutoPilotStatus(result.status || 'Failed');
      } else {
        setAutoPilotStatus(result.status || 'Completed!');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setAutoPilotStatus('Failed');
    } finally {
      setIsAutoPiloting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">💰 Automated Cash-Cow Machine</h1>
      
      <div className="space-y-6">
        <Button
          size="lg"
          className="w-full py-8 text-lg font-bold bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white"
          onClick={handleAutoPilot}
          disabled={isAutoPiloting}
        >
          {isAutoPiloting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {autoPilotStatus}
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              🚀 Auto-Pilot: Research & Generate
            </>
          )}
        </Button>

        {autoPilotStatus && !error && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="text-green-500 h-5 w-5" />
              <span>{autoPilotStatus}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
