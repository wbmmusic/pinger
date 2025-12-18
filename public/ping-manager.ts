import { Worker } from 'worker_threads';
import { join } from 'path';

interface PingRequest {
  id: string;
  address: string;
  timeout: number;
  callback: (alive: boolean, timestamp: string, error?: string) => void;
}

class PingManager {
  private workers: Worker[] = [];
  private workerIndex = 0;
  private readonly workerCount = 3;

  constructor() {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    // Try multiple possible paths for the worker file
    const possiblePaths = [
      join(__dirname, 'ping-worker.js'),
      join(__dirname, '..', 'ping-worker.js'),
      join(process.cwd(), 'public', 'ping-worker.js'),
      join(__dirname, 'ping-worker.ts')
    ];
    
    let workerPath = possiblePaths[0];
    const fs = require('fs');
    
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        workerPath = path;
        break;
      }
    }
    
    console.log('Using worker path:', workerPath);
    
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(workerPath);
      
      worker.on('message', (result) => {
        // Find and execute callback for this ping result
        // This is handled by the ping method below
      });
      
      worker.on('error', (error) => {
        console.error('Worker error:', error);
      });
      
      this.workers.push(worker);
    }
  }

  ping(id: string, address: string, timeout: number = 5): Promise<{ alive: boolean; timestamp: string; error?: string }> {
    return new Promise((resolve) => {
      const worker = this.workers[this.workerIndex];
      this.workerIndex = (this.workerIndex + 1) % this.workerCount;
      
      const messageHandler = (result: any) => {
        if (result.id === id) {
          worker.off('message', messageHandler);
          resolve({
            alive: result.alive,
            timestamp: result.timestamp,
            error: result.error
          });
        }
      };
      
      worker.on('message', messageHandler);
      worker.postMessage({ id, address, timeout });
    });
  }

  destroy() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
  }
}

export const pingManager = new PingManager();