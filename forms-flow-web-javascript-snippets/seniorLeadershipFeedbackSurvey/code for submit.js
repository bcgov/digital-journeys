// Code for submit button

(function () { 
  

  const etlForOds = () => {
    // Perform ETL operations for ODS
    console.log("Performing ETL for ODS...");

    const lookupRatingValue = (value) => {

      switch (value) {
        case 1: return "Never";
        case 2: return "Rarely";
        case 3: return "Sometimes";
        case 4: return "Often";
        case 5: return "Always";
        case -1: return "Unable to rate";
      };
    };

    const payload = {

      cohort: data.cohort,
      comps: [
        {
          index: 1,
          label: "Championing reconciliation, diversity, and inclusion",
          questions: [
            {
              index: 1,
              label: "Ensures opportunities for all team members, regardless of their background or identity.",
              value: lookupRatingValue(data.pleaseChooseOne),
              rating: data.pleaseChooseOne
            },
            {
              index: 2,
              label: "Invites diverse perspectives.",
              value: lookupRatingValue(data.pleaseChooseOne4),
              rating: data.pleaseChooseOne4
            },
            {
              index: 3,
              label: "Demonstrates consideration for diverse perspectives.",
              value: lookupRatingValue(data.pleaseChooseOne6),
              rating: data.pleaseChooseOne6
            }
          ]
        },
        {
          index: 2,
          label: "Credible Champion",
          questions: [
            {
              index: 1,
              label: "Facilitates change to address power imbalances and systemic racism*.",
              value: lookupRatingValue(data.pleaseChooseOne1),
              rating: data.pleaseChooseOne1
            },
            {
              index: 2,
              label: "Encourages others to learn about Indigenous relations and apply their knowledge. ",
              value: lookupRatingValue(data.pleaseChooseOne7),
              rating: data.pleaseChooseOne7
            }
          ]
        },
        {
          index: 3,
          label: "Coaching and developing people",
          questions: [
            {
              index: 1,
              label: "Provides meaningful feedback to others.",
              value: lookupRatingValue(data.pleaseChooseOne2),
              rating: data.pleaseChooseOne2
            },
            {
              index: 2,
              label: "Supports others to develop and improve. ",
              value: lookupRatingValue(data.pleaseChooseOne8),
              rating: data.pleaseChooseOne8
            }
          ]
        },
        {
          index: 4,
          label: "Building relationships",
          questions: [
            {
              index: 1,
              label: "Actively works to prevent job-related harm to employees' physical and psychological health and safety",
              value: lookupRatingValue(data.pleaseChooseOne3),
              rating: data.pleaseChooseOne3
            },
            {
              index: 2,
              label: "Balances achieving results with concern for others.",
              value: lookupRatingValue(data.pleaseChooseOne12),
              rating: data.pleaseChooseOne12
            
            },
            {
              index: 3,
              label: "Builds trust by encouraging collaboration with and between others.",
              value: lookupRatingValue(data.pleaseChooseOne14),
              rating: data.pleaseChooseOne14
            },
            {
              index: 4,
              label: "Their actions match their words.",
              value: lookupRatingValue(data.pleaseChooseOne15),
              rating: data.pleaseChooseOne15
            }
          ]
        },
        {
          index: 5,
          label: "Operating and thinking strategically",
          questions: [
            {
              index: 1,
              label: "Encourages innovative approaches to their team’s work.",
              value: lookupRatingValue(data.pleaseChooseOne5),
              rating: data.pleaseChooseOne5
            },
            {
              index: 2,
              label: "Brings others along with them as they seek to move the organization towards its goals.",
              value: lookupRatingValue(data.pleaseChooseOne16),
              rating: data.pleaseChooseOne16
            },
            {
              index: 3,
              label: "Helps others understand where their work fits in the broader context of the organization.",
              value: lookupRatingValue(data.pleaseChooseOne17),
              rating: data.pleaseChooseOne17
            },
            {
              index: 4,
              label: "Prioritizes work in the context of organizational priorities. ",
              value: lookupRatingValue(data.pleaseChooseOne13),
              rating: data.pleaseChooseOne13
            }
          ]
        },
        {
          index: 6,
          label: "Growth and self-awareness",
          questions: [
            {
              index: 1,
              label: "Actively seeks feedback from others.",
              value: lookupRatingValue(data.pleaseChooseOne9),
              rating: data.pleaseChooseOne9
            
            },
            {
              index: 2,
              label: "Takes actions to improve based on feedback received.",
              value: lookupRatingValue(data.pleaseChooseOne10),
              rating: data.pleaseChooseOne10
            
            },
            {
              index: 3,
              label: "Demonstrates awareness of the impact they have on others around them.",
              value: lookupRatingValue(data.pleaseChooseOne11),
              rating: data.pleaseChooseOne11
            }
          ]
        }
      ],
      freetext: [
        {
          index: 1,
          label: "What do you appreciate most about SL's leadership style?",
          value: data.nominee_text_1
        },
        {
          index: 2,
          label: "What advice would you give to help them become a better leader?",
          value: data.nominee_text_2
        },
        {
          index: 3,
          label: "What is your greatest strength as a leader?",
          value: data.SL_text_1
        },
        {
          index: 4,
          label: "What is your greatest area for improvement as a leader?",
          value: data.SL_text_2
        }
      ]
     
    };

    data.bcomps = payload;

  };

  
  etlForOds();
  
  console.log(data);

  const theForm = Object.values(window.Formio.forms)[0];

  theForm.submit();
  
  return true;

})();