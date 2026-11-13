self.OVPT_RULES = [
  {
    "id": "benefits-impersonation",
    "title": "Benefits-agency impersonation",
    "weight": 2,
    "pattern": "\\b(this is the (?:department of veterans affairs|va|v\\.a\\.)|veterans affairs (?:office|department|representative|hotline)|calling from the va|official va (?:notice|alert|representative))\\b",
    "why": "Scammers often open by claiming they already are the VA, Social Security, or another agency. A real agency does not need you to trust a surprise message.",
    "action": "Do not use the number or link in the message. Open VA.gov yourself, or call the number printed on mail you already have from VA.",
    "source": "https://benefits.va.gov/BENEFITS/fraud-prevention.asp",
    "sourceName": "VA benefits fraud prevention"
  },
  {
    "id": "account-threat",
    "title": "Threat to suspend benefits or an account",
    "weight": 2,
    "pattern": "\\b((?:benefits?|pension|compensation|account) (?:are|is|have been|has been|will be) (?:suspended|frozen|cancelled|canceled|terminated|locked)|warrant for your arrest|failure to (?:respond|verify) will)\\b",
    "why": "Fear of a sudden cutoff is a common push. VA explains that pension and compensation fraud often uses pressure, not a calm notice you can check later.",
    "action": "Stop the conversation. Sign in to VA.gov from a bookmark, or call a published VA number, before you change anything.",
    "source": "https://benefits.va.gov/BENEFITS/fraud-prevention.asp",
    "sourceName": "VA benefits fraud prevention"
  },
  {
    "id": "secrets-request",
    "title": "Request for identity, banking, or login secrets",
    "weight": 3,
    "pattern": "\\b(social security(?: number)?|\\bssn\\b|date of birth|routing number|bank account|debit card|credit card number|one[- ]time (?:code|passcode|pin)|password|login code|full ssn)\\b",
    "why": "Messages that ask for a Social Security number, a one-time code, or bank details are collecting what a thief needs to take over an account or a payment.",
    "action": "Do not read codes aloud or type them into a link from the message. A real VA or bank login will not ask you to hand a password to a stranger.",
    "source": "https://www.vaoig.gov/",
    "sourceName": "VA Office of Inspector General"
  },
  {
    "id": "payment-demand",
    "title": "Gift card, wire, or crypto payment",
    "weight": 3,
    "pattern": "\\b(?:pay|send|buy|purchase|load)\\b[\\s\\S]{0,40}\\b(?:gift cards?|google play|steam card|itunes card)\\b|\\b(?:gift cards?)\\b[\\s\\S]{0,40}\\b(?:pay|fee|payment|settle)\\b|\\b(?:wire transfer|western union|moneygram|bitcoin|crypto wallet|cash app|zelle)\\b",
    "why": "Gift cards, wires, and crypto are favorite ways to take money that is hard to get back. Government benefit offices do not collect claim fees that way.",
    "action": "Do not buy a card or send money. If a benefit payment is really due, it moves through official VA payment channels, not a gift card.",
    "source": "https://reportfraud.ftc.gov/",
    "sourceName": "FTC ReportFraud"
  },
  {
    "id": "pension-poaching",
    "title": "Pension poaching",
    "weight": 3,
    "pattern": "\\b(?:hide your assets|move your assets|irrevocable trust|buy an annuity)\\b|\\b(?:pension|aid and attendance)\\b[\\s\\S]{0,80}\\b(?:fee|guarantee|annuity|trust|up[- ]?front|percent|sign over)\\b|\\b(?:lump sum)\\b[\\s\\S]{0,40}\\b(?:pension|benefits)\\b",
    "why": "Pension poaching is a known scheme aimed at older veterans and survivors. Advisors push asset transfers, annuities, or a cut of the benefit so someone can look eligible.",
    "action": "Do not move savings or sign a contract from this message. Read VA's pension pages and use a VA-accredited representative if you want help with a claim.",
    "source": "https://www.va.gov/pension/",
    "sourceName": "VA pension"
  },
  {
    "id": "claims-fee",
    "title": "Fee or guaranteed claim approval",
    "weight": 3,
    "pattern": "\\b(?:guaranteed (?:approval|rating|benefits)|increase your (?:disability )?rating|processing fee|up[- ]?front fee|percent of (?:your )?(?:back pay|benefits)|get you (?:\\d+%|100%))\\b",
    "why": "Nobody honest can guarantee a VA rating or demand a cut of back pay before a claim exists. Unaccredited people are not allowed to charge for preparing an initial claim.",
    "action": "Check accreditation with VA before you sign or pay. You can file a claim yourself or with a free accredited helper.",
    "source": "https://www.va.gov/ogc/accred_faqs.asp",
    "sourceName": "VA accreditation FAQ"
  },
  {
    "id": "romance",
    "title": "Romance or deployed-stranger money request",
    "weight": 2,
    "pattern": "\\b(?:i love you|my darling|deployed soldier|stranded overseas|we can be together if you send)\\b",
    "why": "Romance scams build trust, sometimes with a military identity, and then ask for money or secrecy. Photos and rank talk can be copied.",
    "action": "Do not send money or private photos. Talk with someone you know in person before you continue.",
    "source": "https://www.ic3.gov/",
    "sourceName": "FBI Internet Crime Complaint Center"
  },
  {
    "id": "suspicious-link",
    "title": "Lookalike or shortened link",
    "weight": 2,
    "pattern": "https?://(?:\\d{1,3}\\.){3}\\d{1,3}\\b|\\b(?:bit\\.ly|tinyurl\\.com)/|https?://(?:www\\.)?(?!va\\.gov\\b|vaoig\\.gov\\b|benefits\\.va\\.gov\\b)(?![a-z0-9.-]+\\.(?:mil|gov)\\b)[a-z0-9.-]*(?:va|veteran)[a-z0-9.-]*",
    "why": "Links that imitate VA or use a shortener hide the real site. A lookalike domain can steal a password even when the page looks familiar.",
    "action": "Do not tap the link. Type va.gov into the browser yourself if you need a VA page.",
    "source": "https://www.ic3.gov/",
    "sourceName": "FBI Internet Crime Complaint Center"
  },
  {
    "id": "prize",
    "title": "Prize, lottery, or surprise inheritance",
    "weight": 2,
    "pattern": "\\b(?:you (?:have )?won|lottery|sweepstakes|unclaimed (?:funds|inheritance)|beneficiary of (?:an )?inheritance|prize money)\\b",
    "why": "Unexpected prizes and inheritances are a classic lure, often followed by a fee or a request for bank details.",
    "action": "You do not have to pay to receive a real prize. Delete the message if you did not enter a contest.",
    "source": "https://reportfraud.ftc.gov/",
    "sourceName": "FTC ReportFraud"
  },
  {
    "id": "family-emergency",
    "title": "Family emergency or bail request",
    "weight": 3,
    "pattern": "\\b(?:grandma|grandfather|it's your grand(?:son|daughter)|in jail|bail money|don't tell (?:mom|dad|anyone))\\b",
    "why": "Emergency family stories try to rush an older adult into sending money before a relative can be reached.",
    "action": "Hang up and call the family member on a number you already know. Do not use the number in the message.",
    "source": "https://reportfraud.ftc.gov/",
    "sourceName": "FTC ReportFraud"
  },
  {
    "id": "remote-access",
    "title": "Remote-access tech support",
    "weight": 3,
    "pattern": "\\b(?:anydesk|teamviewer|remote access|microsoft (?:support|refund)|let me control your computer|install this app so i can fix)\\b",
    "why": "Unsolicited tech-support calls use remote-control software to empty accounts or install more fraud.",
    "action": "Do not install software or share a screen. If a computer has a problem, use a repair shop you choose.",
    "source": "https://reportfraud.ftc.gov/",
    "sourceName": "FTC ReportFraud"
  },
  {
    "id": "charity-pressure",
    "title": "Pressured veteran-charity appeal",
    "weight": 2,
    "pattern": "\\b(?:disabled veteran|veterans? charity|sponsor a veteran)\\b[\\s\\S]{0,70}\\b(?:gift card|wire|cash app|urgent|donate now)\\b",
    "why": "Fake charity pitches use veterans' service as emotional pressure and then demand an unusual payment.",
    "action": "Give only through a charity you look up on your own. Do not pay a charity with a gift card.",
    "source": "https://www.vaoig.gov/",
    "sourceName": "VA Office of Inspector General"
  },
  {
    "id": "va-loan",
    "title": "VA loan refinance pressure",
    "weight": 2,
    "pattern": "\\b(?:va loan|irrrl|refinance your (?:va )?mortgage)\\b[\\s\\S]{0,60}\\b(?:lowest rate|guaranteed|act now|processing fee|up[- ]?front)\\b",
    "why": "Loan offers that guarantee a VA rate and rush a fee are a known pitch against homeowners who used a VA mortgage.",
    "action": "Compare any refinance with your current lender using a phone number from your statement, not from this message.",
    "source": "https://www.va.gov/",
    "sourceName": "VA.gov"
  },
  {
    "id": "urgency",
    "title": "High-pressure urgency or secrecy",
    "weight": 1,
    "pattern": "\\b(?:act now|immediately|within 24 hours|final notice|last warning|do not tell anyone|stay on the line)\\b",
    "why": "A short deadline or a demand for secrecy keeps a person from asking a friend, a family member, or the real agency.",
    "action": "Take time. A legitimate benefit question can wait long enough for you to verify it.",
    "source": "https://benefits.va.gov/BENEFITS/fraud-prevention.asp",
    "sourceName": "VA benefits fraud prevention"
  }
];
