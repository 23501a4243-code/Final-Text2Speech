import { SpeechProject } from '../types/speech';

export const DEMO_SCENARIOS: {
  id: string;
  badge: string;
  title: string;
  recipient: string;
  summary: string;
  project: SpeechProject;
}[] = [
  {
    id: 'demo-best-man',
    badge: 'Popular Wedding Demo',
    title: "Jack's Best Man Speech for Dave",
    recipient: 'Dave & Sarah',
    summary: 'College roommate brotherhood, the 2 AM road trip breakdown, and Dave meeting his match.',
    project: {
      id: 'demo-best-man',
      title: "Jack's Best Man Toast for Dave & Sarah",
      speechType: 'best_man',
      tone: 'balanced',
      length: 'medium',
      createdAt: Date.now() - 3600000 * 24,
      updatedAt: Date.now(),
      wordCount: 545,
      estimatedMinutes: 4.2,
      answers: {
        recipientName: 'Dave and his stunning new wife Sarah',
        speakerRole: 'Best Man and College Roommate',
        relationship: 'College roommates at Michigan, best friends for 11 years',
        storiesAnecdotes: 'The infamous sophomore year road trip where his Honda Civic broke down in a downpour and Dave insisted on fixing the radiator with duct tape and hope; the night he met Sarah at the rooftop bakery fundraiser and texted me 20 minutes in: "I just met the girl I\'m going to marry."',
        admiredQualities: 'Fiercely loyal, the first person to show up with a toolbox when you move, and seeing how calm and genuinely happy he is whenever Sarah is holding his hand.',
        quirksInsideJokes: 'His spreadsheet for deciding which brand of paper towels to buy; his absolute refusal to read instruction manuals.',
        wishesClosingThought: 'May your shared kitchen always smell like good coffee, may you always laugh through life\'s detours, and may Dave always remember the golden marital rule: Sarah is never wrong.',
        audienceContext: 'Family, college crew, and coworkers at a summer vineyard wedding',
      },
      drafts: [
        {
          id: 'draft-1',
          tone: 'balanced',
          length: 'medium',
          createdAt: Date.now(),
          content: `Good evening everyone! If you don't know me, I'm Jack, Dave's college roommate, longtime partner in questionable life decisions, and tonight, the guy honored to stand by his side as Best Man.

First off, Sarah... you look breathtaking. Dave, you look like a guy who miraculously won the greatest lottery in human history—and every single person in this room knows it!

Dave and I met eleven years ago on our first day in Michigan's dorms. Within 48 hours, I learned two unbreakable truths about Dave: first, he will never under any circumstances read an instruction manual. And second, he will solve any crisis with unshakeable optimism and a roll of industrial duct tape. Case in point: our sophomore road trip to Chicago. The radiator blew up in a torrential downpour outside South Bend. Normal people call AAA. Dave popped the hood, looked at me through the steam, and said, "Jack, hold my flashlight. I watched a 30-second YouTube tutorial on this three months ago." Forty miles later, we rolled into Chicago smelling of melted rubber, soaked to the bone, but triumphant. That is Dave: when life throws a storm at him, he doesn't retreat. He rolls up his sleeves, grins, and figures out how to keep moving forward.

For years, people asked me, "What kind of woman could actually keep up with Dave's energy—and tolerate his 14-tab spreadsheets comparing paper towel absorbency?" 

Then came a Friday night four years ago. Dave called me after attending a charity bake-sale fundraiser. Usually, post-party recaps are about basketball scores. But that night, Dave's voice was different—quiet, grounded, and almost in shock. He said, "Jack... I just met the girl I am going to marry. Her name is Sarah, she has the quickest wit on planet Earth, and she just spent thirty minutes debating pizza crust philosophy with me."

Sarah, from the moment you walked into his world, everything clicked. You brought an effortless grace, warmth, and grounded joy to his life. You laugh at his quirks, you challenge his thinking, and most importantly, you make his eyes light up with a peace I have never seen in eleven years of brotherhood. You didn't just become his partner; you became his home.

To Dave and Sarah: marriage isn't just about the sun-drenched days like today. It's about knowing who is holding the flashlight when the engine steams up in the rain. And looking at the two of you tonight, I know there is no road you can't navigate together.

Ladies and gentlemen, please raise your glasses. 

To Dave and Sarah: may your adventures be bold, your laughter loud, your love relentless—and may Dave always remember: happy wife, legendary life. 

Cheers!`,
        },
      ],
      activeDraftIndex: 0,
      content: `Good evening everyone! If you don't know me, I'm Jack, Dave's college roommate, longtime partner in questionable life decisions, and tonight, the guy honored to stand by his side as Best Man.

First off, Sarah... you look breathtaking. Dave, you look like a guy who miraculously won the greatest lottery in human history—and every single person in this room knows it!

Dave and I met eleven years ago on our first day in Michigan's dorms. Within 48 hours, I learned two unbreakable truths about Dave: first, he will never under any circumstances read an instruction manual. And second, he will solve any crisis with unshakeable optimism and a roll of industrial duct tape. Case in point: our sophomore road trip to Chicago. The radiator blew up in a torrential downpour outside South Bend. Normal people call AAA. Dave popped the hood, looked at me through the steam, and said, "Jack, hold my flashlight. I watched a 30-second YouTube tutorial on this three months ago." Forty miles later, we rolled into Chicago smelling of melted rubber, soaked to the bone, but triumphant. That is Dave: when life throws a storm at him, he doesn't retreat. He rolls up his sleeves, grins, and figures out how to keep moving forward.

For years, people asked me, "What kind of woman could actually keep up with Dave's energy—and tolerate his 14-tab spreadsheets comparing paper towel absorbency?" 

Then came a Friday night four years ago. Dave called me after attending a charity bake-sale fundraiser. Usually, post-party recaps are about basketball scores. But that night, Dave's voice was different—quiet, grounded, and almost in shock. He said, "Jack... I just met the girl I am going to marry. Her name is Sarah, she has the quickest wit on planet Earth, and she just spent thirty minutes debating pizza crust philosophy with me."

Sarah, from the moment you walked into his world, everything clicked. You brought an effortless grace, warmth, and grounded joy to his life. You laugh at his quirks, you challenge his thinking, and most importantly, you make his eyes light up with a peace I have never seen in eleven years of brotherhood. You didn't just become his partner; you became his home.

To Dave and Sarah: marriage isn't just about the sun-drenched days like today. It's about knowing who is holding the flashlight when the engine steams up in the rain. And looking at the two of you tonight, I know there is no road you can't navigate together.

Ladies and gentlemen, please raise your glasses. 

To Dave and Sarah: may your adventures be bold, your laughter loud, your love relentless—and may Dave always remember: happy wife, legendary life. 

Cheers!`,
      cueCards: [
        {
          cardIndex: 1,
          stageCue: '[SMILE & BREATHE - WAIT FOR ROOM TO QUIET]',
          content: 'Introduce self as Jack (roommate, best man). Compliment Sarah\'s beauty. Joke about Dave hitting the lottery.',
          timingEstimate: '0:00 - 0:45',
          keyTip: 'Deliver the lottery line with high warmth and direct eye contact with the groom.',
        },
        {
          cardIndex: 2,
          stageCue: '[PAUSE FOR CHUCKLES - LEAN IN]',
          content: 'The 2 unbreakable truths: never reads instruction manuals & solves crises with duct tape. Story: Sophomore road trip radiator breakdown.',
          timingEstimate: '0:45 - 1:45',
          keyTip: 'Quote Dave: "Jack, hold my flashlight. I saw a 30-second tutorial." Let the laughter land.',
        },
        {
          cardIndex: 3,
          stageCue: '[TRANSITION TO WARM SINCERITY - SLOW DOWN]',
          content: 'The 14-tab spreadsheet quirk. The fateful Friday night call after meeting Sarah: "I just met the girl I am going to marry."',
          timingEstimate: '1:45 - 2:45',
          keyTip: 'Tone shift: Make this intimate and heartfelt. Look over at Sarah as you speak of her impact.',
        },
        {
          cardIndex: 4,
          stageCue: '[LOOK AT BOTH DAVE & SARAH]',
          content: 'How Sarah completed his world. The flashlight metaphor: marriage in the storms. Deep admiration for their bond.',
          timingEstimate: '2:45 - 3:45',
          keyTip: 'Lower speaking volume slightly for emotional resonance. Sincere eye contact.',
        },
        {
          cardIndex: 5,
          stageCue: '[RAISE GLASS HIGH - LOOK AT CROWD]',
          content: 'Ask everyone to stand & raise glasses. Final toast: bold adventures, loud laughter, and happy wife, legendary life.',
          timingEstimate: '3:45 - 4:15',
          keyTip: 'Raise glass firmly, smile across the entire room, and deliver "Cheers!" with strength.',
        },
      ],
    },
  },
  {
    id: 'demo-maid-of-honor',
    badge: 'Heartfelt Sisterhood',
    title: "Chloe's Maid of Honor Speech for Emma",
    recipient: 'Emma & Liam',
    summary: 'Childhood pillow fort promises, Emma\'s glowing heart, and welcoming Liam as family.',
    project: {
      id: 'demo-maid-of-honor',
      title: "Chloe's Maid of Honor Toast for Emma & Liam",
      speechType: 'maid_of_honor',
      tone: 'heartfelt',
      length: 'medium',
      createdAt: Date.now() - 3600000 * 12,
      updatedAt: Date.now(),
      wordCount: 512,
      estimatedMinutes: 3.9,
      answers: {
        recipientName: 'Emma and her husband Liam',
        speakerRole: 'Maid of Honor and Sister',
        relationship: 'Sisters and lifelong best friends',
        storiesAnecdotes: 'When we were 7 and 9, making pillow forts in our bedroom whispering about what our dream weddings would look like; the time Liam drove 3 hours in a snowstorm just to deliver Emma\'s forgotten passport before her flight.',
        admiredQualities: 'Emma\'s fierce empathy, how she makes anyone feel like the most important person in the room, and how Liam looks at her with pure, quiet reverence.',
        quirksInsideJokes: 'Her habit of crying during animated dog commercials; her inability to whistle.',
        wishesClosingThought: 'May your home be overflowing with patience, midnight kitchen snacks, and the kind of love that grows more beautiful with every passing year.',
        audienceContext: 'Intimate country estate wedding with family and close childhood friends',
      },
      drafts: [
        {
          id: 'draft-1',
          tone: 'heartfelt',
          length: 'medium',
          createdAt: Date.now(),
          content: `Hi everyone. For those who don't know me, I'm Chloe—Emma's sister, lifelong confidante, and the proudest Maid of Honor in the world today.

Looking at Emma tonight in that dress, I don't just see the breathtaking bride before us. I see the seven-year-old girl who used to build pillow forts with me on Sunday afternoons. Back then, under twinkling fairy lights and tangled bedsheets, we would whisper about our future: who we would become, what adventures we'd have, and what it would feel like to fall in love. 

Emma, you have always had an enormous, tender heart. You are the girl who cries at animated dog commercials, who remembers the birthdays of people she met once three years ago, and who makes anyone standing beside her feel seen, valued, and safe. Having you as a sister has been the greatest gift of my life.

For a long time, I wondered who could possibly deserve that kind of heart. Who could match your gentleness, yet be strong enough to anchor you when life gets stormy?

And then along came Liam.

Liam, I remember the night you officially won over our entire family. Emma had accidentally left her passport at our apartment before an early morning international flight. It was midnight, and a blizzard was shutting down the highway. Liam didn't complain, didn't hesitate—he grabbed his keys, drove three hours through blinding snow, and walked through the terminal doors with coffee in one hand and the passport in the other, smiling as if it were nothing.

That is who Liam is. He shows up. He protects. And the way you look at my sister, Liam... with such deep, quiet adoration, makes my heart sing. You don't just love Emma; you cherish her.

Emma, you found your person. The one who turns everyday moments into celebrations, and quiet evenings into sanctuary.

To my sister and my new brother: may you continue to choose each other every single morning. May your kitchen be full of music, your arguments short, your laughter long, and your love timeless.

Everyone, please raise your glasses to Emma and Liam!`,
        },
      ],
      activeDraftIndex: 0,
      content: `Hi everyone. For those who don't know me, I'm Chloe—Emma's sister, lifelong confidante, and the proudest Maid of Honor in the world today.

Looking at Emma tonight in that dress, I don't just see the breathtaking bride before us. I see the seven-year-old girl who used to build pillow forts with me on Sunday afternoons. Back then, under twinkling fairy lights and tangled bedsheets, we would whisper about our future: who we would become, what adventures we'd have, and what it would feel like to fall in love. 

Emma, you have always had an enormous, tender heart. You are the girl who cries at animated dog commercials, who remembers the birthdays of people she met once three years ago, and who makes anyone standing beside her feel seen, valued, and safe. Having you as a sister has been the greatest gift of my life.

For a long time, I wondered who could possibly deserve that kind of heart. Who could match your gentleness, yet be strong enough to anchor you when life gets stormy?

And then along came Liam.

Liam, I remember the night you officially won over our entire family. Emma had accidentally left her passport at our apartment before an early morning international flight. It was midnight, and a blizzard was shutting down the highway. Liam didn't complain, didn't hesitate—he grabbed his keys, drove three hours through blinding snow, and walked through the terminal doors with coffee in one hand and the passport in the other, smiling as if it were nothing.

That is who Liam is. He shows up. He protects. And the way you look at my sister, Liam... with such deep, quiet adoration, makes my heart sing. You don't just love Emma; you cherish her.

Emma, you found your person. The one who turns everyday moments into celebrations, and quiet evenings into sanctuary.

To my sister and my new brother: may you continue to choose each other every single morning. May your kitchen be full of music, your arguments short, your laughter long, and your love timeless.

Everyone, please raise your glasses to Emma and Liam!`,
      cueCards: [
        {
          cardIndex: 1,
          stageCue: '[BREATHE - SMILE AT EMMA]',
          content: 'Introduce self as sister Chloe. The pillow fort childhood memory and dreaming about the future.',
          timingEstimate: '0:00 - 0:45',
          keyTip: 'Speak softly and fondly. Look at Emma when mentioning the childhood bedroom.',
        },
        {
          cardIndex: 2,
          stageCue: '[WARM CHUCKLE]',
          content: 'Emma\'s giant heart: dog commercials, remembering birthdays, making everyone feel safe.',
          timingEstimate: '0:45 - 1:30',
          keyTip: 'The dog commercial line gives a quick smile before deepening into gratitude.',
        },
        {
          cardIndex: 3,
          stageCue: '[TURN TO FACE LIAM]',
          content: 'Liam winning over the family: the 3-hour blizzard drive with the forgotten passport and coffee.',
          timingEstimate: '1:30 - 2:30',
          keyTip: 'Direct eye contact with Liam. Let your gratitude shine through.',
        },
        {
          cardIndex: 4,
          stageCue: '[LOOK AT BOTH TOGETHER - EMOTIONAL PEAK]',
          content: 'Liam cherishing Emma. Finding her sanctuary and forever person.',
          timingEstimate: '2:30 - 3:15',
          keyTip: 'Slow down your pace. Let the emotion linger comfortably.',
        },
        {
          cardIndex: 5,
          stageCue: '[RAISE GLASS - BROAD SMILE]',
          content: 'Invite everyone to raise a glass. To music in the kitchen, short arguments, and timeless love.',
          timingEstimate: '3:15 - 3:45',
          keyTip: 'Finish on a joyous, confident high note.',
        },
      ],
    },
  },
  {
    id: 'demo-retirement',
    badge: 'Career Legacy Demo',
    title: "Tribute for Robert's 31-Year Career",
    recipient: 'Robert Henderson',
    summary: 'Three decades of engineering leadership, legendary mentorship, and golf course freedom.',
    project: {
      id: 'demo-retirement',
      title: "Honoring Robert Henderson on 31 Years of Excellence",
      speechType: 'retirement',
      tone: 'balanced',
      length: 'medium',
      createdAt: Date.now() - 3600000 * 48,
      updatedAt: Date.now(),
      wordCount: 490,
      estimatedMinutes: 3.8,
      answers: {
        recipientName: 'Robert Henderson, VP of Engineering',
        speakerRole: 'Director of Product & Mentee',
        relationship: 'Mentee and team colleague for 12 years',
        storiesAnecdotes: 'The 2017 server outage on Christmas Eve where Robert showed up at the office in a reindeer sweater with pizzas and fixed the core pipeline alongside junior engineers without a word of frustration.',
        admiredQualities: 'His patience, how he never took credit for successes and always shielded the team during setbacks, and his motto: "We build systems, but we nurture people."',
        quirksInsideJokes: 'His strict rule that all whiteboard diagrams must use green markers; his legendary 3-minute power walks.',
        wishesClosingThought: 'May your golf handicap finally drop into single digits, may you never hear another alarm clock at 6 AM, and may you enjoy every well-earned sunset.',
        audienceContext: 'Company gala with executive staff, engineers, and his family',
      },
      drafts: [
        {
          id: 'draft-1',
          tone: 'balanced',
          length: 'medium',
          createdAt: Date.now(),
          content: `Good evening colleagues, leadership, and most importantly, Robert and his wonderful family.

Thirty-one years. Think about that for a second. When Robert joined this company in 1993, cell phones looked like bricks, our entire database ran on physical floppy disks, and the internet was something people explained using analogies about highways.

Over three decades, companies rise and fall, technologies become obsolete, and org charts shuffle constantly. But across all that change, one constant remained our North Star: Robert Henderson.

I joined Robert's team twelve years ago as an anxious junior product manager. On my second week, I made a deployment mistake that took down our staging environment. I was terrified I'd be fired. Robert walked over to my desk, pulled up a chair, and said, "Congratulations! You just found a vulnerability before our customers did. Now let's grab coffee and write a test so it never happens again."

That is Robert's genius. Where others saw errors, he saw teaching moments. Where others managed metrics, Robert nurtured human potential. He lived by the principle that great engineering isn't just about elegant code—it is about psychological safety and deep respect for the people writing it.

Now, we can't let Robert retire without mentioning his quirks. We will sorely miss his famous green whiteboard markers—which were treated like classified state secrets—and his brisk three-minute hallway power walks where he could somehow solve a six-month architecture dispute between two sips of tea.

Robert, you leave behind patents, scalable platforms, and commercial success. But your true legacy is standing in this room: the hundreds of engineers, managers, and leaders who learned what true integrity looks like by watching you lead.

As you step into this next chapter—trading sprint retrospectives for tee times, and performance reviews for travel adventures—know that this company is forever better because you dedicated your career to it.

Everyone, please join me in raising a toast: to Robert Henderson—mentor, innovator, and legend. Happy retirement!`,
        },
      ],
      activeDraftIndex: 0,
      content: `Good evening colleagues, leadership, and most importantly, Robert and his wonderful family.

Thirty-one years. Think about that for a second. When Robert joined this company in 1993, cell phones looked like bricks, our entire database ran on physical floppy disks, and the internet was something people explained using analogies about highways.

Over three decades, companies rise and fall, technologies become obsolete, and org charts shuffle constantly. But across all that change, one constant remained our North Star: Robert Henderson.

I joined Robert's team twelve years ago as an anxious junior product manager. On my second week, I made a deployment mistake that took down our staging environment. I was terrified I'd be fired. Robert walked over to my desk, pulled up a chair, and said, "Congratulations! You just found a vulnerability before our customers did. Now let's grab coffee and write a test so it never happens again."

That is Robert's genius. Where others saw errors, he saw teaching moments. Where others managed metrics, Robert nurtured human potential. He lived by the principle that great engineering isn't just about elegant code—it is about psychological safety and deep respect for the people writing it.

Now, we can't let Robert retire without mentioning his quirks. We will sorely miss his famous green whiteboard markers—which were treated like classified state secrets—and his brisk three-minute hallway power walks where he could somehow solve a six-month architecture dispute between two sips of tea.

Robert, you leave behind patents, scalable platforms, and commercial success. But your true legacy is standing in this room: the hundreds of engineers, managers, and leaders who learned what true integrity looks like by watching you lead.

As you step into this next chapter—trading sprint retrospectives for tee times, and performance reviews for travel adventures—know that this company is forever better because you dedicated your career to it.

Everyone, please join me in raising a toast: to Robert Henderson—mentor, innovator, and legend. Happy retirement!`,
      cueCards: [
        {
          cardIndex: 1,
          stageCue: '[LOOK OUT ACROSS THE AUDIENCE]',
          content: 'Thirty-one years milestone. 1993 tech nostalgia (brick phones, floppy disks). Robert as the enduring North Star.',
          timingEstimate: '0:00 - 0:45',
          keyTip: 'Set a dignified, celebratory atmosphere.',
        },
        {
          cardIndex: 2,
          stageCue: '[SMILE & GESTURE TOWARDS ROBERT]',
          content: 'Personal memory: Junior PM staging mistake on week 2. Robert\'s grace: "Congratulations, now let\'s grab coffee."',
          timingEstimate: '0:45 - 1:45',
          keyTip: 'This shows his leadership style better than any bullet point list.',
        },
        {
          cardIndex: 3,
          stageCue: '[LIGHTHEARTED CHUCKLE]',
          content: 'Workplace quirks: Green whiteboard markers and 3-minute hallway problem-solving power walks.',
          timingEstimate: '1:45 - 2:30',
          keyTip: 'Colleagues will instantly laugh at the marker reference.',
        },
        {
          cardIndex: 4,
          stageCue: '[SERIOUS & REVERENT - SWEEP ROOM]',
          content: 'His real legacy: not just code or patents, but the people in this room shaped by his mentorship.',
          timingEstimate: '2:30 - 3:15',
          keyTip: 'Let the weight of his legacy sink in before the toast.',
        },
        {
          cardIndex: 5,
          stageCue: '[STAND TALL & RAISE GLASS]',
          content: 'Send-off wishes: golf, sunsets, freedom from alarms. Toast to Robert: mentor, innovator, legend.',
          timingEstimate: '3:15 - 3:45',
          keyTip: 'Lead a rousing round of applause.',
        },
      ],
    },
  },
];
