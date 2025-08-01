
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Timeline Creator" },
    { href: "/timeline-analysis", label: "Timeline Analysis" },
    { href: "/can-report", label: "CAN Report" },
    { href: "/writer", label: "Writing Assistant" },
    { href: "/callout-group", label: "Call Out Group" },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center mx-auto px-4">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <BookOpenCheck className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">
                            IMPACT IM Tool
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname === link.href ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                
                <div className="flex flex-1 items-center justify-between space-x-2 md:hidden">
                     <Link href="/" className="flex items-center space-x-2">
                         <BookOpenCheck className="h-6 w-6 text-primary" />
                         <span className="font-bold">IMPACT IM Tool</span>
                     </Link>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="p-4">
                            <nav className="grid gap-6 text-lg font-medium">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "transition-colors hover:text-foreground/80",
                                            pathname === link.href ? "text-foreground" : "text-foreground/60"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
