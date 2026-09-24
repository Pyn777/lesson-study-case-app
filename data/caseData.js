export const sharedCase = {
  title: "Summer Camp Gastrointestinal Outbreak",
  intro:
    "Several campers develop vomiting, diarrhea, dehydration, and possible electrolyte disturbances after a shared meal. You will revisit the same case through different biological lenses.",
};

export const modules = {
  "cellular-foundation": {
    order: 1,
    course: "General Biology / A&P I",
    lens: "Cellular Foundation",
    colorClass: "moduleBlue",
    caseUpdate:
      "A camper has had repeated vomiting and diarrhea for 18 hours. The camper reports intense thirst and dizziness. You are asked to explain how fluid loss changes the movement of water across cell membranes.",
    caseFinding: {
      label: "Cellular finding",
      summary:
        "Water loss makes the extracellular environment relatively more concentrated, so water shifts out of cells by osmosis. This provides the cellular basis for the camper's fluid imbalance.",
      evidence: [
        "Repeated vomiting and diarrhea for 18 hours",
        "Intense thirst and dizziness",
        "Cellular water movement depends on extracellular solute concentration",
      ],
    },
    objectives: [
      "Relate diffusion and osmosis to fluid shifts.",
      "Apply tonicity concepts to a dehydration scenario.",
      "Explain why membrane transport is foundational to whole-body fluid balance.",
    ],
    questions: [
      {
        id: "cell-1",
        construct: "membrane-transport",
        cognitiveLevel: "apply",
        itemRole: "discipline",
        discipline: "General Biology / A&P I",
        transferType: "near-transfer",
        conceptTag: "osmosis-tonicity",
        prompt:
          "If extracellular fluid becomes more concentrated because of water loss, what is the most likely immediate effect on nearby cells?",
        choices: [
          "Water moves into the cells and they swell.",
          "Water moves out of the cells and they shrink.",
          "Solute leaves the cells until concentrations are equal.",
          "No net movement of water occurs.",
        ],
        answer: 1,
        explanation:
          "A more concentrated extracellular environment is hypertonic relative to the cell, so water moves out by osmosis.",
      },
      {
        id: "cell-2",
        construct: "membrane-transport",
        cognitiveLevel: "understand",
        itemRole: "discipline",
        discipline: "General Biology / A&P I",
        transferType: "foundational",
        conceptTag: "osmosis",
        prompt:
          "Which process best explains the movement of water across a selectively permeable membrane?",
        choices: ["Active transport", "Osmosis", "Endocytosis", "Exocytosis"],
        answer: 1,
        explanation:
          "Osmosis is the passive movement of water across a selectively permeable membrane.",
      },
      {
        id: "cell-3",
        construct: "fluid-electrolyte-balance",
        cognitiveLevel: "apply",
        itemRole: "anchor",
        discipline: "General Biology / A&P I",
        transferType: "cross-disciplinary",
        conceptTag: "integrated-fluid-balance",
        anchorId: "fluid-balance-throughline",
        prompt:
          "Why is membrane transport relevant to the larger dehydration case?",
        choices: [
          "It explains how cells and fluid compartments respond to changes in solute concentration.",
          "It directly identifies the bacterial pathogen.",
          "It determines which antibiotic should be prescribed.",
          "It replaces kidney regulation of body fluids.",
        ],
        answer: 0,
        explanation:
          "Membrane transport provides the cellular mechanism underlying fluid shifts across tissues and body compartments.",
      },
    ],
  },
  microbiology: {
    order: 2,
    course: "Microbiology",
    lens: "Infectious-Disease Lens",
    colorClass: "moduleGreen",
    caseUpdate:
      "Additional campers develop similar symptoms. Stool and culture findings suggest a bacterial source. The microbiology team must identify the likely organism and connect the infection to the campers' fluid loss.",
    caseFinding: {
      label: "Microbiology finding",
      summary:
        "The pattern is consistent with an infectious gastrointestinal source. Culture observations and biochemical testing provide the evidence needed to narrow the bacterial identity and explain the cause of the fluid loss.",
      evidence: [
        "Multiple campers develop similar gastrointestinal symptoms",
        "Culture findings suggest a bacterial source",
        "Biochemical test patterns help distinguish bacterial isolates",
      ],
    },
    objectives: [
      "Use culture and biochemical evidence to narrow bacterial identity.",
      "Connect pathogen activity to gastrointestinal fluid loss.",
      "Explain how microbiological findings contribute to the shared case.",
    ],
    questions: [
      {
        id: "micro-1",
        construct: "microbial-identification",
        cognitiveLevel: "apply",
        itemRole: "discipline",
        discipline: "Microbiology",
        transferType: "near-transfer",
        conceptTag: "bacterial-identification",
        prompt:
          "Which finding would be most useful for distinguishing among bacterial isolates in a teaching laboratory?",
        choices: [
          "Biochemical test pattern",
          "Student age",
          "Urine color alone",
          "Heart rate alone",
        ],
        answer: 0,
        explanation:
          "Biochemical test patterns are commonly used with other laboratory observations to distinguish bacterial isolates.",
      },
      {
        id: "micro-2",
        construct: "fluid-electrolyte-balance",
        cognitiveLevel: "apply",
        itemRole: "anchor",
        discipline: "Microbiology",
        transferType: "cross-disciplinary",
        conceptTag: "integrated-fluid-balance",
        anchorId: "fluid-balance-throughline",
        prompt:
          "How does the microbiology portion connect most directly to the shared dehydration case?",
        choices: [
          "It identifies a possible infectious cause of the gastrointestinal fluid loss.",
          "It measures glomerular filtration rate directly.",
          "It explains osmosis without reference to illness.",
          "It replaces assessment of fluid and electrolyte balance.",
        ],
        answer: 0,
        explanation:
          "The microbiology lens helps explain the cause of the illness that produces the fluid-loss problem studied in the other courses.",
      },
      {
        id: "micro-3",
        construct: "microbial-identification",
        cognitiveLevel: "analyze",
        itemRole: "discipline",
        discipline: "Microbiology",
        transferType: "near-transfer",
        conceptTag: "microbiology-reasoning",
        prompt:
          "Which sequence best reflects the microbiology reasoning process in this case?",
        choices: [
          "Culture evidence → biochemical testing → organism identification",
          "Blood pressure → nephron filtration → organism identification",
          "Tonicity → osmosis → Gram reaction",
          "Urine concentration → membrane potential → culture isolation",
        ],
        answer: 0,
        explanation:
          "Culture observations and biochemical testing can be combined to support bacterial identification.",
      },
    ],
  },
  "renal-response": {
    order: 3,
    course: "A&P II",
    lens: "Systems / Renal Perspective",
    colorClass: "modulePurple",
    caseUpdate:
      "The camper remains dehydrated. Blood volume and pressure are reduced, and the kidneys must conserve water while helping maintain electrolyte balance.",
    caseFinding: {
      label: "Renal finding",
      summary:
        "Reduced body water lowers blood volume and pressure. The kidneys respond by conserving water and adjusting electrolyte handling, producing a smaller volume of more concentrated urine.",
      evidence: [
        "Persistent dehydration",
        "Reduced blood volume and blood pressure",
        "Renal compensation increases water conservation",
      ],
    },
    objectives: [
      "Relate nephron function to water and electrolyte conservation.",
      "Connect hormonal compensation to dehydration.",
      "Integrate kidney responses with earlier cellular and microbiological findings.",
    ],
    questions: [
      {
        id: "renal-1",
        construct: "renal-homeostasis",
        cognitiveLevel: "apply",
        itemRole: "discipline",
        discipline: "A&P II",
        transferType: "near-transfer",
        conceptTag: "renal-water-conservation",
        prompt:
          "During dehydration, which response would help conserve body water?",
        choices: [
          "Decreased water reabsorption by the kidneys",
          "Increased water reabsorption by the kidneys",
          "Complete cessation of filtration",
          "Loss of all sodium in the urine",
        ],
        answer: 1,
        explanation:
          "The kidneys respond to dehydration by increasing water conservation, producing a smaller volume of more concentrated urine.",
      },
      {
        id: "renal-2",
        construct: "renal-homeostasis",
        cognitiveLevel: "apply",
        itemRole: "discipline",
        discipline: "A&P II",
        transferType: "near-transfer",
        conceptTag: "nephron-fluid-balance",
        prompt:
          "Why is nephron physiology important in this case?",
        choices: [
          "It explains how the body adjusts urine formation in response to fluid loss.",
          "It identifies the bacterial species directly.",
          "It determines membrane phospholipid structure.",
          "It prevents all changes in extracellular fluid concentration.",
        ],
        answer: 0,
        explanation:
          "Nephron function is central to adjusting water and electrolyte handling during dehydration.",
      },
      {
        id: "renal-3",
        construct: "fluid-electrolyte-balance",
        cognitiveLevel: "analyze",
        itemRole: "anchor",
        discipline: "A&P II",
        transferType: "cross-disciplinary",
        conceptTag: "integrated-fluid-balance",
        anchorId: "fluid-balance-throughline",
        prompt:
          "Which statement best integrates the three disciplinary lenses?",
        choices: [
          "The pathogen may cause fluid loss, membrane transport explains cellular fluid shifts, and the kidneys help restore homeostasis.",
          "The pathogen directly performs kidney filtration.",
          "Osmosis identifies the pathogen while the kidneys control bacterial metabolism.",
          "Each discipline addresses a completely unrelated problem.",
        ],
        answer: 0,
        explanation:
          "The case links cause, cellular consequences, and whole-body compensation across the three courses.",
      },
    ],
  },
};

