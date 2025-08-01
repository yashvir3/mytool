
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Trash2, Send, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { loadIncidentState, saveTimelineState } from '@/lib/timeline-store';
import { formatInTimeZone } from 'date-fns-tz';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type TimelineEntry = {
    id: number;
    timestamp: string;
    status: string;
    notes: string;
};

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


export function CanReportTool() {
  const [incidentNumber, setIncidentNumber] = useState('');
  const [condition, setCondition] = useState('');
  const [action, setAction] = useState('');
  const [need, setNeed] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [previousReports, setPreviousReports] = useState<TimelineEntry[]>([]);
  const { toast } = useToast();

  const fetchPreviousReports = useCallback(async (incNum: string) => {
    if (!incNum) {
        setPreviousReports([]);
        return;
    };
    setIsFetching(true);
    try {
        const state = await loadIncidentState(incNum);
        if (state && state.timelineEntries) {
            const canReports = state.timelineEntries
                .filter(entry => entry.status === 'CAN Report')
                .sort((a, b) => b.id - a.id); // Sort by most recent first
            setPreviousReports(canReports);
        } else {
            setPreviousReports([]);
        }
    } catch (e) {
        console.error("Failed to fetch previous CAN reports", e);
        // Do not toast here to avoid bothering user
    } finally {
        setIsFetching(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce(fetchPreviousReports, 500), [fetchPreviousReports]);

  useEffect(() => {
    debouncedFetch(incidentNumber);
  }, [incidentNumber, debouncedFetch]);

  const generateReportText = () => {
    return `Condition:\n${condition}\n\nAction:\n${action}\n\nNeed:\n${need}`;
  };

  const handleCopy = () => {
    if (!condition && !action && !need) {
        toast({
            variant: "destructive",
            title: "Nothing to copy",
            description: "Please fill out at least one field.",
        });
        return;
    }
    const report = generateReportText();
    navigator.clipboard.writeText(report).then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
        toast({ title: 'CAN Report copied to clipboard!'});
    }).catch(err => {
        toast({ variant: 'destructive', title: 'Failed to copy report.'});
    });
  };

  const handlePublish = async () => {
    if (!incidentNumber) {
        toast({ variant: 'destructive', title: 'Incident Number required.'});
        return;
    }
     if (!condition && !action && !need) {
        toast({
            variant: "destructive",
            title: "Nothing to publish",
            description: "Please fill out at least one field.",
        });
        return;
    }
    setIsPublishing(true);
    try {
        let existingState = await loadIncidentState(incidentNumber);

        if (!existingState) {
             toast({ variant: 'destructive', title: "Incident not found", description: `Could not find incident ${incidentNumber} on the server.` });
            return;
        }
        
        const newTimelineEntry: TimelineEntry = {
            id: Date.now(),
            timestamp: formatInTimeZone(new Date(), 'UTC', 'dd-MM-yyyy, HH:mm \'UTC\''),
            status: 'CAN Report',
            notes: generateReportText(),
        };

        const updatedState = {
            ...existingState,
            timelineEntries: [...existingState.timelineEntries, newTimelineEntry],
        };

        await saveTimelineState(incidentNumber, updatedState);
        setPreviousReports(prev => [newTimelineEntry, ...prev].sort((a, b) => b.id - a.id));
        toast({ title: 'CAN Report published successfully!' });
    } catch(e) {
        console.error("Failed to publish CAN report:", e);
        toast({ variant: 'destructive', title: 'Failed to publish report.'});
    } finally {
        setIsPublishing(false);
    }
  };

  const handleClear = () => {
    setCondition('');
    setAction('');
    setNeed('');
    toast({ title: 'Fields cleared.' });
  };

  return (
    <div className="space-y-8">
        <div className="grid gap-2">
            <Label htmlFor="incident-number-can">Incident Number</Label>
            <div className='relative'>
                <Input 
                    id="incident-number-can"
                    value={incidentNumber}
                    onChange={e => setIncidentNumber(e.target.value)}
                    placeholder="Enter incident number to publish to its timeline"
                />
                {isFetching && <Loader2 className="absolute right-2 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
        </div>

        {previousReports.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Previous CAN Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {previousReports.map((report) => (
                            <AccordionItem key={report.id} value={`item-${report.id}`}>
                                <AccordionTrigger>
                                    Published at {report.timestamp}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Textarea readOnly value={report.notes} className="min-h-[150px] bg-muted/50 font-mono text-xs" />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        )}

      <div className="space-y-6">
        <div className="grid gap-4">
            <div className="grid gap-2">
            <Label htmlFor="condition">Condition</Label>
            <Textarea
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Describe the current situation, what happened, and what the impact is."
                className="min-h-[120px]"
            />
            </div>
            <div className="grid gap-2">
            <Label htmlFor="action">Action</Label>
            <Textarea
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What actions are currently being taken to address the condition?"
                className="min-h-[120px]"
            />
            </div>
            <div className="grid gap-2">
            <Label htmlFor="need">Need</Label>
            <Textarea
                id="need"
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                placeholder="What resources, support, or information do you need to resolve the situation?"
                className="min-h-[120px]"
            />
            </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-6 border-t">
            <Button
                variant="ghost"
                onClick={handleClear}
                disabled={!condition && !action && !need}
                className="text-muted-foreground w-full sm:w-auto"
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" onClick={handleCopy} className="w-full">
                    {hasCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy
                </Button>
                <Button onClick={handlePublish} disabled={isPublishing || !incidentNumber} className="w-full">
                    {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Publish
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
