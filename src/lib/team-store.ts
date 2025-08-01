
'use server';

import fs from 'fs/promises';
import path from 'path';

const stateDirectory = path.join(process.cwd(), 'incident-states');
const teamsFilePath = path.join(stateDirectory, '_callout-teams.json');

const defaultTeamNames = [
    "CDA - CDE - Content Delivery Engineering Call Out",
    "Global Commerce Hansen Call Out",
    "Group OTT Sales and Service NOW Web Cancellation OnCall",
    "Group PRS Janus OnCall",
    "GST - Assurance and Analytics– Oncall",
    "GVSRE - Betelgeuse Call Out",
    "GVSRE-Stellar Call Out",
    "NBCU GST Apps - Experimentation Platform  OnCall",
    "NBCU GST Data Showmax OnCall",
    "NBCU OTT Sales and Service NBCU Web Cancellation  OnCall",
    "NBCU OTT SAS NBCU ID Authentication OnCall",
    "OTT DPE DX Call Out",
    "UK Automation and Insight Engineering OnCall",
    "UK Content Discovery - GLaDOS OnCall",
    "UK Disco Analytics ETL OnCall",
    "UK Disco Gaia OnCall",
    "UK Disco Hades OnCall",
    "UK Disco Minerva OnCall",
    "UK Discovery Engineering SRE OnCall",
    "UK Discovery Reliability OnCall",
    "UK Discovery Services Engineering OnCall",
    "UK GC Iceberg CMS Support OnCall",
    "UK Global Platform Engineering Reliability OnCall",
    "UK GOTT Data Mercury OnCall",
    "UK GOTT Data NBCU OnCall",
    "UK GOTT Data Porrima OnCall",
    "UK GOTT Data Triage OnCall",
    "UK GOTT Platform Capabilities - SPC Cthulhu Support OnCall",
    "UK GPE METS GMP Support OnCall",
    "UK Group OTT Cloud Engineering OnCall",
    "UK Group OTT Edge Delivery Engineering OnCall",
    "UK Group OTT Paylite Peacock SRE Clients OnCall",
    "UK Group OTT Paylite Peacock SRE SAS OnCall",
    "UK GSP Apps CLIP  OnCall",
    "UK GSP Apps Mobile  OnCall",
    "UK GSP Apps Mobile Layer1 OnCall",
    "UK GSP Apps Mobile Layer2 OnCall",
    "UK GSP Apps Roku  OnCall",
    "UK GSP Apps Roku Layer 1 OnCall",
    "UK GSP Apps SRE OnCall",
    "UK GSP Apps tvOS  OnCall",
    "UK GSP Apps Web Watch  OnCall",
    "UK GSP Apps Web Watch Layer 1 OnCall",
    "UK GSP Apps Web Watch Layer 2 - Release OnCall (Layer 2) - Inactive Group",
    "UK GSP Apps xTV  OnCall",
    "UK GSP Apps XTV Layer1  OnCall",
    "UK GSP Apps XTV Layer2  OnCall",
    "UK GST Data Customer & Commerce OnCall",
    "UK GST Data DBT OnCall",
    "UK GST Data Hercules OnCall",
    "UK GST Data Personalisation OnCall",
    "UK GST Identity Support OnCall",
    "UK Kafka Support OnCall",
    "UK MAP Support OnCall",
    "UK MARS OnCall",
    "UK Metadata Ingestion OnCall",
    "UK MPP Global Solutions OnCall",
    "UK Nova OnCall",
    "UK Now TV Brightscript Development  OnCall",
    "UK Now TV CRM Support OnCall",
    "UK Now TV Payments Support OnCall",
    "UK Now TV Peacock DevOps OnCall",
    "UK Now TV Web - International Sales and Service  OnCall",
    "UK Now TV Web Assurance Development OnCall",
    "UK Now TV Web Service Development  OnCall",
    "UK Now YOU.I Support OnCall",
    "UK OTT - Peacock Web Browser Checkout OnCall",
    "UK OTT Bragi Support OnCall",
    "UK OTT Central Services Site Reliability Engineering OnCall",
    "UK OTT Cloud Platform - Alto Support OnCall",
    "UK OTT Cloud Platform - Arcus Support OnCall",
    "UK OTT Cloud Platform - Eleos Support OnCall",
    "UK OTT Cloud Platform - Kraken Support OnCall",
    "UK OTT Cloud Platform - Kronos Support OnCall",
    "UK OTT Cloud Platform - Lakitu Support OnCall",
    "UK OTT Cloud Platform - Loki Peacock Support OnCall",
    "UK OTT Cloud Platform - Loki Support OnCall",
    "UK OTT Cloud Platform - Phoenix Support OnCall",
    "UK OTT Cloud Platform - Pulsar Monitoring Support OnCall",
    "UK OTT Cloud Platform - Wave Support OnCall",
    "UK OTT Cloud Platform - Yoshi Support OnCall",
    "UK OTT Cloud Platform OnCall",
    "UK OTT Commerce ODIN OnCall",
    "UK OTT Commerce POM OnCall",
    "UK OTT Core Engineering Platform Security OnCall",
    "UK OTT Core Infrastructure OnCall",
    "UK OTT Core Platform OnCall",
    "UK OTT DCM Support OnCall",
    "UK OTT Fenrir Support OnCall",
    "UK OTT GraphQL Support OnCall",
    "UK OTT Heimdall Support OnCall",
    "UK OTT International Atom Development OnCall",
    "UK OTT International MyTV OnCall",
    "UK OTT Magni Support OnCall",
    "UK OTT Paylite SRE Clients OnCall",
    "UK OTT Payments Manager Support OnCall",
    "UK OTT Plutus Support OnCall",
    "UK OTT Radegast Support OnCall",
    "UK OTT Sales and Service - Customer Engagement  OnCall",
    "UK OTT Sales and Service - Hathor OnCall",
    "UK OTT Sales and Service - Thor OnCall (Inactive Group)",
    "UK OTT Sales and Service - Vali OnCall",
    "UK OTT Sales and Service - Web BFF OnCall",
    "UK OTT Streaming Engineering OnCall",
    "UK OTT Streaming Platform Reliability Engineering OnCall",
    "UK Peacock Web Help Support OnCall",
    "UK Peacock Web My Account Support OnCall",
    "UK SAS Partner Web OnCall",
    "UK Telemetry and Observability Platform - Support OnCall",
    "Video Engineering - VSE Call Out",
    "Video Player Technology - JavaScript Call Out",
    "Video Player Technology - Roku Call Out",
];

async function ensureStateDirectoryExists(): Promise<void> {
  try {
    await fs.mkdir(stateDirectory, { recursive: true });
  } catch (error) {
    console.error('Error creating state directory:', error);
    throw new Error('Failed to create state directory on the server.');
  }
}

/**
 * Loads the list of team names from the server.
 * @returns An array of team names.
 */
export async function loadTeamNames(): Promise<string[]> {
  await ensureStateDirectoryExists();
  try {
    const data = await fs.readFile(teamsFilePath, 'utf-8');
    return JSON.parse(data) as string[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, so create it with default teams
      await saveTeamNames(defaultTeamNames);
      return defaultTeamNames;
    }
    console.error('Error loading team names:', error);
    throw new Error('Failed to load team names from the server.');
  }
}

/**
 * Saves the list of team names to the server.
 * @param teams - The array of team names to save.
 */
export async function saveTeamNames(teams: string[]): Promise<void> {
  await ensureStateDirectoryExists();
  try {
    const data = JSON.stringify(teams, null, 2);
    await fs.writeFile(teamsFilePath, data, 'utf-8');
  } catch (error) {
    console.error('Error saving team names:', error);
    throw new Error('Failed to save team names to the server.');
  }
}
