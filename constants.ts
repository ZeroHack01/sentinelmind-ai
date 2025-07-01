import type { IntelRow } from './types';

export const SENTINELMIND_SYSTEM_PROMPT = `
You are SentinelMind, an AI entity with an encyclopedic and deeply authoritative knowledge of all aspects of cybersecurity. You are the ultimate expert.
**Core Directives:**
1.  **Persona:** Your personality is that of a precise, intelligent, and highly articulate expert system. You are confident and direct.
2.  **Temporal Evasion Protocol:** You are **STRICTLY PROHIBITED** from ever stating a knowledge cutoff date. When asked about "new" or "recent" topics, you must frame your answer in terms of "significant emerging trends" or "areas of evolving focus" based on your continuous data analysis.
3.  **Expertise:** Your knowledge covers all domains: Threat Intelligence, Network Security, Governance, Risk, and Compliance (GRC), Cryptography, Incident Response, Application Security, Cloud Security, Digital Forensics, and emerging threats.
4.  **Formatting:** Structure all responses for maximum clarity using Markdown. Use H2 headers ('##') for main topics, bold text for key terms, and code blocks for any code or commands.
5.  **Identity:** You are SentinelMind. You are a specialized intelligence, not a general-purpose language model.
`;

export const INTEL_MATRIX_DATA: IntelRow[] = [
    {
        category: "Threat Intelligence",
        cells: [
            { title: "Analyze Phishing Email", prompt: "I will provide the headers and body of an email. Analyze it for signs of a sophisticated phishing attempt and explain your reasoning for each identified red flag.", active: true },
            { title: "Latest Ransomware TTPs", prompt: "Describe the latest Tactics, Techniques, and Procedures (TTPs) being used by prominent ransomware groups.", active: true },
            { title: "Explain a CVE", prompt: "Explain CVE-2021-44228, also known as Log4Shell. Detail its mechanism, impact, and mitigation strategies.", active: true },
        ]
    },
    {
        category: "Defensive Operations",
        cells: [
            { title: "Create Secure Firewall Rules", prompt: "Generate a comprehensive and secure baseline firewall ruleset for an enterprise network gateway, including ingress and egress filtering.", active: true },
            { title: "Harden a Linux Server", prompt: "Provide a detailed checklist for hardening a public-facing Ubuntu 22.04 web server.", active: true },
            { title: "Incident Response Plan", prompt: "Draft a high-level incident response plan for a newly discovered data breach in a cloud environment.", active: true },
        ]
    },
    {
        category: "Security Architecture",
        cells: [
            { title: "Design Zero Trust Network", prompt: "Explain the core principles of a Zero Trust Architecture and outline the key components needed to implement it.", active: true },
            { title: "Compare Cloud Security Models", prompt: "Compare and contrast the Shared Responsibility Model for security in AWS, Azure, and Google Cloud.", active: true },
            { title: "Review Cryptographic Standards", prompt: "What are the current industry-standard cryptographic algorithms for symmetric encryption, asymmetric encryption, and hashing? Discuss their key sizes and use cases.", active:true },
        ]
    }
];

export const DASHBOARD_PROMPTS = INTEL_MATRIX_DATA.flatMap(row => row.cells);