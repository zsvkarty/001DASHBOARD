import { User, ProgressData, Badge, Flashcard, FlashcardSet, TextbookChapter, AudioChapter } from '../types';

// Mock badges
export const mockBadges: Badge[] = [
  {
    id: 'streak-1',
    name: 'Flame Starter',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    earnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    level: 1,
    maxLevel: 1,
    category: 'streak',
    requirements: {
      type: 'streak',
      threshold: 3,
    },
  },
  {
    id: 'streak-2',
    name: 'Consistent Learner',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    earnedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    level: 1,
    maxLevel: 1,
    category: 'streak',
    requirements: {
      type: 'streak',
      threshold: 7,
    },
  },
  {
    id: 'flashcard-1',
    name: 'Flashcard Novice',
    description: 'Study 100 flashcards',
    icon: '📇',
    earnedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    level: 1,
    maxLevel: 3,
    category: 'flashcard',
    requirements: {
      type: 'completion',
      threshold: 100,
      activity: 'flashcard',
    },
  },
  {
    id: 'xp-1',
    name: 'XP Collector',
    description: 'Earn 500 XP',
    icon: '⭐',
    earnedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    level: 1,
    maxLevel: 3,
    category: 'general',
    requirements: {
      type: 'xp',
      threshold: 500,
    },
  },
];

export const mockUser: User = {
  id: '1',
  name: 'Anna Nováková',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  email: 'anna.novakova@email.cz',
  studyGoals: {
    dailyFlashcards: 50,
    weeklyHours: 20
  },
  gamification: {
    streak: {
      current: 12,
      longest: 15,
      lastUpdated: new Date(),
      milestones: [3, 7, 30, 100],
      milestonesReached: [3, 7],
    },
    xp: {
      today: 85,
      total: 1250,
      goal: 100,
      history: [
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 120 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 95 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 105 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 75 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 110 },
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 90 },
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 100 },
      ],
      byActivity: {
        flashcard: 450,
        audiobook: 320,
        textbook: 280,
        exercise: 200,
      },
    },
    badges: mockBadges,
  }
};

