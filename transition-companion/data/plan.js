self.OVPT_PLAN = {
  "phases": [
    {
      "id": "early",
      "title": "12 to 24 months before separation",
      "when": "before",
      "window": [12, 24],
      "items": [
        {"id": "tap-overview", "text": "Learn what Transition Assistance (TAP) requires for your service and put the workshop on a calendar you control.", "href": "https://www.tapevents.mil/", "hrefLabel": "TAP events"},
        {"id": "records-copy", "text": "Request your own service records and keep unclassified copies in a place you control.", "href": "https://www.va.gov/records/get-military-service-records/", "hrefLabel": "VA records request"},
        {"id": "translate-code", "text": "Look up your MOS, rating, or AFSC in the Career Pathway Translator and write down the official title before you invent a civilian one.", "tool": "../career-pathway-translator/index.html", "toolLabel": "Open Career Pathway Translator"},
        {"id": "budget", "text": "List income, debt, and housing costs for the household. Do not put account numbers into any of these tools."},
        {"id": "family-talk", "text": "If a spouse, partner, or adult child is helping, agree who keeps documents and who does not click surprise links."}
      ]
    },
    {
      "id": "year",
      "title": "6 to 12 months before separation",
      "when": "before",
      "window": [6, 12],
      "items": [
        {"id": "skillbridge", "text": "If you are eligible and your command allows it, read the official SkillBridge description before you sign anything with an employer.", "href": "https://www.skillbridge.mil/", "hrefLabel": "SkillBridge"},
        {"id": "cool-look", "text": "Use the official DoD COOL site for credential ideas. This checklist only links there. It does not copy COOL’s catalogs.", "href": "https://www.cool.osd.mil/", "hrefLabel": "DoD COOL"},
        {"id": "resume-draft", "text": "Draft resume bullets from duties you can support. Run unclassified wording through the career tool’s dictionary, then delete anything you did not do.", "tool": "../career-pathway-translator/index.html", "toolLabel": "Reword a duty"},
        {"id": "ai-basics", "text": "If you will use a chatbot for drafts, take the Plain-English AI Tutor lessons on prompts, checking answers, and what not to paste.", "tool": "../ai-tutor/index.html", "toolLabel": "Open AI Tutor"},
        {"id": "mynextmove", "text": "Explore civilian occupations on My Next Move for Veterans. That site is a government tool. This page does not copy its results.", "href": "https://www.mynextmove.org/vets/", "hrefLabel": "My Next Move for Veterans"}
      ]
    },
    {
      "id": "half",
      "title": "About 90 to 180 days before separation",
      "when": "before",
      "window": [3, 6],
      "items": [
        {"id": "tap-complete", "text": "Finish the TAP steps your service requires and save the completion paper with your other records.", "href": "https://www.dodtap.mil/dodtap/", "hrefLabel": "DoD TAP"},
        {"id": "va-claim-learn", "text": "Read how disability compensation works on VA.gov. This checklist cannot tell you whether to file or what rating to expect.", "href": "https://www.va.gov/disability/", "hrefLabel": "VA disability compensation"},
        {"id": "accredited", "text": "If you want help with a claim, use a VA-accredited representative. Do not pay a stranger who guarantees a rating.", "href": "https://www.va.gov/ogc/accred_faqs.asp", "hrefLabel": "VA accreditation FAQ"},
        {"id": "health-plan", "text": "Decide how health care will work for you and your family after separation, using VA’s own application pages if VA care is the path.", "href": "https://www.va.gov/forms/10-10ez/apply-va-healthcare/", "hrefLabel": "Apply for VA health care"},
        {"id": "scam-drill", "text": "Show the household what a benefits scam looks like. Practice with Scam Guardian on a sample message, not on a real letter that contains your identifiers.", "tool": "../scam-guardian/index.html", "toolLabel": "Open Scam Guardian"}
      ]
    },
    {
      "id": "last",
      "title": "Last 90 days on active duty",
      "when": "before",
      "window": [0, 3],
      "items": [
        {"id": "dd214-plan", "text": "Know how you will receive your separation documents and where the unclassified copies will live.", "href": "https://www.archives.gov/veterans/military-service-records", "hrefLabel": "National Archives veterans records"},
        {"id": "job-search", "text": "Compare civilian postings with the O*NET descriptions from your code lookup. A posting that demands a clearance you cannot discuss in public still does not belong in a chatbot.", "tool": "../career-pathway-translator/index.html", "toolLabel": "Review your code"},
        {"id": "dol-vets", "text": "Find the Department of Labor’s veterans’ employment programs and a local American Job Center through DOL VETS.", "href": "https://www.dol.gov/agencies/vets", "hrefLabel": "DOL VETS"},
        {"id": "gi-bill", "text": "If education is part of the plan, read the GI Bill overview on VA.gov before you pay a school deposit.", "href": "https://www.va.gov/education/about-gi-bill-benefits/", "hrefLabel": "About GI Bill benefits"},
        {"id": "leave-money", "text": "Write down final pay questions to ask your finance office. Do not email full bank details to a “helper” who contacted you first."}
      ]
    },
    {
      "id": "first90",
      "title": "First 90 days as a civilian",
      "when": "after",
      "window": [-3, 0],
      "items": [
        {"id": "va-gov-account", "text": "Create or sign in to your own VA.gov account from the address you typed. Ignore messages that offer to do it for a fee.", "href": "https://www.va.gov/", "hrefLabel": "VA.gov"},
        {"id": "benefits-letter", "text": "Read any decision letter slowly. If a company offers to raise the rating for a percentage of back pay, stop and check accreditation.", "href": "https://www.va.gov/ogc/accred_faqs.asp", "hrefLabel": "Who may help with a claim"},
        {"id": "fraud-page", "text": "Keep VA’s fraud-prevention page handy. Report identity or benefits fraud rather than arguing with the sender.", "href": "https://benefits.va.gov/BENEFITS/fraud-prevention.asp", "hrefLabel": "VA fraud prevention"},
        {"id": "work-words", "text": "Update the resume with the job you actually landed or the applications you can document. Re-run only unclassified lines through the translator.", "tool": "../career-pathway-translator/index.html", "toolLabel": "Career Pathway Translator"},
        {"id": "older-helpers", "text": "If a parent or older veteran is getting calls about pension or “aid and attendance,” sit with them and use Scam Guardian on the wording, with personal numbers removed.", "tool": "../scam-guardian/index.html", "toolLabel": "Check the wording"}
      ]
    },
    {
      "id": "first-year",
      "title": "The rest of the first civilian year",
      "when": "after",
      "window": [-12, -3],
      "items": [
        {"id": "pension-read", "text": "If pension or survivor benefits are even a question, read VA’s pension pages. Do not move savings because a salesperson said to.", "href": "https://www.va.gov/pension/", "hrefLabel": "VA pension"},
        {"id": "employment-va", "text": "Look at VA careers and hiring paths only through VA’s site if federal employment is a goal.", "href": "https://www.va.gov/careers-employment/", "hrefLabel": "VA careers and employment"},
        {"id": "small-business", "text": "If you are considering a business, start with SBA’s veteran counseling pages, not with a cold caller.", "href": "https://www.sba.gov/counseling/grow-your-business/#veteran-owned", "hrefLabel": "SBA veteran-owned business help"},
        {"id": "report", "text": "If money or identity was lost, file with FTC ReportFraud and, for internet crime, with the FBI’s IC3.", "href": "https://reportfraud.ftc.gov/", "hrefLabel": "ReportFraud.ftc.gov"},
        {"id": "ic3", "text": "Keep the IC3 address for internet crime complaints.", "href": "https://www.ic3.gov/", "hrefLabel": "IC3"},
        {"id": "oig", "text": "VA benefit fraud can also be reported to the VA Office of Inspector General.", "href": "https://www.vaoig.gov/", "hrefLabel": "VA OIG"},
        {"id": "keep-learning", "text": "Revisit the AI tutor before you try a new chatbot feature. The words change faster than the habits: check facts, keep secrets out, and do not pay a stranger.", "tool": "../ai-tutor/index.html", "toolLabel": "Review the tutor"}
      ]
    }
  ]
};
