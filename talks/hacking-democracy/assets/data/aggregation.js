window.KK_AGGREGATION = {
  source_file: "images/KKW_Infokarten_Grafiken_platziert_MES.pdf",
  source_title: "Method of Equal Shares",
  source_page: 1,
  source_sha256: "76daa803214ba38e62eb7ce7b751049032eb83e29ea47a5e1583b177ff7ecfdb",
  status: "Simplified example with invented data, as labelled in the source handout",
  people: ["Anna", "Miro", "Jasmin"],
  budget_per_person: 1000,
  points_per_person: 7,
  maximum_points_per_project: 2,
  projects: [
    {
      id: "creative",
      name: "Creative Club",
      cost: 1000,
      points: [2, 1, 2],
    },
    {
      id: "experimental",
      name: "Experimental Event",
      cost: 800,
      points: [2, 2, 0],
    },
    {
      id: "auto",
      name: "Auto Ausstellung",
      cost: 1200,
      points: [2, 1, 1],
    },
    {
      id: "dance",
      name: "Dance Disco",
      cost: 600,
      points: [1, 2, 0],
    },
    {
      id: "folklore",
      name: "Folklore Fest",
      cost: 1800,
      points: [0, 1, 2],
    },
    {
      id: "bilder",
      name: "Bilder Buch",
      cost: 600,
      points: [0, 0, 2],
    },
  ],
  scope:
    "This walkthrough follows the simplified handout: its printed order, equal starting budgets and cost contributions proportional to points. It is not a general MES implementation or a reconstruction of the 2025 or 2026 allocation. Group impact assessments are not shown in this example.",
};
