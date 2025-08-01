
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, Loader2, Search } from "lucide-react";
import { format } from "date-fns-tz";

interface TimelineTitleCardProps {
    titlePriority: string;
    setTitlePriority: (value: string) => void;
    titleIncident: string;
    setTitleIncident: (value: string) => void;
    titleDescription: string;
    setTitleDescription: (value: string) => void;
    isRetrieving: boolean;
    onRetrieve: (incNum?: string) => void;
}

export function TimelineTitleCard({
    titlePriority, setTitlePriority,
    titleIncident, setTitleIncident,
    titleDescription, setTitleDescription,
    isRetrieving, onRetrieve
}: TimelineTitleCardProps) {
    const [hasCopied, setHasCopied] = useState(false);
    const { toast } = useToast();

    const documentTitle = useMemo(() => {
        const datePart = format(new Date(), 'dd-MM-yyyy');
        const priorityPart = titlePriority || '[Priority]';
        const incidentPart = titleIncident || '[IncidentNumber]';
        const descriptionPart = titleDescription || '[ShortDescription]';
        return `${datePart} - ${priorityPart} - ${incidentPart} - ${descriptionPart}`;
    }, [titlePriority, titleIncident, titleDescription]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Title</CardTitle>
                <CardDescription>Enter the details to automatically generate the document title.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={titlePriority} onValueChange={setTitlePriority}>
                            <SelectTrigger id="priority">
                                <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="P1">P1</SelectItem>
                                <SelectItem value="P2">P2</SelectItem>
                                <SelectItem value="P3">P3</SelectItem>
                                <SelectItem value="P4">P4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="incident-number">Incident Number</Label>
                        <div className="flex gap-2">
                            <Input id="incident-number" value={titleIncident} onChange={e => setTitleIncident(e.target.value)} placeholder="e.g., INC123456" />
                             <Button onClick={() => onRetrieve()} disabled={isRetrieving || !titleIncident}>
                                {isRetrieving ? <Loader2 className="animate-spin" /> : <Search />}
                                Retrieve Incident
                            </Button>
                        </div>
                    </div>
                </div>
                 <div>
                    <Label htmlFor="short-description">Short Description</Label>
                    <Input id="short-description" value={titleDescription} onChange={e => setTitleDescription(e.target.value)} placeholder="e.g., API Latency Issue" />
                </div>
                <div className="p-2 bg-muted rounded-md text-sm font-mono text-muted-foreground flex justify-between items-center">
                    <span>{documentTitle}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            navigator.clipboard.writeText(documentTitle);
                            setHasCopied(true);
                            setTimeout(() => setHasCopied(false), 2000);
                            toast({ title: 'Title copied to clipboard!'});
                        }}
                    >
                        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
    