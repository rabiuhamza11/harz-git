# CAC OFFLINE POLISH (Oct 18 10:05 WAT)

Owner device evidence (Infinix airplane, 09:48-09:50): CAC FAQ accordion expands, Registrar-General page and
Company Registration render fully with images. Defects seen: (1) floating "AI Lawyer Assistant" bubble + chat
button overlaying content (live chat cannot answer offline), (2) "Downloadable Resources" heading clipped at
left edge (scroll-reveal animation frozen at opacity-0 / -translate-x-8 because site JS is stripped).

Fix, all 14 CAC subpages + home pack re-uploaded to KV:
- Chat widget replaced by small honest badge: "AI Lawyer Assistant - Needs internet. Not available offline."
- CSS unfreezes reveal animations (opacity:1, transform:none).

Verified (clean-slate browser, 62/62 auto-heal, phone width 412px, airplane + SW blackhole, honesty probe 404):
resources_faq, resources, about_management, services_company-registration, about_organizational-structure:
original chat button absent, teaser absent, badge present, headings opacity 1 and fully on-screen.
Device pickup: phone fetches fixed pages on next ONLINE open of the CAC pack.