// Mock flashcard sets with legal study content organized by topics
export const mockFlashcardSets: FlashcardSet[] = [
  {
    id: "filosofie",
    title: "Filosofie",
    emoji: "🤔",
    description: "Otázky a odpovědi z oblasti filosofie.",
    cards: [
      { id: 1, question: 'Od kdy do kdy mluvíme o středověké filosofii?', answer: 'Od rozpadu Západořímské říše do počátku humanismu' },
      { id: 2, question: 'Kdo byl nejdůležitějším představitelem patristiky?', answer: 'Sv. Augustýn' },
      { id: 3, question: 'Co znamená "creatio ex nihilo"?', answer: 'Stvoření z ničeho' },
      { id: 4, question: 'Kdo uznal svébytnost filosofie vůči teologii?', answer: 'Tomáš Akvinský' },
      { id: 5, question: 'Jaký proud tvrdí, že univerzálie jsou pouze jazykový nástroj?', answer: 'Nominalismus' },
      { id: 6, question: 'Kdo z následujících filosofů napsal dílo "O obci boží"?', answer: 'Sv. Augustýn' },
      { id: 7, question: 'Co bylo cílem apologetů?', answer: 'Obhajoba křesťanství' },
      { id: 8, question: 'Jak nazýváme filosofii inspirovanou Tomášem Akvinským?', answer: 'Tomismus' },
      { id: 9, question: 'Kdo byl muslimským filosofem z doby mezidobí, který komentoval Aristotela?', answer: 'Averroes' },
      { id: 10, question: 'Který směr zdůrazňuje, že základním zdrojem poznání je rozum?', answer: 'Racionalismus' },
      { id: 11, question: 'Kdo je nejvýznamnějším představitelem Kantovského kriticismu?', answer: 'Immanuel Kant' },
      { id: 12, question: 'Jaký směr tvrdí, že všechno poznání vychází ze zkušenosti?', answer: 'Empirismus' },
      { id: 13, question: 'Který směr kladl důraz na rozum a kritizoval církevní dogmata?', answer: 'Osvícenství' },
      { id: 14, question: 'Který směr tvrdí, že Bůh stvořil svět, ale do něj dále nezasahuje?', answer: 'Deismus' },
      { id: 15, question: 'Který směr je známý kategoriálním imperativem a spojením racionalismu a empirismu?', answer: 'Kantovský kriticismus' },
      { id: 16, question: 'Kdo je nejvýznamnějším představitelem materialismu?', answer: 'Karl Marx' },
      { id: 17, question: 'Který směr tvrdí, že hmota je odvozená od idejí?', answer: 'Idealismus' },
      { id: 18, question: 'Který směr měří morální hodnotu činu podle jeho důsledků?', answer: 'Utilitarismus' },
      { id: 19, question: 'Který směr zdůrazňuje, že rozum není hlavním nástrojem poznání?', answer: 'Iracionalismus' },
      { id: 20, question: 'Kdo je představitelem voluntarismu?', answer: 'Friedrich Nietzsche' },
      { id: 21, question: 'Který směr odmítá metafyzické spekulace a zaměřuje se na empirická fakta?', answer: 'Pozitivismus' },
      { id: 22, question: 'Jaký směr tvrdí, že dějiny jsou poháněny třídním bojem?', answer: 'Marxismus' },
      { id: 23, question: 'Který směr tvrdí, že tradiční hodnoty a smysl života jsou iluzí?', answer: 'Nihilismus' },
      { id: 24, question: 'Jaký pojem používá Henri Bergson k popisu živého času?', answer: 'Trvání' },
      { id: 25, question: 'Který směr považuje pravdu za to, co funguje v praxi?', answer: 'Pragmatismus' },
      { id: 26, question: 'Kdo je zakladatelem fenomenologie?', answer: 'Edmund Husserl' },
      { id: 27, question: 'Který směr zdůrazňuje individuální svobodu a smysl existence?', answer: 'Existencialismus' },
      { id: 28, question: 'Co zkoumá hermeneutika?', answer: 'Teorii interpretace textů' },
      { id: 29, question: 'Kdo je autorem výroku "O čem nelze mluvit, o tom se musí mlčet"?', answer: 'Ludwig Wittgenstein' },
      { id: 30, question: 'Co je klíčovým kritériem vědeckosti podle Karla Poppera?', answer: 'Falsifikace' },
      { id: 31, question: 'Jaká je hlavní myšlenka stoicismus?', answer: 'Dosažení vnitřního klidu a harmonického života skrze ovládání emocí' },
      { id: 32, question: 'Jaká je hlavní myšlenka epikureismu?', answer: 'Nejvyšším cílem je dosažení "atarxie" a potěšení, které je dosažitelné skrze rozumné uspokojování potřeb' },
      { id: 33, question: 'Jaká je hlavní myšlenka skepticizmu?', answer: 'Skeptici tvrdí, že člověk nemůže dosáhnout definitivní jistoty a měl by se vyhýbat absolutním tvrzením' },
      { id: 34, question: 'Jaká je hlavní myšlenka novoplatonismu?', answer: 'Vše ve světě je propojeno skrze "Jedno", a člověk může dosáhnout osvícení a sjednocení s tímto absolutním principem' },
      { id: 35, question: 'Jaká je hlavní myšlenka novopýthagoreismu?', answer: 'Vesmír je řízen matematickými zákony, které ovlivňují přírodu i duši člověka' },
      { id: 36, question: 'Jaká byla hlavní myšlenka Sokratovy filosofie?', answer: 'Etika a sebepoznání skrze dialektiku' },
      { id: 37, question: 'Jaká je hlavní myšlenka platónismu?', answer: 'Existuje dokonalý svět idejí' },
      { id: 38, question: 'Co je hlavní myšlenka Aristotelismu?', answer: 'Vše má svůj účel (telos) a cílem života je eudaimonie' },
      { id: 39, question: 'Jaký je Platónův pohled na univerzálie?', answer: 'Jsou nezávislé na konkrétních věcech a existují jako ideje ve světě idejí' },
      { id: 40, question: 'Jaký je Aristotelův pohled na univerzálie?', answer: 'Existují pouze ve věcech samotných' },
      { id: 41, question: 'Jaký základní princip (arché) hledali myslitelé Míletské školy?', answer: 'Voda' },
      { id: 42, question: 'Co je hlavní myšlenkou Pythagorejské školy?', answer: 'Vesmír je uspořádán podle matematických zákonů' },
      { id: 43, question: 'Co zdůraznil Herakleitos o světě?', answer: 'Svět je v neustálém pohybu a změně' },
      { id: 44, question: 'Co tvrdili představitelé Eléjské školy o realitě?', answer: 'Realita je neměnná a nehybná' },
      { id: 45, question: 'Co věřili Sofisté o pravdě?', answer: 'Pravda je relativní a závisí na názoru jednotlivce' },
      { id: 46, question: 'Jaký názor měli atomisté na svět?', answer: 'Vše se skládá z malých, nedělitelných částic - atomů' }
    ]
  },

  {
    id: 'psychologie',
    title: 'Psychologie',
    emoji: '🧠',
    description: 'Základní pojmy a osobnosti psychologie',
    cards: [
      {
        id: 47,
        question: 'Kdo přišel s termínem "introspekce"?',
        answer: 'Wilhelm Wundt'
      },
      {
        id: 48,
        question: 'Co zkoumá gnoseologie?',
        answer: 'Vztah mezi vědomím a objekty, které jsou poznávány'
      },
      {
        id: 49,
        question: 'Co je cílem introspekce?',
        answer: 'Analyzovat vnitřní prožitky a mentální stavy'
      },
      {
        id: 50,
        question: 'Kdo přišel s termínem "kolektivní nevědomí"?',
        answer: 'Carl Gustav Jung'
      },
      {
        id: 51,
        question: 'Co je kolektivní nevědomí?',
        answer: 'Soubor nevědomých obsahů, které jsou sdílené mezi jednotlivci'
      },
      {
        id: 52,
        question: 'Kdo přišel s termínem "psychika"?',
        answer: 'Sigmund Freud'
      },
      {
        id: 53,
        question: 'Co zahrnuje psychika podle Freuda?',
        answer: 'Vědomí, předvědomí a nevědomí'
      },
      {
        id: 54,
        question: 'Kdo přišel s termínem "chování a prožívání"?',
        answer: 'B.F. Skinner'
      },
      {
        id: 55,
        question: 'Co zahrnuje termín "chování a prožívání"?',
        answer: 'Externí jednání a vnitřní prožitky, které nelze pozorovat'
      }
    ]
  },

  {
    id: 'sociologie',
    title: 'Sociologie',
    emoji: '👥',
    description: 'Základní pojmy a směry v sociologii',
    cards: [
      { id: 56, question: 'Kdo je považován za zakladatele pozitivismu?', answer: 'Auguste Comte' },
      { id: 57, question: 'S jakým směrem je spojen Herbert Spencer?', answer: 'Sociální darwinismus' },
      { id: 58, question: 'Kdo tvrdil, že historie je dějinami třídního boje?', answer: 'Karl Marx' },
      { id: 59, question: 'Který sociolog je považován za jednoho z hlavních zakladatelů moderní sociologie?', answer: 'Émile Durkheim' },
      { id: 60, question: 'Jaká je hlavní myšlenka sociálního darwinismu?', answer: 'Společnost se vyvíjí přirozeným výběrem, stejně jako příroda' },
      { id: 61, question: 'S jakým směrem je spojeno Paretovo pravidlo 80/20?', answer: 'Elitismus' },
      { id: 62, question: 'Kdo spojil protestantskou etiku s rozvojem kapitalismu?', answer: 'Max Weber' },
      { id: 63, question: 'Na co se zaměřoval Georg Simmel v sociologii?', answer: 'Na analýzu mikro-sociálních interakcí' },
      { id: 64, question: 'Jakou metodu vyvinul Jacob L. Moreno pro studium sociálních vztahů?', answer: 'Sociometrii' },
      { id: 65, question: 'Jak zní princip Paretova pravidla 80/20?', answer: '20 % lidí vlastní 80 % bohatství' },
      { id: 66, question: 'Kdo byl hlavním představitelem Chicagské školy sociologie?', answer: 'Robert Park' },
      { id: 67, question: 'Kdo zastával názor, že veškeré poznání musí být vědecké?', answer: 'Auguste Comte' },
      { id: 68, question: 'Kdo vyvinul metody pro studium vztahů ve skupinách?', answer: 'Jacob L. Moreno' },
      { id: 69, question: 'Který směr se zabýval vlivem městského života na jednotlivce?', answer: 'Sociologie' },
      { id: 70, question: 'Kdo je autorem teorie o beztřídní společnosti?', answer: 'Karl Marx' },
      { id: 71, question: 'Kdo analyzoval vliv náboženství na rozvoj kapitalismu?', answer: 'Max Weber' },
      { id: 72, question: 'Kdo zdůrazňoval význam vědeckých metod pro rozvoj společnosti?', answer: 'Auguste Comte' },
      { id: 73, question: 'Kdo tvrdil, že v každé společnosti existuje malá skupina elit?', answer: 'Vilfredo Pareto' },
      { id: 74, question: 'Co bylo cílem Durkheimova výzkumu o sebevraždách?', answer: 'Zkoumat vliv sociálních faktorů na jednotlivce' },
      { id: 75, question: 'Kdo tvrdil, že vztahy ve společnosti jsou určovány zákony evoluce?', answer: 'Herbert Spencer' },
      { id: 76, question: 'S jakým směrem je spojena Durkheimova studie o náboženství?', answer: 'Funkcionalismus' },
      { id: 77, question: 'Kdo zastával názor, že neexistuje jednotná pravda o společnosti?', answer: 'Max Weber' },
      { id: 78, question: 'Kdo věřil, že ekonomická nerovnost je nezbytná pro společenský pokrok?', answer: 'Vilfredo Pareto' },
      { id: 79, question: 'Kdo kritizoval stát za nadměrné zasahování do ekonomiky?', answer: 'Herbert Spencer' },
      { id: 80, question: 'Kdo považoval sociální vědy za nástroj pro zlepšení společnosti?', answer: 'Auguste Comte' },
      { id: 81, question: 'Kdo zkoumal roli anonymity ve městském prostředí?', answer: 'Georg Simmel' },
      { id: 82, question: 'Kdo analyzoval vztah mezi ekonomikou a protestantskou etikou?', answer: 'Max Weber' },
      { id: 83, question: 'Kdo tvrdil, že organizace státu má vycházet z vědeckého poznání?', answer: 'Auguste Comte' },
      { id: 84, question: 'Kdo vypracoval teorii o společenských elitách a jejich vlivu?', answer: 'Vilfredo Pareto' },
      { id: 85, question: 'Kdo zdůraznil, že sociální vědy mají prakticky zlepšovat život jednotlivců?', answer: 'Auguste Comte' }
    ]
  },
  {
    id: 'constitutional-law',
    title: 'Právo',
    emoji: '⚖️',
    description: 'Základní principy ústavního práva',
    cards: [
      { id: 86, question: 'Jaké jsou základní principy ústavního práva?', answer: 'Rozdělení moci, právní jistota, suverenita státu' },
      { id: 87, question: 'Kdo je hlavním představitelem výkonné moci v ČR?', answer: 'Prezident' },
      { id: 88, question: 'Co znamená princip dělby moci v ústavním právu?', answer: 'Rozdělení pravomocí mezi prezidenta, parlament a soudy' },
      { id: 89, question: 'Jaké jsou podmínky pro uzavření manželství v ČR?', answer: 'Plnoletost, svobodná vůle, souhlas obou stran' },
      { id: 90, question: 'Co je to právo občanského soudního řízení?', answer: 'Zákony upravující civilní spory' },
      { id: 91, question: 'Co je to zákonný zástupce?', answer: 'Osoba, která může právně jednat za jiného' },
      { id: 92, question: 'Co je právní úprava dědictví?', answer: 'Určení práv a povinností dědiců' },
      { id: 93, question: 'Kdy je smlouva považována za platně uzavřenou?', answer: 'Pokud byly splněny podmínky zákona a obě strany se dohodly' },
      { id: 94, question: 'Co znamená „nullum crimen sine lege"?', answer: 'Neexistuje zločin bez zákona' },
      { id: 95, question: 'Co je právní odpovědnost?', answer: 'Povinnost odpovědět za jednání, které porušuje zákon' },
      { id: 96, question: 'Co je to nutná obrana?', answer: 'Ochrana sebe nebo jiných před útokem' },
      { id: 97, question: 'Co je krajní nouze?', answer: 'Ochrana sebe nebo jiných, když není jiná možnost' },
      { id: 98, question: 'Co znamená zásada legality v trestním právu?', answer: 'Trestání pouze za činy definované zákonem' },
      { id: 99, question: 'Kdy je použití síly v nutné obraně považováno za přiměřené?', answer: 'Pokud je síla odpovídající útoku' },
      { id: 100, question: 'Co je to retroaktivita v trestním právu?', answer: 'Použití zákonů na činy spáchané před jejich účinností' },
      { id: 101, question: 'Co je zákaz retroaktivity v trestním právu?', answer: 'Zákony nemohou být použity zpětně na činy spáchané před jejich účinností' },
      { id: 102, question: 'Co znamená princip "lex mitior"?', answer: 'Použití mírnějších trestů v případě změny zákona' },
      { id: 103, question: 'Co je to právní zástupce?', answer: 'Osoba, která jedná za jiného v právních záležitostech' },
      { id: 104, question: 'Co je to právní moc rozhodnutí soudu?', answer: 'Rozhodnutí, které se stalo závazným pro všechny strany' },
      { id: 105, question: 'Jaký je účel občanského práva?', answer: 'Upravuje vztahy mezi jednotlivci a jejich majetkové a osobní vztahy' },
      { id: 106, question: 'Co je to právní norma?', answer: 'Pravidlo chování stanovené státem' },
      { id: 107, question: 'Co znamená zásada "nullum crimen sine lege"?', answer: 'Neexistuje zločin bez zákona' },
      { id: 108, question: 'Co je to právní stát?', answer: 'Stát, kde jsou právní normy nadřazeny nad ostatními pravidly' },
      { id: 109, question: 'Co je to právní jistota?', answer: 'Záruka, že právní předpisy budou jasné, stabilní a aplikovány spravedlivě' },
      { id: 110, question: 'Co je to smlouva podle občanského práva?', answer: 'Dohoda mezi dvěma nebo více stranami, která zakládá, mění nebo ruší právní vztahy' },
      { id: 111, question: 'Jaké jsou základní podmínky pro platnost smlouvy?', answer: 'Svobodná vůle stran, plnoletost, způsobilost k právním úkonům' },
      { id: 112, question: 'Co je to právní jednání?', answer: 'Každý projev vůle, který má za následek vznik, změnu nebo zánik právních vztahů' },
      { id: 113, question: 'Co znamená způsobilost k právním úkonům?', answer: 'Schopnost osoby vykonávat právní jednání a být za ně odpovědná' },
      { id: 114, question: 'Co je to právní osoba?', answer: 'Subjekt, který může mít právní povinnosti a práva, například společnost nebo stát' },
      { id: 115, question: 'Co je odpovědnost za škodu?', answer: 'Povinnost nahradit škodu, kterou někdo způsobil jinému' },
      { id: 116, question: 'Co je to dědická smlouva?', answer: 'Smlouva, která upravuje dědictví mezi jednotlivci' },
      { id: 117, question: 'Co je to závěť?', answer: 'Právní úkon, kterým člověk určuje, jak naloží se svým majetkem po smrti' },
      { id: 118, question: 'Co znamená nárok na vrácení věci?', answer: 'Právo požadovat vrácení věci, která byla někomu neoprávněně odevzdána' },
      { id: 119, question: 'Co je to výpověď ze smlouvy?', answer: 'Jednostranné zrušení smlouvy ze strany jedné strany' },
      { id: 120, question: 'Co je to veřejná nabídka?', answer: 'Projev vůle, kterým jedna strana nabízí plnění určité smlouvy veřejně' },
      { id: 121, question: 'Co je to konkludentní jednání?', answer: 'Jednání, které vyjadřuje vůli osoby, i když není výslovně vyjádřeno slovy' },
      { id: 122, question: 'Co znamená „koupě" podle občanského práva?', answer: 'Smlouva, kterou se prodávající zavazuje převést vlastnické právo k věci kupujícímu' },
      { id: 123, question: 'Co je to „věcná práva"?', answer: 'Práva, která se vztahují k určité věci, jako je vlastnictví nebo zástavní právo' },
      { id: 124, question: 'Co znamená „nemovitost" podle občanského práva?', answer: 'Věci, které jsou pevně spojeny s pozemkem, jako jsou budovy a stavby' },
      { id: 125, question: 'Co je to záruka za jakost?', answer: 'Odpovědnost prodávajícího za vady, které se projeví u prodaného zboží' },
      { id: 126, question: 'Co znamená „společná a nerozdílná odpovědnost"?', answer: 'Když více lidí odpovídá za jednu povinnost, každý z nich může být povolán k plnění celé povinnosti' },
      { id: 127, question: 'Co je to vlastnické právo?', answer: 'Právo osoby nakládat s věcí podle své vůle, včetně jejího prodeje, darování či zničení' },
      { id: 128, question: 'Co je to Ústava České republiky?', answer: 'Nejvyšší právní předpis, který určuje státní zřízení, práva a svobody občanů' },
      { id: 129, question: 'Co znamená princip dělby moci v ústavním právu?', answer: 'Rozdělení pravomocí mezi různé orgány státní moci, aby se zabránilo koncentraci moci' },
      { id: 130, question: 'Jaké jsou hlavní složky státní moci v České republice?', answer: 'Legislativa, exekutiva a judikativa' },
      { id: 131, question: 'Co je to legislativa?', answer: 'Orgány, které vytvářejí a schvalují právní normy, jako je parlament' },
      { id: 132, question: 'Jaká je role prezidenta České republiky podle Ústavy?', answer: 'Zastupuje stát navenek a vykonává některé pravomoci v rámci exekutivy' },
      { id: 133, question: 'Kdo je oprávněn vyhlašovat zákony v České republice?', answer: 'Parlament, konkrétně Poslanecká sněmovna a Senát' },
      { id: 134, question: 'Co je to referendum podle Ústavy České republiky?', answer: 'Přímo rozhodnutí občanů o určitém státním nebo politickém otázce' },
      { id: 135, question: 'Kdo zajišťuje ústavní soudnictví v České republice?', answer: 'Ústavní soud České republiky' },

    ]
  },


  {
    id: 'politologie',
    title: 'Politologie',
    emoji: '🏛️',
    description: 'Základní pojmy politologie',
    cards: [
      { id: 136, question: 'Co je to "dělba moci"?', answer: 'Rozdělení státní moci na zákonodárnou, výkonnou a soudní' },
      { id: 137, question: 'Co je to "demokracie"?', answer: 'Forma vlády, kde moc vychází z lidu' },
      { id: 138, question: 'Co je to "ústava"?', answer: 'Základní zákon státu, který určuje jeho uspořádání' },
      { id: 139, question: 'Jaký volební systém se používá v České republice pro volby do Poslanecké sněmovny?', answer: 'Proporční systém' },
      { id: 140, question: 'Která z následujících institucí v České republice vykonává zákonodárnou moc?', answer: 'Poslanecká sněmovna' },
      { id: 141, question: 'Kdo je hlavou státní moci v České republice?', answer: 'Prezident' },
      { id: 142, question: 'Co je podle Ústavy ČR hlavním úkolem Poslanecké sněmovny?', answer: 'Vytvářet legislativu' },
      { id: 143, question: 'Kdo v České republice jmenuje vládu?', answer: 'Prezident' },
      { id: 144, question: 'Jaký je rozdíl mezi ústavou, zákonem a vyhláškou v České republice?', answer: 'Ústava je nejvyšší právní normou, zákon je nižší a vyhláška je podzákonný právní předpis' },
      { id: 145, question: 'Kdo může v České republice navrhovat zákony?', answer: 'Poslanci, vláda a Senát' },
      { id: 146, question: 'Co je to "smíšený volební systém"?', answer: 'Volební systém, který kombinuje většinový a poměrný systém' },
      { id: 147, question: 'Jaký typ vlády je v České republice?', answer: 'Parlamentní demokracie' },
      { id: 148, question: 'Který orgán v České republice vykonává výkonnou moc?', answer: 'Vláda' },
      { id: 149, question: 'Jaké jsou základní pravomoci prezidenta České republiky?', answer: 'Mít pravomoc v oblasti armády, jmenování soudců a vyhlašování voleb' },
      { id: 150, question: 'Kdo schvaluje zákony v České republice?', answer: 'Senát a Poslanecká sněmovna' },
      { id: 151, question: 'Jaký typ politického systému je v České republice?', answer: 'Parlamentní demokracie' },
      { id: 152, question: 'Co znamená pojem "proporční volební systém"?', answer: 'Počet mandátů se přiděluje podle procenta hlasů, které strany získají' },
      { id: 153, question: 'Kdo má právo odvolat prezidenta v České republice?', answer: 'Ústavní soud' },
      { id: 154, question: 'Která forma vlády je charakteristická pro Českou republiku?', answer: 'Parlamentní demokracie' },
      { id: 155, question: 'Co je to "konsensuální demokracie"?', answer: 'Demokracie, kde vláda funguje na základě souhlasu všech politických stran' },
      { id: 156, question: 'Co je charakteristické pro "prezidentskou demokracii"?', answer: 'Prezident je volen přímo a vykonává výkonnou moc' },
      { id: 157, question: 'Co charakterizuje "totalitní režim"?', answer: 'Omezené politické svobody a silná kontrola státem' },
      { id: 158, question: 'Který z těchto politických směrů usiluje o zrušení státu a jeho nahrazení svobodnými komunitami?', answer: 'Anarchismus' },
      { id: 159, question: 'Co je hlavním cílem komunismu?', answer: 'Vytvoření společnosti bez třídních rozdílů a státního vlastnictví výrobních prostředků' },
      { id: 160, question: 'Co charakterizuje liberalismus?', answer: 'Ochranu osobních svobod a minimální zásahy státu do ekonomiky' },
      { id: 161, question: 'Která ideologie usiluje o rovnost, zajištění minimálních práv a státní podporu pro každého občana?', answer: 'Sociální demokracie' },
      { id: 162, question: 'Co charakterizuje fašismus?', answer: 'Národní hrdost, silná autoritářská vláda a potlačování opozice' },
      { id: 163, question: 'Co je charakteristické pro teokracii?', answer: 'Vláda, kterou tvoří náboženští vůdci' },
      { id: 164, question: 'Co znamená "syndikalismus"?', answer: 'Politická ideologie, která usiluje o zajištění moci prostřednictvím odborů' },
      { id: 165, question: 'Co je hlavní myšlenkou marxismu?', answer: 'Rovnost pro všechny prostřednictvím státního vlastnictví výrobních prostředků' },
      { id: 166, question: 'Co je cílem politického směru nacionalismus?', answer: 'Posílit národní stát a jeho kulturní identitu' },
      { id: 167, question: 'Co charakterizuje politický směr konzervatismus?', answer: 'Podporuje tradiční hodnoty a postupné změny' },
      { id: 168, question: 'Kdo jsou hlavní představitelé anarchismu?', answer: 'Pierre-Joseph Proudhon a Mikhail Bakunin' },
      { id: 169, question: 'Jaké je hlavní zaměření pragmatismu v politické teorii?', answer: 'Řešení problémů podle jejich praktických důsledků a účinnosti' },
      { id: 170, question: 'Která země byla příkladem komunistického režimu v 20. století?', answer: 'Sovětský svaz' },
      { id: 171, question: 'Jaký je hlavní princip socialismus?', answer: 'Rovnost ve společnosti a redistribuce bohatství' },
      { id: 172, question: 'Co je základním principem liberalismu?', answer: 'Ochrana osobních svobod a práv jednotlivců' },
      { id: 173, question: 'Který politický směr je zaměřen na maximální rovnost mezi jednotlivci, bez třídních rozdílů?', answer: 'Socialismus' },
      { id: 174, question: 'Jaké jsou hlavní charakteristiky teokracie?', answer: 'Vláda je vykonávána podle náboženských zásad a vedení náboženských představitelů' },
      { id: 175, question: 'Jaký politický směr podporuje volný trh, osobní svobody a minimální stát?', answer: 'Liberalismus' },
      { id: 176, question: 'Co znamená "diktatura" v politologii?', answer: 'Forma vlády, kde je moci soustředěna do rukou jednoho nebo několika jednotlivců' },
      { id: 177, question: 'Který politický směr se zaměřuje na silný centralizovaný stát a nacionalismus?', answer: 'Fašismus' },
      { id: 178, question: 'Jaký politický směr usiluje o zrušení státních institucí a vytvoření společnosti založené na svobodných komunitách?', answer: 'Anarchismus' },
      { id: 179, question: 'Co je to "demokratický centralismus"?', answer: 'Systém, ve kterém je řízení strany zcela centralizováno, ale s otevřeným diskurzem v rámci stranických sborů' },
      { id: 180, question: 'Kdo byl hlavním představitelem komunistické ideologie?', answer: 'Karl Marx' },
      { id: 181, question: 'Jaký je hlavní princip fašismu?', answer: 'Silná národní identita a autoritářská moc' },
      { id: 182, question: 'Který směr podporuje individuální práva a minimální zásahy státu do osobního života?', answer: 'Liberalismus' },
      { id: 183, question: 'Co znamená pojem "proporcionalita" ve volebních systémech?', answer: 'Počet mandátů je rozdělován mezi politické strany na základě procenta získaných hlasů' },
      { id: 184, question: 'Co charakterizuje politickou ideologii libertarianismu?', answer: 'Podpora minimálního státu a maximálních osobních svobod' },
      { id: 185, question: 'Co je hlavní myšlenkou ekologismu?', answer: 'Ochrana přírody a udržitelnost životního prostředí' },
      { id: 186, question: 'Která ideologie usiluje o vytvoření společnosti beze jakýchkoli třídních rozdílů a státního vlastnictví výrobních prostředků?', answer: 'Komunismus' },
      { id: 187, question: 'Který směr prosazuje ideál společenské rovnosti prostřednictvím demokratických prostředků?', answer: 'Socialismus' },
      { id: 188, question: 'Který politický směr je spojen s ideologií "silného státu" a kontrolou občanů?', answer: 'Totalitarismus' },
      { id: 189, question: 'Jaký je hlavní rozdíl mezi demokratickým a autokratickým režimem?', answer: 'Demokracie vyžaduje pravidelné volby a pluralismus, autokracie má centralizovanou moc v rukou jediné osoby nebo malé skupiny' },
      { id: 190, question: 'Kdo je považován za hlavního představitele klasického liberalismu?', answer: 'John Locke' },
      { id: 191, question: 'Který z následujících režimů je příkladem prezidentské demokracie?', answer: 'Spojené státy americké' },
      { id: 192, question: 'Co je charakteristické pro politickou ideologii neokonzervatismu?', answer: 'Důraz na vojenskou intervenci a ochranu tradičních hodnot' },
      { id: 193, question: 'Který politický směr odmítá všechny formy vlády a usiluje o zrušení státu?', answer: 'Anarchismus' },
      { id: 194, question: 'Jaké je hlavní zaměření politické ideologie feminizmu?', answer: 'Podpora rovnosti mezi pohlavími a práv žen' },
      { id: 195, question: 'Co je hlavním zaměřením politické ideologie populismu?', answer: 'Obhajoba zájmů "obyčejných lidí" proti elitám a establishmentu' },
      { id: 196, question: 'Co znamená termín "demokratická centralizace"?', answer: 'Centralizace moci v jednom politickém centru, přičemž se zachovává kontrola skrze demokratické volby' },
      { id: 197, question: 'Co je charakteristické pro politickou ideologii liberalismu?', answer: 'Podpora osobních svobod a minimálního zásahu státu do života jednotlivců' },
      { id: 198, question: 'Který z následujících politických směrů usiluje o úplnou rovnost a bezstátní společnost?', answer: 'Anarchismus' },
      { id: 199, question: 'Co je hlavní ideou teokracie?', answer: 'Vláda je určena náboženskými autoritami a náboženskými zákony' },
      { id: 200, question: 'Která země je příkladem konstituční monarchie?', answer: 'Velká Británie' },
      { id: 201, question: 'Co je typickým znakem fašismu?', answer: 'Silná centralizovaná moc, agresivní nacionalismus a autoritářské tendence' },
      { id: 202, question: 'Kdo z následujících je příkladem politického smýšlení marxismu?', answer: 'Karl Marx' },
      { id: 203, question: 'Který politický směr se zaměřuje na úplnou rovnost a kolektivistické uspořádání společnosti?', answer: 'Komunismus' },
      { id: 204, question: 'Který z těchto politických směrů usiluje o minimalizaci vládní moci a maximální svobodu jednotlivce?', answer: 'Liberalismus' },
      { id: 205, question: 'Kdo je považován za zakladatele moderního liberalismu?', answer: 'John Locke' }
    ]
  },

  {
    id: 'economics',
    title: 'Ekonomie',
    emoji: '💰',
    description: 'Základní ekonomické pojmy a principy',
    cards: [
      { id: 206, question: 'Co zdůrazňuje klasická ekonomie?', answer: 'Minimalizaci zásahu státu do ekonomiky' },
      { id: 207, question: 'Kdo je hlavním představitelem monetarismu?', answer: 'Milton Friedman' },
      { id: 208, question: 'Co je klíčovým prvkem keynesiánství?', answer: 'Vládní zásahy na podporu poptávky v recesi' },
      { id: 209, question: 'Co tvrdí rakouská škola ekonomie?', answer: 'Trhy se vždy automaticky stabilizují bez vládní pomoci' },
      { id: 210, question: 'Co zdůrazňuje neoliberalismus?', answer: 'Minimalizace role státu v ekonomice a volný trh' },
      { id: 211, question: 'Jaké je hlavní téma marxismu?', answer: 'Třídní boj mezi buržoazií a proletariátem' },
      { id: 212, question: 'Co je hlavním zaměřením postkeynesiánství?', answer: 'Očekávání a nejistota jako klíčové faktory pro ekonomiku' },
      { id: 213, question: 'Co se zaměřuje na psychologické faktory ovlivňující ekonomická rozhodnutí?', answer: 'Behaviorální ekonomie' },
      { id: 214, question: 'Co je základem ekonomie nabídky?', answer: 'Minimalizace zásahů státu a stimulace podnikání' },
      { id: 215, question: 'Co se zaměřuje na analýzu poptávky v ekonomice?', answer: 'Ekonomie poptávky' },
      { id: 216, question: 'Jaké je hlavní zaměření institucionální ekonomie?', answer: 'Význam institucí jako právní systémy nebo politické struktury' },
      { id: 217, question: 'Co tvrdí evoluční ekonomie?', answer: 'Ekonomické systémy se neustále vyvíjejí a mění v čase' },
      { id: 218, question: 'Co je hlavním zájmem ekonomiky blahobytu?', answer: 'Rovnováha mezi efektivitou a spravedlivým rozdělením bohatství' },
      { id: 219, question: 'Co je základem korporativismu?', answer: 'Ekonomické a sociální zájmy by měly být zastupovány organizacemi' },
      { id: 220, question: 'Co charakterizuje teorii racionální volby?', answer: 'Jednotlivci činí rozhodnutí na základě racionální analýzy a maximalizace užitku' },
      { id: 221, question: 'Co je cílem feministické ekonomie?', answer: 'Analyzovat, jak ekonomické systémy ovlivňují muže a ženy různě' },
      { id: 222, question: 'Co tvrdí přístup lidského kapitálu?', answer: 'Investice do vzdělání a školení zvyšují produktivitu a růst' },
      { id: 223, question: 'Co zkoumá ekonomika nelegálních trhů?', answer: 'Studuje trhy, které jsou nelegální, jako obchod s drogami' },
      { id: 224, question: 'Co je cílem kreativní ekonomiky?', answer: 'Zvýšení kreativity a kulturního obsahu v ekonomice' },
      { id: 225, question: 'Co popisuje kruh chudoby?', answer: 'Cyklus, kdy chudoba vede k nižšímu vzdělání a nižším příjmům' },
      { id: 226, question: 'Co podporuje ekonomika poptávky?', answer: 'Zvyšování poptávky v ekonomice prostřednictvím vládních stimulů' },
      { id: 227, question: 'Co doporučuje rakouská škola ekonomie?', answer: 'Volné trhy s minimálním vládním zásahem' },
      { id: 228, question: 'Co je hlavním cílem monetární politiky?', answer: 'Kontrola inflace prostřednictvím řízení peněžní zásoby' },
      { id: 229, question: 'Co znamená termín „poptávka" v mikroekonomii?', answer: 'Schopnost a ochota spotřebitelů nakupovat zboží a služby za určitou cenu' },
      { id: 230, question: 'Co je příkladem pozitivní externality?', answer: 'Vzdělání, které zvyšuje produktivitu pracovních sil' },
      { id: 231, question: 'Co zkoumá mikroekonomie?', answer: 'Chování jednotlivců a firem na trzích' },
      { id: 232, question: 'Co je tržní selhání?', answer: 'Situace, kdy trhy neprodukují efektivní nebo spravedlivé výsledky' },
      { id: 233, question: 'Co je inflace?', answer: 'Růst cen zboží a služeb v ekonomice' },
      { id: 234, question: 'Co znamená termín „neelastická poptávka"?', answer: 'Když poptávka na změnu ceny reaguje minimálně' },
      { id: 235, question: 'Co je charakteristické pro monopol?', answer: 'Jedna firma dominuje na trhu a kontroluje cenu' },
      { id: 236, question: 'Co je marginalní užitek?', answer: 'Užitek získaný z poslední jednotky spotřebovaného zboží' },
      { id: 237, question: 'Co je základním cílem fiskální politiky?', answer: 'Stabilizace ekonomiky prostřednictvím vládních výdajů a daní' },
      { id: 238, question: 'Co je cena elasticity v ekonomii?', answer: 'Míra citlivosti poptávky na změnu ceny' },
      { id: 239, question: 'Co se stane, pokud se zvýší nabídka na trhu?', answer: 'Ceny na trhu obvykle klesnou, pokud poptávka zůstane stejná' },
      { id: 240, question: 'Co je případný zisk v mikroekonomii?', answer: 'Zisk, který firma získá pouze tehdy, když pokryje všechny své náklady' },
      { id: 241, question: 'Co je tržní rovnováha?', answer: 'Situace, kdy nabídka a poptávka jsou vyváženy a cena se stabilizuje' },
      { id: 242, question: 'Co je klíčovým prvkem řízení ekonomiky podle rakouské školy?', answer: 'Volný trh, který se stabilizuje sám' },
      { id: 243, question: 'Co je hlavní myšlenkou teorie lidského kapitálu?', answer: 'Investice do vzdělání a školení zvyšují produktivitu a ekonomický růst' },
      { id: 244, question: 'Co je neviditelná ruka v ekonomii?', answer: 'Tržní mechanismus, který vede k rovnováze prostřednictvím individuálních rozhodnutí' },
      { id: 245, question: 'Co znamená zákon nabídky?', answer: 'Zvýšení nabídky vede ke snížení cen' },
      { id: 246, question: 'Co je cena elasticity v nabídce?', answer: 'Míra, jak se mění nabídka zboží v reakci na změnu ceny' },
      { id: 247, question: 'Co je hlavní výhodou konkurence na trhu?', answer: 'Zvyšuje efektivitu a inovace, což vede ke zlepšení služeb a cen' },
      { id: 248, question: 'Co jsou alternativní náklady?', answer: 'Hodnota nejlepší alternativy, kterou obětujeme při rozhodování' },
      { id: 249, question: 'Co je charakteristické pro oligopol?', answer: 'Trh je tvořen malým počtem velkých firem, které mají značnou tržní sílu' },
      { id: 250, question: 'Co je křivka nabídky?', answer: 'Graf zobrazující vztah mezi cenou a množstvím zboží, které jsou výrobci ochotni nabídnout' },
      { id: 251, question: 'Co je opportunity cost?', answer: 'Alternativní hodnota příležitosti, kterou musíte obětovat' }

    ]
  },




  {
    id: 'moderni-historie',
    title: 'Moderní historie',
    emoji: '🏰',
    description: 'Moderní historie',
    cards: [
      { id: 252, question: 'Kdo byl britským premiérem během první světové války?', answer: 'David Lloyd George' },
      { id: 253, question: 'Co znamenal Versailleský mír?', answer: 'Stanovil podmínky míru mezi Německem a Spojenci po první světové válce' },
      { id: 254, question: 'Kdo byl hlavním představitelem bolševiků během ruské revoluce v roce 1917?', answer: 'Vladimir Lenin' },
      { id: 255, question: 'Kdy vypukla první světová válka?', answer: '1914' },
      { id: 256, question: 'Co byla Sdružení národů (SN)?', answer: 'Politická organizace pro udržení míru a bezpečnosti po první světové válce' },
      { id: 257, question: 'Kdo byl hlavním autorem "Mein Kampf"?', answer: 'Adolf Hitler' },
      { id: 258, question: 'Kdy byla podepsána Mnichovská dohoda?', answer: '1938' },
      { id: 259, question: 'Co způsobilo vypuknutí první světové války?', answer: 'Atentát na Františka Ferdinanda dEste' },
      { id: 260, question: 'Kdo byl předsedou vlády během velké hospodářské krize ve Spojených státech?', answer: 'Franklin D. Roosevelt' },
      { id: 261, question: 'Co znamená termín "New Deal"?', answer: 'Sada ekonomických a sociálních reforem během velké hospodářské krize v USA' },
      { id: 262, question: 'Kdy byla podepsána Locarnská dohoda?', answer: '1925' },
      { id: 263, question: 'Co znamenal Pakt Molotov-Ribbentrop?', answer: 'Pakt mezi Německem a Sovětským svazem o neútočení a o rozdělení Polska' },
      { id: 264, question: 'Kdo byl "muž v černém" v první světové válce?', answer: 'Paul von Hindenburg' },
      { id: 265, question: 'Co byla "Velká červená" revoluce?', answer: 'Občanská válka v Rusku' },
      { id: 266, question: 'Kdo byl francouzským prezidentem během první světové války?', answer: 'Georges Clemenceau' },
      { id: 267, question: 'Kdy byla podepsána Versailleská mírová smlouva?', answer: '1919' },
      { id: 268, question: 'Která země se připojila k Trojitému paktu v roce 1940?', answer: 'Maďarsko' },
      { id: 269, question: 'Co byla hlavní příčina vypuknutí druhé světové války?', answer: 'Nacistická expanze a invaze do Polska' },
      { id: 270, question: 'Co bylo Mnichovskou dohodou?', answer: 'Dohoda, která měla zachovat mír v Evropě, ale umožnila Německu anektovat Sudety' },
      { id: 271, question: 'Kdy začala druhá světová válka?', answer: '1939' },
      { id: 272, question: 'Která organizace vznikla po první světové válce s cílem udržet mír v Evropě?', answer: 'Sdružení národů' },
      { id: 273, question: 'Kdy se konal první "Zimní konflikt" mezi Sovětským svazem a Finskem?', answer: '1939-1940' },
      { id: 274, question: 'Kdo byl autorem knihy "Mein Kampf"?', answer: 'Adolf Hitler' },
      { id: 275, question: 'Které zemi patřil Mandát nad Palestinou?', answer: 'Velká Británie' },
      { id: 276, question: 'Co bylo výsledkem Versailleské smlouvy?', answer: 'Potrestání Německa a rozdělení jeho území' },
      { id: 277, question: 'Co znamená "Münchenský diktát"?', answer: 'Pakt, který povolil Hitlerovi anektovat část Československa' },
      { id: 278, question: 'Co znamená pojem "Velká hospodářská krize"?', answer: 'Krize způsobená kolapsem akciového trhu v roce 1929' },
      { id: 279, question: 'Kdo byl hlavním představitelem "Nového Údělu"?', answer: 'Franklin D. Roosevelt' },
      { id: 280, question: 'Kdy došlo k vypuknutí Korejské války?', answer: '1950' },
      { id: 281, question: 'Co bylo výsledkem Korejské války?', answer: 'Korejský poloostrov zůstal rozdělen na Severní a Jižní Koreu' },
      { id: 282, question: 'Kdy byla postavena Berlínská zeď?', answer: '1961' },
      { id: 283, question: 'Co symbolizovala Berlínská zeď?', answer: 'Rozdělení světa mezi kapitalismus a socialismus' },
      { id: 284, question: 'Kdy byla podepsána Helsinská dohoda?', answer: '1975' },
      { id: 285, question: 'Co znamenala Helsinská dohoda?', answer: 'Dohoda o evropské bezpečnosti a spolupráci' },
      { id: 286, question: 'Kdo byl lídrem Sovětského svazu během Kubánské raketové krize?', answer: 'Nikita Chruščov' },
      { id: 287, question: 'Kdy došlo k kubánské raketové krizi?', answer: '1962' },
      { id: 288, question: 'Co bylo příčinou kubánské raketové krize?', answer: 'Sovětský svaz umístil jaderné rakety na Kubě' },
      { id: 289, question: 'Kdy se k vietnamské válce připojilo USA?', answer: '1965' },
      { id: 290, question: 'Co bylo výsledkem vietnamské války?', answer: 'Jižní Vietnam padl a Vietnam se sjednotil pod komunistickou vládou' },
      { id: 291, question: 'Kdy skončila vietnamská válka?', answer: '1975' },
      { id: 292, question: 'Co znamenal pád Berlínské zdi v roce 1989?', answer: 'Konec studené války a začátek sjednocení Německa' },
      { id: 293, question: 'Co bylo cílem Marshallova plánu?', answer: 'Obnova ekonomiky po druhé světové válce v západní Evropě' },
      { id: 294, question: 'Kdy byla podepsána Pařížská dohoda o Vietnamu?', answer: '1973' },
      { id: 295, question: 'Kdo byl prvním prezidentem Francie po druhé světové válce?', answer: 'Charles de Gaulle' },
      { id: 296, question: 'Kdy začala studená válka?', answer: '1947' },
      { id: 297, question: 'Kdy byl založen NATO?', answer: '1949' },
      { id: 298, question: 'Co bylo cílem NATO?', answer: 'Zajistit vojenskou ochranu západních států před sovětskou hrozbou' },
      { id: 299, question: 'Kdy došlo k vypuknutí vojenské intervence v Koreji?', answer: '1950' },
      { id: 300, question: 'Co byla Kultura a politika Khrushchova?', answer: 'Nastolení mírové politiky a uvolnění napětí mezi Východem a Západem' },
      { id: 301, question: 'Kdy byla podepsána Charta OSN?', answer: '1945' },
      { id: 302, question: 'Kdy vznikla Evropská hospodářská společenství (EHS)?', answer: '1957' },
      { id: 303, question: 'Co znamenala termín "perestrojka"?', answer: 'Ekonomické a politické reformy iniciované Michalem Gorbačovem' },
      { id: 304, question: 'Co znamenala termín "glasnosť"?', answer: 'Politika většího otevření a svobody projevu v Sovětském svazu' },
      { id: 305, question: 'Co bylo záměrem Brežněvovy doktríny?', answer: 'Právo Sovětského svazu zasahovat v socialistických zemích, pokud dojde k ohrožení socialismu' },
      { id: 306, question: 'Co bylo příčinou války ve Vietnamu?', answer: 'Konflikt mezi komunistickým severem a antikomunistickým jihem Vietnamu' },
      { id: 307, question: 'Kdy došlo k pádu Sovětského svazu?', answer: '1991' }
    ]
  },

  {
    id: 'european-union',
    title: 'Evropská unie',
    emoji: '🇪🇺',
    description: 'Instituce a právo EU',
    cards: [
      { id: 308, question: 'Kdy byla založena Evropská hospodářská společenství (EHS)?', answer: '1957' },
      { id: 309, question: 'Kdy byl podepsán Maastrichtský smlouva?', answer: '1992' },
      { id: 310, question: 'Kdy vstoupilo Československo do EU?', answer: '2004' },
      { id: 311, question: 'Kdy byl zaveden euro?', answer: '2002' },
      { id: 312, question: 'Kdy byla podepsána Lisabonská smlouva?', answer: '2007' },
      { id: 313, question: 'Kdy vstoupilo Chorvatsko do EU?', answer: '2013' },
      { id: 314, question: 'Kdy Velká Británie opustila EU?', answer: '2020' },
      { id: 315, question: 'Kdy byla podepsána Schengenská dohoda?', answer: '1985' },
      { id: 316, question: 'Kdy vstoupily Bulharsko a Rumunsko do EU?', answer: '2007' },
      { id: 317, question: 'Kdy byla podepsána Římská smlouva?', answer: '1957' }
    ]
  },

];

