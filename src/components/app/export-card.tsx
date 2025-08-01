
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns-tz";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown } from "lucide-react";
import { defaultIncidentDetailFields, defaultResolutionDetailFields, TimelineEntry } from "./timeline-creator";

interface ExportCardProps {
    state: {
        titlePriority: string;
        titleIncident: string;
        titleDescription: string;
        incidentDetails: Record<string, string>;
        timelineEntries: TimelineEntry[];
    };
    onUploadState: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ExportCard({ state, onUploadState }: ExportCardProps) {
    const { toast } = useToast();
    const { titlePriority, titleIncident, titleDescription, incidentDetails, timelineEntries } = state;
    
    const documentTitle = `${format(new Date(), 'dd-MM-yyyy')} - ${titlePriority || '[Priority]'} - ${titleIncident || '[IncidentNumber]'} - ${titleDescription || '[ShortDescription]'}`;

    const handleDownloadState = () => {
        let textState = `[Document Title]\n`;
        textState += `Priority: ${titlePriority}\n`;
        textState += `Incident Number: ${titleIncident}\n`;
        textState += `Short Description: ${titleDescription}\n\n`;

        textState += `--- [Incident Details] ---\n`;
        for (const key in incidentDetails) {
            if (defaultIncidentDetailFields.includes(key)) {
                textState += `${key}: ${incidentDetails[key]}\n`;
            }
        }
        textState += `\n`;

        textState += `--- [Resolution Details] ---\n`;
        for (const key in incidentDetails) {
            if (defaultResolutionDetailFields.includes(key)) {
                textState += `${key}: ${incidentDetails[key]}\n`;
            }
        }
        textState += `\n`;

        textState += `--- [Incident Timeline] ---\n`;
        timelineEntries.forEach(entry => {
            textState += `id: ${entry.id}\n`;
            textState += `timestamp: ${entry.timestamp}\n`;
            textState += `status: ${entry.status}\n`;
            textState += `notes: ${entry.notes.replace(/\n/g, '\\n')}\n`;
            textState += `---\n`;
        });

        const blob = new Blob([textState], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const fileName = `${titleIncident || 'INCIDENT'}-${titlePriority || 'PRIORITY'}-${titleDescription || 'DESCRIPTION'}.txt`;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'State downloaded successfully.' });
    };

    const handleDownloadPdf = () => {
        if (!titleIncident) {
        toast({
            variant: 'destructive',
            title: 'Incident Number Required',
            description: 'Please enter an Incident Number before downloading.',
        });
        return;
        }
        if (!documentTitle || (!titleDescription && timelineEntries.length === 0 && Object.values(incidentDetails).every(v => v === ''))) {
        toast({
            variant: 'destructive',
            title: 'Not enough data',
            description: 'Please fill in the title and at least one detail or timeline entry.',
        });
        return;
        }
        
        try {
            const doc = new jsPDF();
            let yPos = 22;
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            const titleLines = doc.splitTextToSize(documentTitle, 180);
            doc.text(titleLines, 14, yPos);
            yPos += (titleLines.length * 7) + 6;
            
            const finalIncidentDetails = {
            ...incidentDetails,
            "Priority": titlePriority,
            "Incident Number": titleIncident,
            };

            const headerColor = titlePriority === 'P1' ? [255, 0, 0] : [41, 162, 220];
            
            const incidentDetailsBody = defaultIncidentDetailFields.map(field => [field, finalIncidentDetails[field] || 'N/A']);
            autoTable(doc, {
                startY: yPos,
                head: [['Incident Details', 'Details']],
                body: incidentDetailsBody,
                theme: 'grid',
                headStyles: { fillColor: headerColor },
                styles: {
                cellPadding: 2,
                fontSize: 10,
                valign: 'middle',
                },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 'auto' },
                }
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
        
            if (yPos > 270) {
                doc.addPage();
                yPos = 22;
            }

            const timelineBody = timelineEntries.map(entry => [
                entry.timestamp,
                entry.status,
                entry.notes,
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Timestamp (UTC)', 'Status', 'Incident Notes']],
                body: timelineBody,
                theme: 'grid',
                headStyles: { fillColor: headerColor },
                styles: {
                cellPadding: 2,
                fontSize: 10,
                valign: 'middle',
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 'auto' },
                }
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
            
            if (yPos > 270) {
                doc.addPage();
                yPos = 22;
            }

            const resolutionDetailsBody = defaultResolutionDetailFields.map(field => [field, finalIncidentDetails[field] || 'N/A']);
            autoTable(doc, {
                startY: yPos,
                head: [['Resolution Details', 'Details']],
                body: resolutionDetailsBody,
                theme: 'grid',
                headStyles: { fillColor: headerColor },
                styles: {
                cellPadding: 2,
                fontSize: 10,
                valign: 'middle',
                },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 'auto' },
                }
            });

            doc.save(`${documentTitle}.pdf`);
            toast({
                title: "PDF Downloaded",
                description: "The report has been successfully generated.",
            });
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            toast({
                variant: "destructive",
                title: "PDF Generation Failed",
                description: "An unexpected error occurred while creating the PDF.",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Export</CardTitle>
                <CardDescription>Download or import the incident report.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap justify-start gap-4">
                    <Button onClick={handleDownloadPdf}>
                        <FileDown className="mr-2" />
                        Download PDF
                    </Button>
                    <Button variant="secondary" onClick={handleDownloadState}>
                        Download for Reconvene
                    </Button>
                    <Button variant="secondary" asChild>
                        <Label htmlFor="upload-state-file" className="cursor-pointer">
                            Upload for Reconvene
                        </Label>
                    </Button>
                    <Input id="upload-state-file" type="file" className="hidden" accept=".txt" onChange={onUploadState} />
                </div>
            </CardContent>
        </Card>
    );
}
    