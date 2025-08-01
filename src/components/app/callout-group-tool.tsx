
"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PhoneOutgoing, Loader2, Trash2, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadIncidentState, saveTimelineState } from '@/lib/timeline-store';
import { loadTeamNames, saveTeamNames } from '@/lib/team-store';
import { formatInTimeZone } from 'date-fns-tz';

interface CalloutGroupToolProps {
  onCallout?: () => void;
  showAdd?: boolean;
  showRemove?: boolean;
}

export function CalloutGroupTool({ onCallout, showAdd = true, showRemove = true }: CalloutGroupToolProps) {
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [incidentSummary, setIncidentSummary] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTeams() {
      try {
        const teams = await loadTeamNames();
        setTeamNames(teams.sort());
      } catch (e) {
        console.error("Failed to load teams", e);
        toast({ variant: 'destructive', title: 'Failed to load team list.' });
      } finally {
        setIsLoadingTeams(false);
      }
    }
    fetchTeams();
  }, [toast]);

  const handleAddTeam = async () => {
    const trimmedName = newTeamName.trim();
    if (!trimmedName || teamNames.includes(trimmedName)) {
      toast({
        variant: 'destructive',
        title: trimmedName ? 'Team already exists' : 'Team name cannot be empty',
      });
      return;
    }
    const updatedTeams = [...teamNames, trimmedName].sort();
    try {
      await saveTeamNames(updatedTeams);
      setTeamNames(updatedTeams);
      setNewTeamName('');
      toast({ title: 'Team added successfully!' });
    } catch (e) {
      console.error("Failed to save new team", e);
      toast({ variant: 'destructive', title: 'Failed to add team.' });
    }
  };

  const handleRemoveTeam = async (teamToRemove: string) => {
    const updatedTeams = teamNames.filter(name => name !== teamToRemove);
    try {
      await saveTeamNames(updatedTeams);
      setTeamNames(updatedTeams);
      toast({ title: `"${teamToRemove}" removed.` });
    } catch (e) {
      console.error("Failed to remove team", e);
      toast({ variant: 'destructive', title: 'Failed to remove team.' });
    }
  };

  const filteredTeams = teamNames.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCallOutClick = (teamName: string) => {
    const incNumber = localStorage.getItem('timelineCreator_incidentNumber') || '';
    const incDesc = localStorage.getItem('timelineCreator_shortDescription') || '';
    const incPriority = localStorage.getItem('timelineCreator_priority') || '';
    const bridgeLink = localStorage.getItem('timelineCreator_bridgeLink') || '';

    let summaryText = '';
    if (incNumber && incDesc) {
        summaryText = `${incNumber}: ${incDesc}`;
    } else if (incNumber) {
        summaryText = incNumber;
    } else if (incDesc) {
        summaryText = incDesc;
    }

    const descText = `Hi Team, We have an ongoing issue for "${incDesc || '[Description not set]'}" and an MS teams bridge is currently in progress. We need your assistance. To join the call please join the bridge ${bridgeLink || '[Bridge Link not set]'}`;
    
    setIncidentSummary(summaryText);
    setSeverity(incPriority);
    setDescription(descText);
    setSelectedTeam(teamName);
    setIsDialogOpen(true);
  };

  const handleSendCallOut = async () => {
    const incidentNumber = localStorage.getItem('timelineCreator_incidentNumber');
    if (!incidentNumber) {
        toast({ variant: 'destructive', title: "No active incident", description: "Please create or retrieve an incident in the Timeline Creator first." });
        return;
    }
    if (!selectedTeam) return;

    setIsSending(true);
    try {
        let existingState = await loadIncidentState(incidentNumber);
        if (!existingState) {
            toast({ variant: 'destructive', title: "Incident not found", description: `Could not find incident ${incidentNumber} on the server.` });
            return;
        }

        const newTimelineEntry = {
            id: Date.now(),
            timestamp: formatInTimeZone(new Date(), 'UTC', 'dd-MM-yyyy, HH:mm \'UTC\''),
            status: 'Action',
            notes: `${selectedTeam} was paged out.`,
        };

        const updatedState = {
            ...existingState,
            timelineEntries: [...existingState.timelineEntries, newTimelineEntry],
        };

        await saveTimelineState(incidentNumber, updatedState);
        toast({ title: "Call out sent!", description: "Timeline has been updated with the action." });
        setIsDialogOpen(false);
        onCallout?.();

    } catch (e) {
        console.error("Failed to send call out and update timeline", e);
        toast({ variant: 'destructive', title: "Failed to send", description: "Could not update the incident timeline." });
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {showAdd && (
        <div className="flex gap-2">
          <Input
            placeholder="Add a new team..."
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTeam()}
          />
          <Button onClick={handleAddTeam}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Team
          </Button>
        </div>
      )}

      <Input
        placeholder="Search for a team..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      
      {isLoadingTeams ? (
        <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ScrollArea className="h-96 w-full rounded-md border p-4">
            <div className="space-y-2">
            {filteredTeams.map(team => (
                <div key={team} className="flex items-center justify-between p-2 rounded-md hover:bg-muted group">
                <span className="text-sm">{team}</span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCallOutClick(team)}>
                        <PhoneOutgoing className="h-4 w-4 mr-2" />
                        Call Out
                    </Button>
                    {showRemove && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveTeam(team)} className='text-destructive opacity-0 group-hover:opacity-100'>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove team</span>
                      </Button>
                    )}
                </div>
                </div>
            ))}
            {filteredTeams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No teams found.</p>
            )}
            </div>
        </ScrollArea>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Call Out: {selectedTeam}</DialogTitle>
            <DialogDescription>
              Fill in the details to send a call out notification.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="incident-summary">Incident Summary</Label>
              <Input 
                id="incident-summary" 
                value={incidentSummary}
                onChange={(e) => setIncidentSummary(e.target.value)}
                placeholder="e.g., INC12345: API Latency Issue" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1">P1 (Critical)</SelectItem>
                  <SelectItem value="P2">P2 (High)</SelectItem>
                  <SelectItem value="P3">P3 (Medium)</SelectItem>
                  <SelectItem value="P4">P4 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Provide a brief description of the issue." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input id="recipient" value={selectedTeam || ''} readOnly className="bg-muted/50" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSendCallOut} disabled={isSending}>
                {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
