import { parentPort } from 'worker_threads';
import * as ping from 'ping';
import * as date from 'date-and-time';

interface PingRequest {
  id: string;
  address: string;
  timeout: number;
}

interface PingResult {
  id: string;
  alive: boolean;
  timestamp: string;
  error?: string;
}

parentPort?.on('message', async (request: PingRequest) => {
  try {
    const result = await ping.promise.probe(request.address, { timeout: request.timeout });
    const timestamp = date.format(new Date(), 'MM/DD/YYYY hh:mm:ss A');
    
    const response: PingResult = {
      id: request.id,
      alive: result.alive,
      timestamp
    };
    
    parentPort?.postMessage(response);
  } catch (error) {
    const timestamp = date.format(new Date(), 'MM/DD/YYYY hh:mm:ss A');
    
    const response: PingResult = {
      id: request.id,
      alive: false,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    parentPort?.postMessage(response);
  }
});