// Keep the original mockFlashcards for backward compatibility
export const mockFlashcards: Flashcard[] = mockFlashcardSets[0].cards;

// Mock textbook chapters have been migrated to JSON files in public/data/chapters/
// Use chaptersIndex from src/data/chaptersIndex.ts and loadChapter() from src/lib/loaders.ts instead
 

// Mock audio chapters
export const mockAudioChapters: AudioChapter[] = [
  {
    id: 'integrace',
    title: 'Historie evropské integrace',
    src: '/audio/integrace.mp3'
  },
  {
    id: 'master-margarita',
    title: 'The Master and Margarita by Mikhail Bulgakov',
    src: '/audio/The Master and Margarita by Mikhail Bulgakov.mp3'
  },
  {
    id: 'vietnam-war',
    title: 'Vietnam War',
    src: '/audio/vietnam war.mp3'
  }
];

export const mockProgressData: ProgressData = {
  flashcards: {
    totalCards: 500,
    masteredCards: 320,
    reviewsDue: 25,
    studiedToday: 35,
    completed: 320,
    total: 500,
    percentage: 64
  },
  audiobooks: {
    currentBook: {
      id: 'audio-1',
      title: 'Ústavní právo ČR',
      author: 'Prof. JUDr. Pavel Rychetský',
      coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop'
    },
    currentPosition: 2340, // 39 minutes
    totalDuration: 7200, // 2 hours
    lastAccessed: new Date('2024-01-15T14:30:00'),
    lastAccessedTitle: 'Ústavní právo ČR',
    currentTitle: 'Ústavní právo ČR',
    progress: 32.5
  },
  textbooks: {
    currentChapter: 'Kapitola 5: Občanské právo',
    totalChapters: 12,
    currentPage: 156,
    totalPages: 340,
    bookTitle: 'Základy práva pro střední školy'
  },
  exercises: {
    completedToday: 8,
    streak: 12,
    totalCompleted: 145,
    averageScore: 87.5
  }
};