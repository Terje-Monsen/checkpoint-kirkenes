import type { Lang } from './i18n';

export type Step =
  | {
      type: 'mcq';
      id: string;
      text: Record<Lang, string>;
      options: Record<Lang, string[]>;
      correct: string[];
      random?: boolean;
      maxTime: number;
      maxPoint: number;
      minPoint: number;
    }
  | {
      type: 'mcq-image';
      id: string;
      text: Record<Lang, string>;
      options: Record<Lang, string[]>; // filnavnene, f.eks. ['borealis.png', ...]
      correct: string[] | Record<Lang, string[]>;
      imagePath?: string;              // 👈 ny felt for bildebane (eks. '/images/aurora/')
      random?: boolean;
      maxTime: number;
      maxPoint: number;
      minPoint: number;
    }
  | {
      type: 'slider';
      id: string;
      text: Record<Lang, string>;
      min: number;
      max: number;
      start: number;
      step?: number;
      correct: number;
      scoreRange: number;
      prefix?: string;
      maxTime: number;
      maxPoint?: number;
      
    }
  | {
      type: 'hotspot';
      id: string;
      text: Record<Lang, string>;
      image: string;
      pin: string;
      correct: { x: number; y: number; radiusInner: number; radiusOuter: number };
      maxTime: number;
      maxPoint?: number;
    }
  | {
      type: 'truefalse';
      id: string;
      text: Record<Lang, string>;
      options: Record<Lang, [string, string]>;
      correct: string;
      maxTime: number;
      maxPoint?: number;
      minPoint?: number;
    }
  | {
      type: 'video';
      id: string;
      src: string;
      autoplay?: boolean;         
    };

