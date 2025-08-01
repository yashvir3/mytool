
'use server';

import fs from 'fs/promises';
import path from 'path';

// Define the path for the state files directory.
const stateDirectory = path.join(process.cwd(), 'incident-states');
const FIFTEEN_DAYS_IN_MS = 15 * 24 * 60 * 60 * 1000;

interface TimelineState {
  titlePriority: string;
  titleIncident: string;
  titleDescription: string;
  incidentDetails: Record<string, string>;
  timelineEntries: {
    id: number;
    timestamp: string;
    status: string;
    notes: string;
  }[];
}

/**
 * Deletes incident files that have not been modified in the last 15 days.
 */
async function cleanupOldIncidents(): Promise<void> {
    try {
        const files = await fs.readdir(stateDirectory);
        const now = Date.now();

        for (const file of files) {
            // Skip the special teams file and non-json files
            if (file === '_callout-teams.json' || !file.endsWith('.json')) {
                continue;
            }

            const filePath = path.join(stateDirectory, file);
            const stats = await fs.stat(filePath);
            
            if (now - stats.mtime.getTime() > FIFTEEN_DAYS_IN_MS) {
                await fs.unlink(filePath);
                console.log(`Cleaned up old incident file: ${file}`);
            }
        }
    } catch (error) {
        // Log the error but don't throw, as cleanup failure shouldn't block main functionality.
        console.error('Error during old incident cleanup:', error);
    }
}


/**
 * Ensures the directory for storing incident states exists and runs cleanup.
 */
async function ensureStateDirectoryExists(): Promise<void> {
  try {
    await fs.mkdir(stateDirectory, { recursive: true });
    // Run cleanup non-blockingly
    cleanupOldIncidents();
  } catch (error) {
    console.error('Error creating state directory:', error);
    throw new Error('Failed to create state directory on the server.');
  }
}

/**
 * Saves the timeline state for a specific incident to a JSON file on the server.
 * @param incidentNumber - The incident number, used as the filename.
 * @param state - The timeline state to save.
 */
export async function saveTimelineState(incidentNumber: string, state: TimelineState): Promise<void> {
  if (!incidentNumber || !incidentNumber.trim()) {
    console.warn('Attempted to save state without an incident number.');
    return;
  }
  
  await ensureStateDirectoryExists();
  const sanitizedFilename = incidentNumber.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
  const stateFilePath = path.join(stateDirectory, `${sanitizedFilename}.json`);

  try {
    const data = JSON.stringify(state, null, 2); // Pretty-print JSON
    await fs.writeFile(stateFilePath, data, 'utf-8');
  } catch (error) {
    console.error(`Error saving timeline state for incident ${incidentNumber}:`, error);
    throw new Error(`Failed to save timeline state for incident ${incidentNumber} to the server.`);
  }
}

/**
 * Loads the timeline state for a specific incident from a JSON file on the server.
 * @param incidentNumber - The incident number to load.
 * @returns The loaded timeline state, or null if the file doesn't exist.
 */
export async function loadIncidentState(incidentNumber: string): Promise<TimelineState | null> {
    if (!incidentNumber || !incidentNumber.trim()) {
        return null;
    }
    
    await ensureStateDirectoryExists();
    const sanitizedFilename = incidentNumber.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
    const stateFilePath = path.join(stateDirectory, `${sanitizedFilename}.json`);

  try {
    const data = await fs.readFile(stateFilePath, 'utf-8');
    return JSON.parse(data) as TimelineState;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error(`Error loading timeline state for incident ${incidentNumber}:`, error);
    throw new Error(`Failed to load timeline state for incident ${incidentNumber} from the server.`);
  }
}
