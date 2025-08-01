
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { defaultTimelineStatuses, TimelineEntry } from "./timeline-creator";
import { AutoSizingTextarea } from "../ui/auto-sizing-textarea";

interface TimelineEntriesCardProps {
    timelineEntries: TimelineEntry[];
    setTimelineEntries: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
}

export function TimelineEntriesCard({ timelineEntries, setTimelineEntries }: TimelineEntriesCardProps) {
    const timelineStatuses = defaultTimelineStatuses;

    const addTimelineEntry = () => {
        const newEntry: TimelineEntry = {
          id: Date.now(),
          timestamp: formatInTimeZone(new Date(), 'UTC', 'dd-MM-yyyy, HH:mm') + ' UTC',
          status: timelineStatuses[0] || 'Update',
          notes: '',
        };
        setTimelineEntries(prev => [...prev, newEntry]);
    };

    const handleTimelineChange = (id: number, field: 'status' | 'notes' | 'timestamp', value: string) => {
        setTimelineEntries(prev =>
        prev.map(entry => (entry.id === id ? { ...entry, [field]: value } : entry))
        );
    };
    
    const removeTimelineEntry = (id: number) => {
        setTimelineEntries(prev => prev.filter(entry => entry.id !== id));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Timeline Entries</CardTitle>
                <CardDescription>Add and edit timeline entries for the incident.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Timestamp (UTC)</TableHead>
                            <TableHead className="w-[200px]">Status</TableHead>
                            <TableHead>Incident Notes</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {timelineEntries.length > 0 ? timelineEntries.map(entry => (
                            <TableRow key={entry.id}>
                                <TableCell>
                                    <Input
                                        value={entry.timestamp}
                                        onChange={e => handleTimelineChange(entry.id, 'timestamp', e.target.value)}
                                        className="font-medium text-sm"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select value={entry.status} onValueChange={value => handleTimelineChange(entry.id, 'status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timelineStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <AutoSizingTextarea
                                        value={entry.notes}
                                        onChange={e => handleTimelineChange(entry.id, 'notes', e.target.value)}
                                        placeholder="Enter details..."
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeTimelineEntry(entry.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    No timeline entries yet. Click 'Add Entry' to start.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
                <Button onClick={addTimelineEntry} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Entry
                </Button>
            </CardFooter>
        </Card>
    );
}
    