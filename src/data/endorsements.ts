export type Endorsement = {
  name: string;
  role: string;
  linkedin?: string;
  paragraphs: string[];
};

export const endorsements: Endorsement[] = [
  {
    name: 'Nadia Ali',
    role: 'Account Director, Hex Digital',
    linkedin: 'https://www.linkedin.com/in/nadia-ali-aab085b1/',
    paragraphs: [
      'Jamie essentially taught me everything I know about the world of engineering. We began working together in 2017, and it has been an absolute pleasure ever since. He met me where I was (a young Account Manager coming into a digital agency) patiently and cheerfully building upon the basic web knowledge I had at the time.',
      'Jamie\u2019s work ethic is infectious\u2014<strong>he has this rare ability to make everyone around him want to be a better team player.</strong> He has a natural flair for looking at things and seeing how they can be done better, constantly refining processes to ensure the whole team is working as efficiently and effectively as possible.',
      'He is dedicated to quality and consistently goes above and beyond to deliver fantastic solutions for clients. One of his greatest strengths is bridging the gap between the technical and the non-technical; he ensures complex explanations never bamboozle people, whether he\u2019s translating things for me internally or guiding clients through a project. Over the best part of the last decade, Jamie has been my ultimate \u2018technical bestie,\u2019 and <strong>I have zero hesitation in recommending him to be yours.</strong>',
    ],
  },
  {
    name: 'Dip Jhutti',
    role: 'Global Technical Account Manager, Bloomberg',
    linkedin: 'https://www.linkedin.com/in/dipjhutti/',
    paragraphs: [
      'I was fortunate enough to work with Jamie during my time at PayPal. His enthusiasm is infectious and his attention to details is second to none. I hope one day to work with him in the future again.',
    ],
  },
];
