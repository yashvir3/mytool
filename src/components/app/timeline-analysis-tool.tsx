
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Copy, Check } from 'lucide-react';
import { generateSummary, GenerateSummaryInput } from '@/ai/flows/generate-summary';
import { format } from 'date-fns';
import { loadIncidentState } from '@/lib/timeline-store';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function TimelineAnalysisTool() {
  const { toast } = useToast();
  const [incidentNumber, setIncidentNumber] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [summary, setSummary] = useState('');
  const [loadingAction, setLoadingAction] = useState<GenerateSummaryInput['summaryType'] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const lastIncident = localStorage.getItem('timelineCreator_incidentNumber');
    if (lastIncident) {
      setIncidentNumber(lastIncident);
      handleFetchTimeline(lastIncident);
    }
  }, []);

  useEffect(() => {
    if (summary) {
        localStorage.setItem('timelineAnalysis_summary', summary);
    }
  }, [summary]);

  const generateReportTextFromState = (state: any) => {
    const {
        titlePriority,
        titleIncident,
        titleDescription,
        incidentDetails,
        timelineEntries,
    } = state;

    const documentTitle = `${format(new Date(), 'dd-MM-yyyy')} - ${titlePriority || '[Priority]'} - ${titleIncident || '[IncidentNumber]'} - ${titleDescription || '[ShortDescription]'}`;

    const defaultIncidentDetailFields = [
      "Incident Number", "Priority", "Incident Manager", "Timeline Scribe", "Bridge Link",
      "NBCU Product/ Business Unit", "Impacted Devices", "Services/Products Impacted",
      "Workgroups or Individuals engaged", "Impact Statement",
    ];

    const defaultResolutionDetailFields = [
        "Resolution", "Caused by Change", "Resolved by Change", "Root Cause/Trigger",
        "Related to Problem", "Workaround", "Concern/Recommendation", "Problem Number", "Problem Summary"
    ];

    let report = `Document Title: ${documentTitle}\n\n`;
    report += `Short Description: ${titleDescription || 'N/A'}\n\n`;

    report += `--- Incident Details ---\n`;
    defaultIncidentDetailFields.forEach(field => {
      const value = field === "Incident Number" ? titleIncident : field === "Priority" ? titlePriority : incidentDetails[field];
      report += `${field}: ${value || 'N/A'}\n`;
    });
    report += '\n';

    report += '--- Incident Timeline ---\n';
    if (timelineEntries && timelineEntries.length > 0) {
      timelineEntries.forEach((entry: any) => {
        report += `Time: ${entry.timestamp}\n`;
        report += `Status: ${entry.status}\n`;
        report += `Notes:\n${entry.notes || 'N/A'}\n\n`;
      });
    } else {
      report += 'No timeline entries.\n\n';
    }

    report += `--- Resolution Details ---\n`;
    defaultResolutionDetailFields.forEach(field => {
      report += `${field}: ${incidentDetails[field] || 'N/A'}\n`;
    });
    report += '\n';

    return report;
  };

  const handleFetchTimeline = async (incNum: string) => {
    if (!incNum) {
      toast({ variant: 'destructive', title: 'Please enter an Incident Number.'});
      return;
    }
    setIsFetching(true);
    setDocumentText('');
    setSummary('');

    try {
        const savedState = await loadIncidentState(incNum);
        if (savedState) {
            const reportText = generateReportTextFromState(savedState);
            setDocumentText(reportText);
            localStorage.setItem('timelineAnalysis_incidentNumber', incNum);
            toast({ title: `Timeline for ${incNum} loaded.`});
        } else {
            setDocumentText('');
            toast({ variant: 'destructive', title: 'Not Found', description: `No timeline data found for incident ${incNum}.`});
        }
    } catch (error) {
        console.error("Failed to load timeline data from server", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch timeline data.'});
    } finally {
        setIsFetching(false);
    }
  }

  const analyzeWithRetry = async (
    params: GenerateSummaryInput,
    retries = 2,
    delay = 1000
  ): Promise<any> => {
    try {
      return await generateSummary(params);
    } catch (error: any) {
      const isRetryable = error.message?.includes('503') || error.message?.toLowerCase().includes('overloaded');
      
      if (isRetryable && retries > 0) {
        console.warn(`AI service overloaded. Retrying in ${delay}ms... (${retries} retries left)`);
        toast({
          title: "AI Service is busy",
          description: `Retrying... (${retries} attempts left)`,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        return analyzeWithRetry(params, retries - 1, delay * 2);
      }
      throw error;
    }
  };


  const handleAnalyze = async (summaryType: GenerateSummaryInput['summaryType']) => {
    if (!documentText.trim()) {
      toast({
        variant: "destructive",
        title: "Text is empty",
        description: "Please provide some text to analyze.",
      });
      return;
    }
    
    setLoadingAction(summaryType);
    setSummary('');

    try {
      const result = await analyzeWithRetry({ documentText, summaryType });
      setSummary(result.summary);
      toast({
        title: "Analysis Complete",
        description: "The summary has been generated below.",
      });
    } catch (error) {
      console.error("Failed to analyze timeline:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "The AI service is currently unavailable or the request failed. Please try again later.",
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary).then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
        toast({ title: 'Summary copied to clipboard!'});
    }).catch(err => {
        toast({ variant: 'destructive', title: 'Failed to copy summary.'});
    });
  }

  const isLoading = loadingAction !== null;

  return (
    <div className="space-y-6">
       <div className="grid gap-2">
            <label htmlFor="incident-number-analysis" className="block text-sm font-medium text-muted-foreground">
              Incident Number
            </label>
            <div className="flex gap-2">
                <Input
                    id="incident-number-analysis"
                    value={incidentNumber}
                    onChange={(e) => setIncidentNumber(e.target.value)}
                    placeholder="Enter incident number to load timeline"
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchTimeline(incidentNumber)}
                />
                <Button onClick={() => handleFetchTimeline(incidentNumber)} disabled={isFetching || !incidentNumber}>
                    {isFetching ? <Loader2 className="animate-spin" /> : 'Fetch Timeline'}
                </Button>
            </div>
      </div>
      <div>
        <label htmlFor="document-text" className="block text-sm font-medium text-muted-foreground mb-2">
          Incident Timeline Document
        </label>
        <Textarea
          id="document-text"
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder="The text from the fetched incident timeline will appear here. You can also paste text directly."
          className="min-h-[250px] bg-muted/30 font-mono text-xs"
          disabled={isLoading || isFetching}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-4">
        <Button onClick={() => handleAnalyze('technical')} disabled={!documentText || isLoading || isFetching}>
          {loadingAction === 'technical' ? <Loader2 className="animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          Technical Summary
        </Button>
        <Button onClick={() => handleAnalyze('pir')} disabled={!documentText || isLoading || isFetching}>
          {loadingAction === 'pir' ? <Loader2 className="animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          Post-Incident Review
        </Button>
      </div>
      {summary && (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="relative">
                <Textarea
                    readOnly
                    value={summary}
                    className="min-h-[300px] whitespace-pre-wrap font-mono text-sm bg-muted"
                    aria-label="Analysis Summary"
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2"
                    onClick={handleCopy}
                    >
                    {hasCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    <span className="sr-only">Copy summary</span>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
