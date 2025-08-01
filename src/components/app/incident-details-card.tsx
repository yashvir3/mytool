
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { defaultIncidentDetailFields, defaultNbcuProducts } from "./timeline-creator";

interface IncidentDetailsCardProps {
    incidentDetails: Record<string, string>;
    setIncidentDetails: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    titlePriority: string;
    titleIncident: string;
}

export function IncidentDetailsCard({ incidentDetails, setIncidentDetails, titlePriority, titleIncident }: IncidentDetailsCardProps) {
    const [newWorkgroup, setNewWorkgroup] = useState('');

    const handleDetailChange = (field: string, value: string) => {
        setIncidentDetails(prev => {
        const newDetails = { ...prev, [field]: value };
        if (field === 'Impact Statement' && (prev['Problem Summary'] === prev['Impact Statement'] || !prev['Problem Summary'])) {
            newDetails['Problem Summary'] = value;
        }
        return newDetails;
        });
    };

    const handleAddWorkgroup = () => {
        const trimmedWorkgroup = newWorkgroup.trim();
        if (!trimmedWorkgroup) return;

        setIncidentDetails(prev => {
            const fieldName = "Workgroups or Individuals engaged";
            const existingValues = new Set((prev[fieldName] || '').split(',').map(s => s.trim()).filter(Boolean));
            if (!existingValues.has(trimmedWorkgroup)) {
                existingValues.add(trimmedWorkgroup);
            }
            const newFieldText = Array.from(existingValues).join(', ');
            return { ...prev, [fieldName]: newFieldText };
        });

        setNewWorkgroup('');
    };

    const handleRemoveWorkgroup = (workgroupToRemove: string) => {
        setIncidentDetails(prev => {
            const fieldName = "Workgroups or Individuals engaged";
            const existingValues = (prev[fieldName] || '').split(',').map(s => s.trim()).filter(Boolean);
            const newValues = existingValues.filter(wg => wg !== workgroupToRemove);
            const newFieldText = newValues.join(', ');
            return { ...prev, [fieldName]: newFieldText };
        });
    };

    const workgroupList = (incidentDetails['Workgroups or Individuals engaged'] || '').split(',').map(s => s.trim()).filter(Boolean);
    const nbcuProducts = defaultNbcuProducts;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {defaultIncidentDetailFields.map(field => (
                        <div key={field} className="grid w-full items-center gap-1.5">
                            <Label htmlFor={field.toLowerCase().replace(/ /g, '-')}>{field}</Label>
                            {field === "NBCU Product/ Business Unit" ? (
                                <Select onValueChange={value => handleDetailChange(field, value)} value={incidentDetails[field]}>
                                    <SelectTrigger id={field.toLowerCase().replace(/ /g, '-')}>
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {nbcuProducts.map(product => <SelectItem key={product} value={product}>{product}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            ) : field === "Workgroups or Individuals engaged" ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            id="new-workgroup"
                                            value={newWorkgroup}
                                            onChange={e => setNewWorkgroup(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddWorkgroup()}
                                            placeholder="Add workgroup or individual"
                                        />
                                        <Button onClick={handleAddWorkgroup} type="button">Add</Button>
                                    </div>
                                    {workgroupList.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50 min-h-[40px]">
                                            {workgroupList.map(wg => (
                                                <Badge key={wg} variant="secondary" className="flex items-center gap-1.5">
                                                    {wg}
                                                    <button onClick={() => handleRemoveWorkgroup(wg)} className="rounded-full hover:bg-destructive/20">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Input
                                    id={field.toLowerCase().replace(/ /g, '-')}
                                    value={
                                        field === "Priority" ? titlePriority :
                                        field === "Incident Number" ? titleIncident :
                                        incidentDetails[field] || ''
                                    }
                                    onChange={e => handleDetailChange(field, e.target.value)}
                                    disabled={field === "Priority" || field === "Incident Number"}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
    