export const integratedQuestions = [
  {
    id: "integrated-1",
    construct: "fluid-electrolyte-balance",
    cognitiveLevel: "analyze",
    itemRole: "anchor",
    discipline: "Integrated",
    transferType: "far-transfer",
    conceptTag: "integrated-fluid-balance",
    anchorId: "fluid-balance-throughline",
    prompt:
      "Which sequence best represents the shared case across disciplines?",
    choices: [
      "Infection → gastrointestinal fluid loss → altered fluid distribution → renal compensation",
      "Renal compensation → infection → osmosis → culture identification",
      "Osmosis → pathogen mutation → filtration stops → dehydration resolves",
      "Culture identification → no fluid loss → renal shutdown → recovery",
    ],
    answer: 0,
    explanation:
      "The interdisciplinary throughline connects an infectious cause to fluid loss, cellular fluid shifts, and homeostatic compensation.",
  },
  {
    id: "integrated-2",
    construct: "interdisciplinary-integration",
    cognitiveLevel: "analyze",
    itemRole: "transfer",
    discipline: "Integrated",
    transferType: "far-transfer",
    conceptTag: "interdisciplinary-transfer",
    prompt:
      "What is the strongest reason to revisit the same case in multiple courses?",
    choices: [
      "To show how different biological levels contribute to understanding one problem.",
      "To make every course teach identical content.",
      "To replace discipline-specific learning outcomes.",
      "To avoid assessing students within individual courses.",
    ],
    answer: 0,
    explanation:
      "The shared case is useful because each course contributes a different level of explanation while retaining its own learning outcomes.",
  },
];


export const integratedFinding = {
  label: "Integrated case conclusion",
  summary:
    "The case now links an infectious gastrointestinal cause to fluid loss, cellular water shifts, and renal compensation. The disciplines contribute different levels of explanation to the same developing problem.",
  evidence: [
    "Infectious process produces gastrointestinal fluid loss",
    "Membrane transport explains cellular fluid shifts",
    "Kidney responses help restore fluid and electrolyte homeostasis",
  ],
};
