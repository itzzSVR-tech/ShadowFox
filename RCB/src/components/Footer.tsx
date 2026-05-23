interface FooterProps {
    minimal?: boolean;
}

export function Footer({ minimal = false }: FooterProps) {
    const links = ["Roster", "Schedule", "Fan Zone", "Contact Us"];

    return (
        <footer
            className="border-t border-border px-6 py-10"
            style={{ background: "var(--rcb-darker)" }}
        >
            <div className="max-w-7xl mx-auto">
                {minimal ? (
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div>
                            <div
                                className="text-5xl font-black tracking-widest mb-2"
                                style={{
                                    color: "var(--rcb-gold)",
                                    fontFamily: "'Bebas Neue', sans-serif",
                                }}
                            >
                                <img
                                    src="/rcb-logo.png"
                                    alt="RCB Logo"
                                    className="h-8"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                &copy; 2026 Royal Challengers Bengaluru. All
                                Rights Reserved.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {links.map((link) => (
                                <button
                                    key={link}
                                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                                >
                                    {link}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div>
                            <div
                                className="text-5xl font-black tracking-widest mb-2"
                                style={{
                                    color: "var(--rcb-gold)",
                                    fontFamily: "'Bebas Neue', sans-serif",
                                }}
                            >
                                <img
                                    src="/rcb-logo.png"
                                    alt="RCB Logo"
                                    className="h-14"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                &copy; 2026 Royal Challengers Bengaluru. All
                                Rights Reserved.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                            {links.map((link) => (
                                <button
                                    key={link}
                                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                                >
                                    {link}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
}
