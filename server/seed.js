import db from './db.js';

export function seedSampleData() {
  const initialItems = [
    // Stories
    {
      author_handle: 'quiet_owl_482',
      type: 'story',
      topic: 'Breakup',
      title: 'The apartment when the train passes',
      body: 'You left in October, but every night around 11:42 when the night freight rolls through the valley, the glasses in the cupboard still clink together the exact way they did when we both used to pause our conversations and smile. I haven’t moved the glasses. I probably never will.',
      content_warning: 0,
      how_long_ago: '6 months ago',
    },
    {
      author_handle: 'misty_crane_302',
      type: 'story',
      topic: 'Unrequited love',
      title: 'In the margins of your thesis',
      body: 'I proofread three hundred pages of your dissertation just to spend eight hours in the library basement across from you. You thanked me in the acknowledgments as your "dearest colleague." I smiled, said congratulations, and walked home in the pouring rain.',
      content_warning: 0,
      how_long_ago: '2 years ago',
    },
    {
      author_handle: 'solitary_fox_719',
      type: 'story',
      topic: 'Crush',
      title: 'Platform 3, always the same umbrella',
      body: 'You always carry that faded mustard yellow umbrella with the wooden handle. On mornings when it drizzles, seeing you standing under the platform awning makes a dreary Monday commuter train feel like a scene from an old film. I will never say hello, but I hope your days are gentle.',
      content_warning: 0,
      how_long_ago: 'This morning',
    },
    {
      author_handle: 'fading_moth_108',
      type: 'story',
      topic: 'Deep thought',
      title: 'The silence after everyone leaves',
      body: 'We spend our entire youth building noise—parties, ambition, phones ringing, notifications. Then one day in your thirties, you sit in a room with just the sound of a wall clock ticking, and you realize peace isn’t empty. It’s the fullest thing you will ever touch.',
      content_warning: 0,
      how_long_ago: 'Last week',
    },
    {
      author_handle: 'velvet_raven_554',
      type: 'story',
      topic: 'Trauma',
      title: 'The smell of burnt copper',
      body: 'For years after the hospital, the smell of warm machinery would make my throat close up completely. Today at the mechanic shop, I smelled it, took three slow box breaths, and my hands didn’t even shake. The body remembers, but piece by piece, it also forgives itself.',
      content_warning: 1,
      how_long_ago: '3 years ago',
    },
    // Letters
    {
      author_handle: 'quiet_moth_301',
      type: 'letter',
      topic: 'Letter',
      addressee: 'E.',
      body: 'I still haven’t deleted your voicemail from that Tuesday in Madrid when you lost your passport and laughed until you cried on the street corner. Sometimes I play the first three seconds just to verify that your voice was real and not something I invented to keep the dark warm.',
      sign_off: 'Forever unseen,',
    },
    {
      author_handle: 'pale_crane_881',
      type: 'letter',
      topic: 'Letter',
      addressee: 'Dad',
      body: 'I finally bought the vintage blue kettle you always talked about fixing. It sits on my stove. I made tea in it this morning, sat by the window, and forgave you for everything you didn’t know how to carry.',
      sign_off: 'With quiet love,',
    },
    // Perspectives
    {
      author_handle: 'midnight_owl_990',
      type: 'thought',
      topic: 'Deep thought',
      title: 'Grief is just love with no place to go',
      body: 'When someone disappears from your life, the care you had for them doesn’t evaporate. It accumulates in the muscles of your shoulders, in the way you pause before opening a doorway. To mourn is simply to carry unspent tenderness.',
    },
    {
      author_handle: 'somber_sparrow_612',
      type: 'thought',
      topic: 'Opinion',
      title: 'Being understood is rarer than being loved',
      body: 'Many people will love you for what you make them feel, or how you fit into their portrait of a quiet life. But to have even one person look at your strangest shadows and nod without blinking—that is the only true miracle.',
    },
    // Music
    {
      author_handle: 'echoing_loon_221',
      type: 'music',
      topic: 'Music',
      song_title: 'Motion Picture Soundtrack',
      song_artist: 'Radiohead',
      song_link: 'https://open.spotify.com/track/4gqdKk4vDq59s67a1m22F1',
      song_mood: 'Heartbreak',
      body: 'The harp at the end sounds like the moment you watch someone walk through airport security and you know in your chest you will never touch their hands again.',
    },
    {
      author_handle: 'velvet_moth_773',
      type: 'music',
      topic: 'Music',
      song_title: 'Holocene',
      song_artist: 'Bon Iver',
      song_link: 'https://open.spotify.com/track/4fbvXwMTXUKaCDvg6zp0w2',
      song_mood: 'Healing',
      body: '“And at once I knew I was not magnificent.” The greatest relief in my entire life was realizing the universe does not demand that I be extraordinary—only that I be gentle.',
    },
    // Books
    {
      author_handle: 'solitary_hare_115',
      type: 'book',
      topic: 'Book',
      book_title: 'The Year of Magical Thinking',
      book_author: 'Joan Didion',
      book_mood_tag: 'Heartbroken',
      body: 'She writes about loss with the precision of a surgeon holding cold steel. It gave me permission to be completely unhinged by grief without feeling ashamed of it.',
    },
    {
      author_handle: 'misty_raven_442',
      type: 'book',
      topic: 'Book',
      book_title: 'When Breath Becomes Air',
      book_author: 'Paul Kalanithi',
      book_mood_tag: 'Healing',
      body: 'A young neurosurgeon facing mortality who shows what it actually means to meet the end of your days with dignity, courage, and fierce love.',
    },
    // Occult (Dark Corner)
    {
      author_handle: 'hidden_shadow_602',
      type: 'occult',
      topic: 'Cult experience',
      title: 'The retreat center with no clocks',
      body: 'We were told to surrender our watches and cellphones at the gate for "spiritual clarity." For four months, the only measure of time was the gong for dawn meditation and the leader’s voice over the loudspeaker. It took three years after walking out in the middle of the night to stop looking over my shoulder every time a bell rang.',
      content_warning: 0,
    },
    {
      author_handle: 'drifting_ember_194',
      type: 'occult',
      topic: 'Dreams',
      title: 'The recurring house with the locked staircase',
      body: 'Since childhood, once every few months I return to the same stone house in my sleep. There is always a winding wooden staircase leading down into black water. In waking life, I have never seen this house, but I know the texture of the handrail better than my own childhood home.',
      content_warning: 0,
    },
  ];

  const checkStmt = db.prepare('SELECT id FROM posts WHERE author_handle = ? AND body = ?');
  const insertStmt = db.prepare(`
    INSERT INTO posts (
      author_handle, type, topic, title, body, sign_off, addressee,
      visibility, how_long_ago, content_warning, song_title, song_artist, song_link, song_mood,
      book_title, book_author, book_mood_tag, is_sample, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      'public', ?, ?, ?, ?, ?, ?,
      ?, ?, ?, 1, CURRENT_TIMESTAMP
    )
  `);

  for (const item of initialItems) {
    const exists = checkStmt.get(item.author_handle, item.body);
    if (!exists) {
      insertStmt.run(
        item.author_handle,
        item.type,
        item.topic,
        item.title || null,
        item.body,
        item.sign_off || null,
        item.addressee || null,
        item.how_long_ago || null,
        item.content_warning || 0,
        item.song_title || null,
        item.song_artist || null,
        item.song_link || null,
        item.song_mood || null,
        item.book_title || null,
        item.book_author || null,
        item.book_mood_tag || null
      );
    }
  }
}

seedSampleData();
