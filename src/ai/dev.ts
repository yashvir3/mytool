import { config } from 'dotenv';
config();

import '@/ai/flows/simplify-text.ts';
import '@/ai/flows/grammar-correction.ts';
import '@/ai/flows/generate-comms.ts';
import '@/ai/flows/generate-summary.ts';