export const steps: Step[] = [
    



  {
    type: 'video',
    id: 'VIDOE-KIRKENES',
    src: {
      no: '/video/kirkenes-no-low.mp4',
      en: '/video/kirkenes-en-low.mp4'
    },
    autoplay: true
  },

  {
    type: 'mcq-image',
    id: 'GRENSESTOLPE',
    text: {
      no: 'Rett utenfor flyplassen står grensestolpene til Norge, Finland og Russland. Hvilken er den norske?',
      en: 'Right outside the airport, you can see the border markers of Norway, Finland, and Russia. Which one marks Norway?'
    },
    options: {
      no: ['a.png', 'b.png', 'c.png', 'd.png'],
      en: ['a.png', 'b.png', 'c.png', 'd.png'],
    },
    correct: { no: ['b.png'], en: ['b.png'] },
    imagePath: '/images/grensestolpe/',   
    random: false,
    maxTime: 30,
    maxPoint: 100,
    minPoint: 50
  },

  {
    type: 'slider',
    id: 'TIL-TROMSØ',
    text: {
      no: 'Du er nå kun 13 km fra Kirkenes, men hvor langt er det å kjøre til Tromsø?',
      en: 'You’re now only 13 km from Kirkenes, but how far is it to drive to Tromsø?'
    },
    min: 0,
    max: 1000,
    step:10,
    start: 500,
    correct: 780,
    scoreRange: 50,
    prefix: 'km',
    maxTime: 60,
    maxPoint: 100
  },

  {
    type: 'hotspot',
    id: 'HVOR-ER-KIRKENES',
    text: {
      no: 'Hvor er på kartet finner du Kirkenes?',
      en: 'Where is Kirkenes on the map?'
    },
    image: '/images/map-finnmark.png',
    pin: '/images/pin-hotspot.png',
    correct: { x: 72, y: 34, radiusInner: 4, radiusOuter: 8 },
    maxTime: 60,
    maxPoint: 100
  },

  {
    type: 'truefalse',
    id: 'POLARSIRKELEN',
    text: {
      no: 'Befinner du deg nå nord eller sør for polarsirkelen?',
      en: 'Are you currently north or south of the Arctic Circle?'
    },
    options: {
      no: ['Nord', 'Sør'],
      en: ['North', 'South']
    },
    correct: { no: 'Nord', en: 'North' },
    maxTime: 15,
    maxPoint: 100,
    minPoint: 50
  },


      {
    type: 'slider',
    id: 'KALDEST',
    text: {
      no: 'Januar er den kaldeste måneden i Kirkenes. Hva er normaltemperaturen for januar?',
      en: 'January is the coldest month in Kirkenes. What is theaverage temperature for January?'
    },
    min: -30,
    max: 30,
    step:1,
    start: 0,
    correct: -10,
    scoreRange: 3,
    prefix: '°C',
    maxTime: 60,
    maxPoint: 100
  },













  
  {
    type: 'mcq',
    id: 'NORDLYS-AARSTID',
    text: {
      no: 'Når på året har du størst sjanse til å se nordlyset?',
      en: 'During which season are you most likely to see the Northern Lights?'
    },
    options: {
      no: ['Vår', 'Sommer', 'Høst', 'Vinter'],
      en: ['Spring', 'Summer', 'Autumn/Fall', 'Winter']
    },
    correct: { 
      no: ['Vinter'], 
      en: ['Winter'] 
    },
    random: false,
    maxTime: 30,
    maxPoint: 100,
    minPoint: 50
  },

  
  {
    type: 'video',
    id: 'VIDOE-HURTIGRUTEN',
    src: {
      no: '/video/hurtigruten-no-low.mp4',
      en: '/video/hurtigruten-en-low.mp4'
    },
    autoplay: true
  },

  {
  type: 'mcq',
  id: 'HURTIGRUTEN_NORDLIGSTE_HAVN',
  text: {
    no: 'Hva er Hurtigrutens nordligste havn?',
    en: 'What is the northernmost port on the Hurtigruten route?'
  },
  options: {
    no: ['Mehamn', 'Honningsvåg', 'Hammerfest', 'Kirkenes'],
    en: ['Mehamn', 'Honningsvåg', 'Hammerfest', 'Kirkenes']
  },
  correct: { no: 'Mehamn', en: 'Mehamn' },
  random: true,
  maxTime: 30,
  maxPoint: 100
},
  
  {
  type: 'slider',
  id: 'NORGE_RUSSLAND_GRENSE',
  text: {
    no: 'Hvor lang er grensen mellom Norge og Russland?',
    en: 'How long is the border between Norway and Russia?'
  },
  min: 0,
  max: 1000,
  step: 10,
  start: 0,
  correct: 200,      
  scoreRange: 50,    
  prefix: ' km',
  maxTime: 60,
  maxPoint: 100
},





{
  type: 'truefalse',
  id: 'ISTANBUL',
  text: {
    no: 'Befinner du deg vest eller øst for Istanbul?',
    en: 'Are you currently West or East of Istanbul?'
  },
  options: {
    no: ['Vest', 'Øst'],
    en: ['West', 'East']
  },
  correct: { no: 'Øst', en: 'East' },
  maxTime: 15,
  maxPoint: 100,
  minPoint: 50
},



    {
  type: 'mcq',
  id: 'NÅR-ER-SOLEN-TILBAKE',
  text: {
    no: 'Solen er borte i mørketiden fra ca. 21. november i Kirkenes. Når er solen tilbake?',
    en: 'The sun is gone during the Polar Night from around November 21st in Kirkenes. When does the sun return?'
  },
  options: {
    no: ['21. desember', '21. januar', '21. februar', '21. mars'],
    en: ['21 December', '21 January', '21 February', '21 March']
  },
  correct: { 
    no: ['21. januar'], 
    en: ['21 January'] 
  },
  random: false,
  maxTime: 30,
  maxPoint: 100,
  minPoint: 50
},

  {
  type: 'mcq',
  id: 'MIDNATTSOL',
  text: {
    no: 'I hvilke måneder kan du oppleve midnattsolen i Kirkenes?',
    en: 'During which months can you experience the Midnight Sun in Kirkenes?'
  },
  options: {
    no: ['Sep. – Okt.', 'Nov. – Des.', 'Mai – Jul.', 'Jan. – Mar.'],
    en: ['Sep. – Oct.', 'Nov. – Dec.', 'May – Jul.', 'Jan. – Mar.']
  },
  correct: { no: ['Mai – Jul.'], en: ['May – Jul.'] },
  random: false,
  maxTime: 30,
  maxPoint: 100,
  minPoint: 50
}, 




   {
    type: 'mcq',
    id: 'SØR-LYSET',
    text: {
      no: 'Du vil kanskje få oppleve nordlys når du er i Kirkenes? Hva heter polarlyset når det er på den sørlige halvkule?',
      en: 'You might see the northern lights while in Kirkenes! What is the name of the polar light in the southern hemisphere?'
    },
    options: {
      no: ['Aurora Borealis', 'Aurora Australis', 'Aurora Polaris', 'Aurora English'],
      en: ['Aurora Borealis', 'Aurora Australis', 'Aurora Polaris', 'Aurora English']
    },
    correct: { no: ['Aurora Australis'], en: ['Aurora Australis'] },
    random: false,
    maxTime: 30,
    maxPoint: 50,
    minPoint: 50
  },


{
  type: 'hotspot',
  id: 'HVOR-ER-BUGOYNES',
  text: {
    no: 'Idylliske Bugøynes er verdt et besøk, men hvor på kartet finner du bygden?',
    en: 'Bugøynes is a charming village worth a visit, but where is it located on the map?'
  },
  image: '/images/map-finnmark.png',
  pin: '/images/pin-hotspot.png',
  // Omtrentlige koordinater – justér hvis kartet ditt er annerledes
  correct: { x: 56, y: 10, radiusInner: 3, radiusOuter: 7 },
  maxTime: 60,
  maxPoint: 100
},


  {
    type: 'mcq-image',
    id: 'BUGOYNES_KONGEKRABBE',
    text: {
      no: 'Hvilket dyr er Bugøynes spesielt kjent for i moderne tid?',
      en: 'Which animal is Bugøynes especially known for today?'
    },
    options: {
      no: ['bug-seal.png', 'bug-bear.png', 'bug-crab.png', 'bug-rain.png'],
      en: ['bug-seal.png', 'bug-bear.png', 'bug-crab.png', 'bug-rain.png'],
    },
    correct: { no: ['bug-crab.png'], en: ['bug-crab.png'] },
    imagePath: '/images/bugoynes/',   
    random: true,
    maxTime: 30,
    maxPoint: 100,
    minPoint: 50
  },








];




export const getMaxScore = (allSteps: Step[] = steps): number => {
  return allSteps.reduce((sum, step) => {
    if ('maxPoint' in step && typeof step.maxPoint === 'number') {
      return sum + step.maxPoint;
    }
    return sum;
  }, 0);
};







