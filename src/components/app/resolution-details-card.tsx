
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { defaultResolutionDetailFields } from "./timeline-creator";

interface ResolutionDetailsCardProps {
    incidentDetails: Record<string, string>;
    setIncidentDetails: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function ResolutionDetailsCard({ incidentDetails, setIncidentDetails }: ResolutionDetailsCardProps) {
    const handleDetailChange = (field: string, value: string) => {
        setIncidentDetails(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resolution Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {defaultResolutionDetailFields.map(field => (
                        <div key={field} className="grid w-full items-center gap-1.5">
                            <Label htmlFor={field.toLowerCase().replace(/ /g, '-')}>{field}</Label>
                                {
                                field.toLowerCase() === "resolution" || 
                                field.toLowerCase() === "caused by change" ||
                                field.toLowerCase() === "concern/recommendation"
                                ? (
                                <Textarea
                                    id={field.toLowerCase().replace(/ /g, '-')}
                                    value={incidentDetails[field] || ''}
                                    readOnly
                                    disabled
                                    className="min-h-[100px] bg-muted/50"
                                    placeholder={
                                        field.toLowerCase() === 'resolution'
                                        ? "Auto-populated from timeline entry with 'Resolved Comms' status."
                                        : field.toLowerCase() === 'caused by change'
                                        ? "Auto-populated from 'Caused by Change' status."
                                        : "Auto-populated from timeline entries with 'Concern' or 'Recommendation' status."
                                    }
                                />
                                ) : field.toLowerCase() === 'resolved by change' ? (
                                <Input
                                    id={field.toLowerCase().replace(/ /g, '-')}
                                    value={incidentDetails[field] || ''}
                                    readOnly
                                    disabled
                                    className="bg-muted/50"
                                    placeholder="Auto-populated from 'Resolved by Change' status."
                                />
                            ) : (
                                <Input
                                    id={field.toLowerCase().replace(/ /g, '-')}
                                    value={incidentDetails[field] || ''}
                                    onChange={e => handleDetailChange(field, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
    