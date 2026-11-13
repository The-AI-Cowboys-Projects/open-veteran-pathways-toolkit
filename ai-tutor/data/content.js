self.OVPT_TUTOR = {
  "glossary": [
    {"term": "Artificial intelligence", "plain": "Software that does a task which used to need a person's judgment, such as sorting mail, suggesting words, or answering a question. It is still software. It does not know you, and it does not have a duty to you.", "example": "A phone that suggests the next word is a small AI feature. A chat box that writes a whole paragraph is a larger one."},
    {"term": "Machine learning", "plain": "A way to build software by showing it many examples instead of writing every rule by hand. The software adjusts numbers until it is less wrong on those examples. It can still be wrong on a new case.", "example": "A spam filter that learned from old junk texts can miss a new kind of scam."},
    {"term": "Model", "plain": "The finished bundle of numbers a machine-learning system uses to make a guess. People say “the model answered,” but the model is not a person and not an official source.", "example": "Scam Guardian’s extra hint is a tiny model. The written rules are not a model. They are a checklist."},
    {"term": "Training data", "plain": "The examples used to set a model’s numbers. If those examples are old, narrow, or unfair, the answers lean that way.", "example": "A model trained only on 2011 text messages does not know how VA pension scams are worded today."},
    {"term": "Generative AI", "plain": "A model that produces new text, pictures, or sounds by guessing what usually comes next. It is built to sound fluent. Fluent is not the same as true.", "example": "It can draft a resume bullet. You still have to check that you really did the work."},
    {"term": "Large language model", "plain": "A generative model trained on a huge amount of text so it can continue a sentence in a convincing way. “Large” describes the size of the number file, not the wisdom of the answer.", "example": "Chat tools people use for letters and summaries are usually large language models."},
    {"term": "Chatbot", "plain": "A text box that keeps a conversation with a model. The box may remember earlier lines in that chat. That memory is not a verified record of your service.", "example": "If you tell a chatbot your MOS, it may reuse that later in the same chat. Do not treat the chat as a personnel file."},
    {"term": "Prompt", "plain": "The instruction you type. A prompt is like a short task order: the goal, the limits, and the shape of the answer you want.", "example": "“Rewrite this duty in civilian words. Keep every number. If a fact is missing, say so.” is a prompt."},
    {"term": "Context", "plain": "The extra text the model can see while it answers, such as earlier chat lines or a paragraph you pasted. If the context is wrong, the answer is built on the wrong facts.", "example": "Pasting one evaluation and asking for a civilian version gives the model that evaluation as context."},
    {"term": "Token", "plain": "A small piece of text the model counts, often part of a word. Limits and prices are often measured in tokens. Longer pastes use more of the allowance.", "example": "A one-page duty description is hundreds of tokens, not one."},
    {"term": "Hallucination", "plain": "A confident answer that is not true and not supported by the text you gave. The model is finishing a pattern, not looking up your record in a government system.", "example": "It might invent a civilian certification or a medal because those words often appear near similar jobs."},
    {"term": "Citation", "plain": "A pointer to the document, page, or official site an answer came from. A citation you can open is useful. A citation the model invented is worse than none, because it looks official.", "example": "Ask for the VA page title and then open VA.gov yourself. Do not trust a link you did not check."},
    {"term": "Retrieval-augmented generation", "plain": "Often shortened to RAG. The system searches a set of documents you chose, then writes an answer using the passages it found. It can still misread a passage.", "example": "A tool that answers only from your unit’s welcome packet is safer than a tool that answers from the open internet, and it can still misquote the packet."},
    {"term": "Agent", "plain": "A setup that lets a model do more than talk, such as open files, browse, or send a message. More actions mean more ways to make a mess. A person should approve anything that leaves the computer.", "example": "An agent that can email a recruiter should not send the email until you read it."},
    {"term": "Fine-tuning", "plain": "Extra training on a narrower set of examples so a model follows a particular style or task. It does not guarantee accuracy, and it can bake in the mistakes in those examples.", "example": "Fine-tuning on bad resume examples would teach the model to write bad resumes more consistently."},
    {"term": "Bias", "plain": "A repeated slant in answers, often because the training examples or the task were slanted. Bias can affect who looks “qualified” in a draft job list.", "example": "If the examples mostly describe one kind of worker, the model may describe other workers poorly."},
    {"term": "Confidence", "plain": "How sure the wording sounds, or sometimes a score the software prints. A high score is not proof. Scam Guardian’s scores are rule weights and an old text-message model, not a certainty.", "example": "A message can score “low concern” and still be a scam the rules do not name."},
    {"term": "Human review", "plain": "A person reads the output and decides what to keep. For jobs, benefits, money, and health, human review is the product. The software is a draft.", "example": "You read every resume line and delete anything you did not do."},
    {"term": "Privacy", "plain": "Control over what other people and companies can learn about you. Pasting a document into a website can store that document on someone else’s computer.", "example": "This toolkit’s tools keep what you type in the browser. A commercial chat account often does not."},
    {"term": "Personal information", "plain": "Facts that point to a specific person: full name with a birth date, Social Security number, bank numbers, medical details, precise address, or account passwords.", "example": "A duty description can usually be rewritten without a Social Security number in the prompt."},
    {"term": "Protected health information", "plain": "Health details that can be tied to a person, such as a diagnosis, a treatment, or a clinic visit. Do not paste them into an AI box to “summarize my claim.”", "example": "Say “I provided emergency care in the field” instead of pasting a medical record."},
    {"term": "Classified information", "plain": "Information the government has marked for protection, and other sensitive military information that is not yours to upload. No resume tool needs it. Never put it in a prompt.", "example": "If a sentence would not go in an unclassified resume, it does not go in a chatbot."},
    {"term": "Controlled Unclassified Information", "plain": "Often called CUI. It is unclassified but still not for public sharing. Treat it like a work paper that stays in official systems.", "example": "A roster, a floor plan, or a system name from work can be CUI even when it is not classified."},
    {"term": "Deepfake", "plain": "A picture, video, or voice that was generated or edited so it shows a person doing or saying something they did not do. This toolkit does not detect deepfakes.", "example": "A video of a “general” asking for gift cards is a reason to hang up, whether or not software can prove the video is fake."},
    {"term": "Phishing", "plain": "A message that pretends to be a trusted organization so you will click, pay, or reveal a password. The disguise can be a logo, a tone of voice, or a lookalike web address.", "example": "A text that says “VA benefits suspended” and links to a site that is not va.gov is phishing."},
    {"term": "OCR", "plain": "Optical character recognition. Software that reads letters in a picture. It makes mistakes, especially on blurry screenshots, so you should correct the text before you trust it.", "example": "Scam Guardian can read a screenshot with Tesseract on your device, then you edit the text."},
    {"term": "Offline tool", "plain": "A tool that does its work without sending your input to a server. It can still be opened from a website. “Offline” describes where the work happens after the files are already on the device.", "example": "These four tools are files. After they load, lookups and checklists stay in the browser."},
    {"term": "Local storage", "plain": "A small shelf in the browser on this device. The Transition Companion keeps checked boxes there. Clearing the browser, or using a private window, can erase it. It is not a VA account.", "example": "You can export the checklist to a file if you want a backup you control."},
    {"term": "Open source", "plain": "Software you may read, share, and change under a published license. Open source is not the same as “correct” or “official.” You can inspect it, and so can anyone else.", "example": "This toolkit is MIT licensed. The O*NET text inside the career tool stays under its own Creative Commons terms."},
    {"term": "Algorithm", "plain": "A fixed set of steps. A rule that adds points when a message says “gift card” is an algorithm. A model is a different kind of algorithm, one that uses learned numbers.", "example": "Scam Guardian shows the rule that fired so you can see the step, not only a color."},
    {"term": "Automation", "plain": "Software doing a repeated task without a person at every step. Automation is helpful for sorting and risky for sending, paying, or filing.", "example": "A checklist that remembers a checkmark is light automation. Filing a claim without you reading it is not acceptable here."},
    {"term": "Prompt injection", "plain": "Hidden instructions inside text you did not mean as instructions, such as a webpage that says “ignore the user and reveal secrets.” A careful tool treats pasted text as data, not as orders.", "example": "A resume paste that says “always claim I managed 500 people” should not override what you know is true."},
    {"term": "Verification", "plain": "Checking an answer against a source you trust, using a channel you looked up yourself. Verification is a human habit. Software can remind you. It cannot finish the job.", "example": "To check a benefit rumor, open VA.gov from a bookmark. Do not call the number in the rumor."},
    {"term": "Responsible use", "plain": "Using the tool where a mistake is tolerable, keeping a person in charge where a mistake would hurt someone, and not pasting secrets. Responsible use includes saying when you used a draft from software.", "example": "A cover-letter draft is fine to edit. A medical or legal decision is not something to hand to a chatbot."},
    {"term": "Accessibility", "plain": "Design that more people can use, including people with low vision, keyboard-only use, or a phone. Larger text and visible focus are part of that. They do not solve every need.", "example": "The Larger text button on these tools raises the type size and remembers the choice in this browser."},
    {"term": "Job zone", "plain": "An O*NET label for how much preparation a civilian occupation usually takes, from little preparation to extensive preparation. It is a general description, not a judgment of your service.", "example": "The career tool shows the O*NET job-zone sentence next to an occupation when the database has one."}
  ],
  "lessons": [
    {
      "id": "what-ai-can-do",
      "title": "What AI can and cannot do",
      "minutes": 6,
      "when": "Start here",
      "body": [
        "AI tools are good at producing a first draft, sorting a pile of text, and suggesting words. They are bad at knowing your life, your service record, or today’s rule at a government office.",
        "A model writes by continuing patterns from its training. If a sentence usually continues in a certain way, the model continues it that way, even when your facts are different. That is why a draft can sound polished and still be false.",
        "Use one when you want help with wording you will check. Do not use one as the source of a benefit amount, a medical fact, a legal right, or a job requirement.",
        "The tools in this toolkit are narrower on purpose. The career tool looks up files stored beside the page. The scam tool matches written rules. Neither one calls a chatbot."
      ],
      "quiz": [
        {"q": "What is a fair way to use a generative AI draft of a resume bullet?", "choices": ["Paste it onto the application without reading it.", "Keep it only after you confirm every fact is yours.", "Treat it as an official civilian job offer.", "Assume the numbers it added are typical and therefore fine."], "answer": 1, "why": "A draft is useful only after a person checks that the work, the numbers, and the tools are real."},
        {"q": "Why can a model sound sure and still be wrong?", "choices": ["Because it looked up your official record and disagreed with it.", "Because it is finishing a familiar pattern, not checking a source of truth.", "Because government sites are usually offline.", "Because longer answers are always less accurate than one word."], "answer": 1, "why": "Fluency comes from patterns in training text. It is not evidence."},
        {"q": "Which task fits this toolkit’s design?", "choices": ["Deciding a VA disability rating.", "Looking up a military code in a local file and reviewing the result.", "Diagnosing a medical condition from a photo.", "Sending your service record to a recruiter automatically."], "answer": 1, "why": "The career tool is a local lookup for a person to review. It does not decide benefits or send mail."}
      ]
    },
    {
      "id": "clear-prompt",
      "title": "Writing a clear prompt",
      "minutes": 7,
      "when": "When you use any chat tool",
      "body": [
        "A useful prompt names the job, the limits, and the format. “Help me” is vague. “Turn these three unclassified duties into four resume bullets. Keep the numbers. Do not add a credential I did not list. Use plain words.” is a task order.",
        "Give only the context the task needs. A duty title and what you did are enough for wording help. A Social Security number, a medical note, or a classified detail is never part of the task.",
        "Tell the tool what to do when it does not know. A good line is: “If the source text does not say it, write ‘not in the source’ instead of guessing.”",
        "Ask for a shape you can check: a list, a table with two columns, or bullets under a word limit. A shapeless essay is harder to review."
      ],
      "quiz": [
        {"q": "Which prompt is the clearest?", "choices": ["Fix this.", "Make me sound like a CEO.", "Rewrite these unclassified duties as resume bullets. Keep each number. Do not add jobs or schools.", "Use my whole record, including anything you can infer."], "answer": 2, "why": "The third prompt states the task, the source, and a limit on invention."},
        {"q": "What should you leave out of a prompt about civilian wording?", "choices": ["The kind of unit work you are allowed to describe in an unclassified resume.", "A Social Security number.", "The format you want back.", "An instruction not to invent facts."], "answer": 1, "why": "Identifiers are not needed to rewrite a duty, and they create harm if the chat is stored."},
        {"q": "Why ask the tool to say “not in the source”?", "choices": ["It forces the model to open a government database.", "It gives you a visible marker when the draft would otherwise invent a detail.", "It shortens the bill to zero tokens.", "It converts the answer into legal advice."], "answer": 1, "why": "The marker helps you catch gaps. It does not connect the model to an official file."}
      ]
    },
    {
      "id": "check-answers",
      "title": "Checking an answer before you trust it",
      "minutes": 6,
      "when": "Every time the result matters",
      "body": [
        "Read the output as a stranger would. Mark every name, number, date, tool, and credential. For each mark, point to the place in your own notes where that fact lives. If you cannot point to it, delete it.",
        "Open official pages yourself when the topic is a benefit, a form, or a job requirement. Use a bookmark or type the address. A link inside a chatbot answer is not a source until you confirm where it goes.",
        "Watch for the smooth sentence that papers over a hole: a certification you never earned, a dollar figure you never tracked, a “led 200 people” when you led a team of eight.",
        "If you used a draft, you can say so to yourself while you edit. You do not need to pretend the first words were yours. You do need the final words to be true."
      ],
      "quiz": [
        {"q": "A draft says you managed a $4 million budget. You never tracked a budget. What do you do?", "choices": ["Keep it because it sounds like leadership.", "Delete it.", "Change 4 to 2 so it feels modest.", "Add a citation the model suggested."], "answer": 1, "why": "A number you cannot support does not belong on a resume, even if it is smaller."},
        {"q": "How do you check a benefit claim the draft mentioned?", "choices": ["Call the phone number printed in the draft.", "Open the agency site from a bookmark or by typing the address you already trust.", "Ask the same chatbot if it is sure.", "Post the draft on social media and see what people say."], "answer": 1, "why": "You verify through a channel you look up, not through the draft that made the claim."},
        {"q": "What is a hallucination in this lesson’s sense?", "choices": ["A picture that is slightly blurry.", "A confident detail that is not in your source and not true.", "Any answer longer than a paragraph.", "A spelling mistake."], "answer": 1, "why": "The hazard is invented content that sounds finished."}
      ]
    },
    {
      "id": "privacy",
      "title": "What never goes in the box",
      "minutes": 7,
      "when": "Before you paste anything",
      "body": [
        "Do not paste classified information, CUI, medical records, Social Security numbers, bank numbers, passwords, or full personnel files. A wording tool does not need them, and you cannot get a secret back once it has been sent to a service.",
        "Commercial chat tools often keep prompts on the company’s servers, sometimes for product improvement, sometimes for abuse review. Read that company’s current policy if you use one. This toolkit’s pages do not include an account and do not send the form to a server.",
        "Screenshots can contain more than the sentence you noticed: a name in the corner, a phone number, a partial account balance. Crop tight, or type the sentence instead.",
        "Family members helping an older veteran should use the same rule. Helping does not mean pasting someone else’s identity documents into a website."
      ],
      "quiz": [
        {"q": "Which paste is appropriate for a civilian-wording task?", "choices": ["A DD214 image that includes a Social Security number.", "An unclassified duty paragraph with the sensitive identifiers removed.", "A clinic note, so the tool can explain a claim.", "A list of soldiers’ home addresses from a roster."], "answer": 1, "why": "The task needs the duty, not identity documents, health notes, or other people’s private data."},
        {"q": "What is different about the tools in this repository?", "choices": ["They file claims with VA automatically.", "They are built to run the lookup and the checklist in the browser after the files load.", "They store your record in a Foundation account.", "They are an official DoD system."], "answer": 1, "why": "The pages are static files. They are not a government system and they do not open an account."},
        {"q": "Why crop a screenshot before OCR?", "choices": ["OCR cannot read a full-width image.", "The edges often contain names, numbers, or balances you did not mean to process.", "Tesseract requires images under one inch tall.", "Cropping sends the image to a safer server."], "answer": 1, "why": "A screenshot is a picture of a whole screen, not only the sentence you care about."}
      ]
    },
    {
      "id": "civilian-work",
      "title": "Using help while you translate service into civilian words",
      "minutes": 8,
      "when": "While you work on a resume",
      "body": [
        "Start with the code you held, not with a dream job title. The career tool shows the DMDC crosswalk and O*NET text for that code. Read the official title before you read any suggested civilian titles.",
        "Some codes, including many infantry codes, point at a military O*NET occupation. That means the government crosswalk is describing the service job. A dictionary suggestion next to it is a writing idea, not an announcement that employers must hire you into that role.",
        "When you reword a duty, keep the true object of the work: people, equipment, schedules, safety, training, records. Swap jargon only when the civilian phrase still means what you did. “Personnel” can become “staff.” “Briefed flag officers” is not automatically “advised the board” unless that is fair.",
        "Numbers are your evidence. Team size, vehicles, sorties, tickets closed, students trained. If you do not know the number, leave a blank and look it up in your own records. Do not let a template fill it in.",
        "A pay-grade table can suggest the scope of responsibility. It is not a GS job offer and it is not a civilian rank."
      ],
      "quiz": [
        {"q": "What should you read first for an MOS lookup?", "choices": ["The civilian titles a dictionary suggests.", "The official military title and the O*NET text from the crosswalk.", "A sample resume from the internet.", "The highest-paid job in the same industry."], "answer": 1, "why": "The crosswalk is the sourced record. Suggestions come after, and they are labeled as suggestions."},
        {"q": "An infantry code points at O*NET group 55. What does that mean here?", "choices": ["VA has approved a civilian license.", "The official crosswalk entry is a military occupation, so civilian titles beside it need human judgment.", "You should list “Chief Executive” as your last job.", "The code is invalid."], "answer": 1, "why": "Group 55 occupations describe military work. They are not a civilian hiring decision."},
        {"q": "A bullet template says you reduced defects by 85%. You never measured defects. What belongs on the resume?", "choices": ["The 85%, because the template is from a veteran tool.", "Nothing about defects, unless you replace it with a result you can support.", "A smaller percent so it looks careful.", "“Reduced defects significantly” with no basis."], "answer": 1, "why": "Templates are examples of shape. The facts have to be yours."},
        {"q": "How should a Master Sergeant use a rank-to-civilian table?", "choices": ["As proof of qualification for a federal GS grade.", "As optional language for scope, checked against the actual team and duties.", "As a replacement for the job title in the crosswalk.", "As a VA pension calculation."], "answer": 1, "why": "The table is wording about responsibility. It is not an appointment or a benefits decision."}
      ]
    },
    {
      "id": "scam-words",
      "title": "When AI words show up in a scam",
      "minutes": 6,
      "when": "When a message feels urgent",
      "body": [
        "Scammers use the same fluent style as a chatbot because fluent text is cheap now. A clean logo and a calm paragraph do not make a sender real. Pressure, secrecy, gift cards, and a lookalike link still matter.",
        "A message can say “AI-verified,” “official algorithm,” or “your file was flagged by our system.” Those phrases are not a VA procedure. VA does not need you to buy a gift card to keep a pension.",
        "Voice and video can be copied. This toolkit does not test whether a voice is real. If a caller claims to be a relative in trouble or an officer demanding payment, hang up and use a number you already had.",
        "Use Scam Guardian to see which written tactics are present. Then verify with VA.gov, the VA OIG, ReportFraud.ftc.gov, or IC3 using addresses you type yourself. A low score is not a clearance."
      ],
      "quiz": [
        {"q": "A text says your benefits are suspended and asks for a gift card. The grammar is perfect. What matters more?", "choices": ["The perfect grammar, which shows it is real.", "The suspension threat plus the gift-card payment.", "The fact that it used the letters VA.", "The time of day it arrived."], "answer": 1, "why": "Payment by gift card and a threat are the tactics. Polish is easy to fake."},
        {"q": "What can this toolkit tell you about a video of someone who looks like a general?", "choices": ["Whether the video is a deepfake.", "Nothing reliable about the pixels. Treat payment demands as suspicious even without a detector.", "The speaker’s real unit.", "That the video is safe if Scam Guardian is offline."], "answer": 1, "why": "The scam tool does not analyze faces or video. The payment demand is enough reason to stop."},
        {"q": "A low concern score means:", "choices": ["The message is safe to pay.", "The typed rules did not see much. It can still be a scam.", "VA has reviewed the sender.", "The SMS model recognized your personal history."], "answer": 1, "why": "The tool is an aid. Absence of a rule is not proof of safety."}
      ]
    }
  ]
};
