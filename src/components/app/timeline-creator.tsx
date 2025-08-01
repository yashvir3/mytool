

      
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { loadIncidentState, saveTimelineState } from '@/lib/timeline-store';
import { CalloutGroupTool } from './callout-group-tool';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { TimelineTitleCard } from './timeline-title-card';
import { IncidentDetailsCard } from './incident-details-card';
import { TimelineEntriesCard } from './timeline-entries-card';
import { ResolutionDetailsCard } from './resolution-details-card';
import { ExportCard } from './export-card';

// Interfaces
export type TimelineEntry = {
  id: number;
  timestamp: string;
  status: string;
  notes: string;
};

export const defaultIncidentDetailFields = [
  "Incident Number", "Priority", "Incident Manager", "Timeline Scribe", "Bridge Link",
  "NBCU Product/ Business Unit", "Impacted Devices", "Services/Products Impacted",
  "Workgroups or Individuals engaged", "Impact Statement",
];

export const defaultResolutionDetailFields = [
    "Resolution", "Caused by Change", "Resolved by Change", "Root Cause/Trigger",
    "Related to Problem", "Workaround", "Concern/Recommendation", "Problem Number", "Problem Summary"
];

export const defaultNbcuProducts = ["Peacock", "Skyshowtime", "Showmax", "NOW", "TVE"];
export const defaultTimelineStatuses = ["Initial Report", "Update", "Action", "Comms", "Resolved Comms", "Caused by Change", "Resolved by Change", "Concern", "Recommendation", "CAN Report"];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function TimelineCreator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [titlePriority, setTitlePriority] = useState('P1');
  const [titleIncident, setTitleIncident] = useState('');
  const [titleDescription, setTitleDescription] = useState('');

  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  
  const [incidentDetails, setIncidentDetails] = useState<Record<string, string>>(() => {
    const initialDetails: Record<string, string> = {};
    [...defaultIncidentDetailFields, ...defaultResolutionDetailFields].forEach(field => {
        initialDetails[field] = '';
    });
    return initialDetails;
  });

  const { toast } = useToast();

  const state = useMemo(() => ({
    titlePriority,
    titleIncident,
    titleDescription,
    incidentDetails,
    timelineEntries,
  }), [titlePriority, titleIncident, titleDescription, incidentDetails, timelineEntries]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(debounce((incidentNumber, newState) => {
    if (isLoaded && incidentNumber) {
        saveTimelineState(incidentNumber, newState).catch(e => {
            console.error("Failed to save state:", e);
            toast({ variant: 'destructive', title: 'Failed to save state to server.' });
        });
    }
  }, 1000), [isLoaded, toast]);
  
  useEffect(() => {
    debouncedSave(titleIncident, state);
  }, [state, titleIncident, debouncedSave]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('timelineCreator_incidentNumber', titleIncident);
      localStorage.setItem('timelineCreator_shortDescription', titleDescription);
      localStorage.setItem('timelineCreator_priority', titlePriority);
      localStorage.setItem('timelineCreator_bridgeLink', incidentDetails['Bridge Link'] || '');
    }
  }, [isLoaded, titleIncident, titleDescription, titlePriority, incidentDetails]);


  const resetState = () => {
    setTitlePriority('P1');
    // Keep incident number
    setTitleDescription('');
    const initialDetails: Record<string, string> = {};
    [...defaultIncidentDetailFields, ...defaultResolutionDetailFields].forEach(field => {
        initialDetails[field] = '';
    });
    setIncidentDetails(initialDetails);
    setTimelineEntries([]);
  }

  const handleRetrieveIncident = async (incNum?: string) => {
    const incidentToFetch = incNum || titleIncident;
    if (!incidentToFetch.trim()) {
      toast({ variant: 'destructive', title: 'Incident Number is required.'});
      return;
    }
    setIsRetrieving(true);
    try {
      const savedState = await loadIncidentState(incidentToFetch);
      if (savedState) {
        setTitlePriority(savedState.titlePriority || 'P1');
        setTitleIncident(savedState.titleIncident || incidentToFetch);
        setTitleDescription(savedState.titleDescription || '');
        setIncidentDetails(savedState.incidentDetails || {});
        setTimelineEntries(savedState.timelineEntries || []);
        toast({ title: `Incident ${incidentToFetch} loaded.` });
      } else {
        resetState();
        toast({ title: 'New Incident', description: `No existing data found for ${incidentToFetch}.`});
      }
    } catch (error) {
      console.error("Failed to load state from server:", error);
      toast({
        variant: "destructive",
        title: "Could not load data",
        description: "There was an issue retrieving data from the server."
      });
    } finally {
      setIsRetrieving(false);
    }
  }

  useEffect(() => {
    const lastIncident = localStorage.getItem('timelineCreator_incidentNumber');
    if (lastIncident) {
        setTitleIncident(lastIncident);
        handleRetrieveIncident(lastIncident);
    }
    setIsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolutionText = useMemo(() => {
    const resolvedEntry = timelineEntries.find(entry => entry.status === 'Resolved Comms');
    if (!resolvedEntry?.notes) return '';
    
    const lines = resolvedEntry.notes.split('\n');
    const triggerPhrase = '* Current update';
    const updateLine = lines.find(line => line.trim().toLowerCase().startsWith(triggerPhrase.toLowerCase()));
    
    if (updateLine) {
        const trimmedLine = updateLine.trim();
        let text = trimmedLine.substring(triggerPhrase.length).trim();
        if (text.startsWith(':')) {
            text = text.substring(1).trim();
        }
        return text;
    }
    
    return '';
  }, [timelineEntries]);

  const causedByChangeText = useMemo(() => {
    const causedByChangeEntry = timelineEntries.find(entry => entry.status === 'Caused by Change');
    if (causedByChangeEntry) {
        return `Yes - ${causedByChangeEntry.notes || ''}`;
    }
    return 'No';
  }, [timelineEntries]);

  const resolvedByChangeText = useMemo(() => {
    const entry = timelineEntries.find(e => e.status === 'Resolved by Change');
    if (entry?.notes) {
      const match = entry.notes.match(/CHG[A-Z0-9]*/i);
      return match ? match[0] : '';
    }
    return '';
  }, [timelineEntries]);

  const concernRecommendationText = useMemo(() => {
    const relevantEntries = timelineEntries.filter(
      entry => entry.status === 'Concern' || entry.status === 'Recommendation'
    );

    if (relevantEntries.length === 0) return '';

    return relevantEntries
      .map(entry => `${entry.status}: ${entry.notes || 'N/A'}`)
      .join('\n');
  }, [timelineEntries]);

  useEffect(() => {
    setIncidentDetails(prevDetails => {
      const newDetails = { ...prevDetails };
      let detailsChanged = false;

      const resolutionKey = "Resolution";
      if (newDetails[resolutionKey] !== resolutionText) {
          newDetails[resolutionKey] = resolutionText;
          detailsChanged = true;
      }

      const causedByChangeKey = "Caused by Change";
      if (newDetails[causedByChangeKey] !== causedByChangeText) {
          newDetails[causedByChangeKey] = causedByChangeText;
          detailsChanged = true;
      }
      
      const resolvedByChangeKey = "Resolved by Change";
      if (newDetails[resolvedByChangeKey] !== resolvedByChangeText) {
          newDetails[resolvedByChangeKey] = resolvedByChangeText;
          detailsChanged = true;
      }

      const concernRecommendationKey = "Concern/Recommendation";
      if (newDetails[concernRecommendationKey] !== concernRecommendationText) {
          newDetails[concernRecommendationKey] = concernRecommendationText;
          detailsChanged = true;
      }

      return detailsChanged ? newDetails : prevDetails;
    });
  }, [resolutionText, causedByChangeText, resolvedByChangeText, concernRecommendationText]);
  
  const workgroupsEngagedText = useMemo(() => {
    const keywords = ["paged out", "was paged out", "joined the call", "joined the bridge"];
    const regex = new RegExp(`(.*?)\\s+(${keywords.join('|')})`, 'i');
    
    const parties = new Set<string>();

    timelineEntries.forEach(entry => {
      if (entry.status === 'Update' || entry.status === 'Action') {
        const lines = entry.notes.split('\n');
        lines.forEach(line => {
          const match = line.match(regex);
          if (match && match[1]) {
            const name = match[1].split(':').pop()?.trim();
            if (name) {
              parties.add(name);
            }
          }
        });
      }
    });

    return Array.from(parties).join(', ');
  }, [timelineEntries]);

  useEffect(() => {
    if (!workgroupsEngagedText) return;

    setIncidentDetails(prevDetails => {
        const fieldName = "Workgroups or Individuals engaged";
        const existingValues = new Set((prevDetails[fieldName] || '').split(',').map(s => s.trim()).filter(Boolean));
        const newAutoValues = new Set(workgroupsEngagedText.split(',').map(s => s.trim()).filter(Boolean));

        newAutoValues.forEach(val => existingValues.add(val));
        
        const newFieldText = Array.from(existingValues).join(', ');

        if (prevDetails[fieldName] !== newFieldText) {
            return {
                ...prevDetails,
                [fieldName]: newFieldText
            };
        }

        return prevDetails;
    });
  }, [workgroupsEngagedText]);


  const handlePageout = () => {
    // When a pageout happens, we want to refresh the timeline to see the new entry.
    handleRetrieveIncident();
  }
  
  const handleUploadState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            
            let section = '';
            const newIncidentDetails: Record<string, string> = {};
            const newTimelineEntries: TimelineEntry[] = [];
            let currentTimelineEntry: Partial<TimelineEntry> = {};
            let newTitleIncident = '';

            lines.forEach(line => {
                if (line.startsWith('[Document Title]')) {
                    section = 'title';
                } else if (line.startsWith('--- [Incident Details] ---')) {
                    section = 'incident';
                } else if (line.startsWith('--- [Resolution Details] ---')) {
                    section = 'resolution';
                } else if (line.startsWith('--- [Incident Timeline] ---')) {
                    section = 'timeline';
                } else if (line.trim() === '---' && section === 'timeline') {
                    if (currentTimelineEntry.id && currentTimelineEntry.timestamp && currentTimelineEntry.status) {
                        newTimelineEntries.push({
                            id: currentTimelineEntry.id,
                            timestamp: currentTimelineEntry.timestamp,
                            status: currentTimelineEntry.status,
                            notes: currentTimelineEntry.notes || '',
                        });
                    }
                    currentTimelineEntry = {};
                } else if (section && line.trim()) {
                    const [key, ...valueParts] = line.split(':');
                    const value = valueParts.join(':').trim();
                    switch (section) {
                        case 'title':
                            if (key === 'Priority') setTitlePriority(value);
                            if (key === 'Incident Number') {
                                setTitleIncident(value);
                                newTitleIncident = value;
                            }
                            if (key === 'Short Description') setTitleDescription(value);
                            break;
                        case 'incident':
                        case 'resolution':
                            newIncidentDetails[key.trim()] = value;
                            break;
                        case 'timeline':
                            if(key.trim() === 'id') currentTimelineEntry.id = parseInt(value, 10);
                            if(key.trim() === 'timestamp') currentTimelineEntry.timestamp = value;
                            if(key.trim() === 'status') currentTimelineEntry.status = value;
                            if(key.trim() === 'notes') currentTimelineEntry.notes = value.replace(/\\n/g, '\n');
                            break;
                    }
                }
            });
            
            setIncidentDetails(prev => ({...prev, ...newIncidentDetails}));
            setTimelineEntries(newTimelineEntries);
            toast({ title: `State for ${newTitleIncident} loaded successfully.` });

        } catch (error) {
            console.error("Failed to parse state file:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not parse the state file. It may be corrupted or in the wrong format.' });
        } finally {
             if (event.target) event.target.value = "";
        }
    };
    reader.readAsText(file);
  };


  if (!isLoaded) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <TimelineTitleCard
        titlePriority={titlePriority}
        setTitlePriority={setTitlePriority}
        titleIncident={titleIncident}
        setTitleIncident={setTitleIncident}
        titleDescription={titleDescription}
        setTitleDescription={setTitleDescription}
        isRetrieving={isRetrieving}
        onRetrieve={handleRetrieveIncident}
      />

      <IncidentDetailsCard
        incidentDetails={incidentDetails}
        setIncidentDetails={setIncidentDetails}
        titlePriority={titlePriority}
        titleIncident={titleIncident}
      />
      
      <TimelineEntriesCard
        timelineEntries={timelineEntries}
        setTimelineEntries={setTimelineEntries}
      />

      <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="callout">
               <AccordionTrigger className='text-lg font-semibold'>Pageout</AccordionTrigger>
              <AccordionContent>
                  <CalloutGroupTool onCallout={handlePageout} showAdd={true} showRemove={false} />
              </AccordionContent>
          </AccordionItem>
          <AccordionItem value="resolution">
              <AccordionTrigger className='text-lg font-semibold'>
                  Resolution Details
              </AccordionTrigger>
              <AccordionContent>
                  <ResolutionDetailsCard
                    incidentDetails={incidentDetails}
                    setIncidentDetails={setIncidentDetails}
                  />
              </AccordionContent>
          </AccordionItem>
      </Accordion>

      <ExportCard
        state={state}
        onUploadState={handleUploadState}
      />
    </div>
  );
}

    