-- =============================================================================
-- Migration: 0005_seed_demo_content
-- Seeds a default "milrumos" author and 10 published sample pieces (4 sections
-- each) so a fresh deploy has content to explore, search, fork, and branch from.
--
-- Idempotent: every insert is guarded so re-running this migration (e.g. via
-- `supabase db reset`, or by re-applying it manually with psql/the SQL editor)
-- never duplicates the user, the pieces, their sections, or their metadata.
--
-- To (re)run locally:
--   supabase db reset                 -- replays all migrations, including this one
--   -- or, against a running local/linked database:
--   supabase migration up             -- applies any not-yet-applied migrations
--   psql "$DATABASE_URL" -f supabase/migrations/0005_seed_demo_content.sql
-- =============================================================================

do $$
declare
  v_author_id uuid := '11111111-1111-1111-1111-111111111111';
  v_piece_id  uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1. Default "milrumos" author (auth.users + profiles)
  -- ---------------------------------------------------------------------------

  if not exists (select 1 from auth.users where id = v_author_id) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_author_id,
      'authenticated',
      'authenticated',
      'milrumos@milrumos.app',
      '',
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"preferred_username":"milrumos","full_name":"Milrumos","avatar_url":null}',
      now(), now(),
      '', '', '', ''
    );
  end if;

  -- The handle_new_user trigger creates the profile (without a bio) on the
  -- auth.users insert above; top up the bio here, and act as a fallback in
  -- case the trigger is ever missing or disabled.
  insert into public.profiles (id, username, display_name, bio)
  values (
    v_author_id,
    'milrumos',
    'Milrumos',
    'The platform''s own storyteller — original pieces seeded here for you to read, search, and branch from.'
  )
  on conflict (id) do update set bio = excluded.bio
  where public.profiles.bio is null;

  -- ---------------------------------------------------------------------------
  -- 2. Ten published pieces, four sections each, spanning a mix of genres
  -- ---------------------------------------------------------------------------

  -- Piece 1 — Sci-Fi
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'The Lighthouse at the Edge of Time') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'The Lighthouse at the Edge of Time', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'Static at Dawn',
       'Mira had kept the light on Kessel Reef for eleven winters before she noticed the second beam. It rose from the lamp room every morning at 3:14, pale and steady, aimed not at the water but straight up into the dark, as though signaling something that had not arrived yet — and might never.'),
      (v_piece_id, 2, 'The Logbook',
       'In a drawer she never opened, Mira found a logbook filled with her own handwriting, dated thirty years ahead. The entries described storms that hadn''t happened, ships that hadn''t sailed, and a name she didn''t recognize — written, again and again, in the margins: remember the second beam.'),
      (v_piece_id, 3, 'The Visitor',
       'A man came ashore in a boat no one had seen leave the harbor. He said he had read her logbook in a museum that would not be built for forty years, and that the second beam was the only reason he knew to come back and warn her at all.'),
      (v_piece_id, 4, 'What She Chose',
       'On the last night of the season, Mira climbed to the lamp room and stood before the switch that fed the second beam. She thought of the museum, the visitor, the entries in her own hand — and then, slowly, she reached past the switch and turned up the light instead.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Sci-Fi', array['time-travel','lighthouse','solitude'],
       'A lighthouse keeper discovers her beacon isn''t casting light across the water, but across years.');
  end if;

  -- Piece 2 — Fantasy
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'Of Brass and Branches') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'Of Brass and Branches', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'The Orchard of Gears',
       'In the valley of Tor Aiven, the apple trees grew fruit of brass and copper, each one ticking softly with a clockwork heart. Lina had spent her whole life among them, oiling hinges, winding springs, and listening for the trees that hummed wrong — the ones that were, in their slow mechanical way, afraid.'),
      (v_piece_id, 2, 'The Apprentice''s Oath',
       'Master Orrin took her on the morning she fixed a tree no royal engineer could quiet. ''You don''t listen with your ears,'' he told her, pressing a small brass key into her palm. ''You listen with your hands. Promise me you''ll teach that to whoever comes after you — even if it isn''t me.'''),
      (v_piece_id, 3, 'The King''s Order',
       'When the crown decreed that the orchard''s gears be melted down for cannon, Lina stood in the king''s hall in her oil-stained apron and said the only thing she could think to say: that a kingdom which destroys the things that hum is a kingdom that has stopped listening to anything at all.'),
      (v_piece_id, 4, 'What the Roots Remember',
       'They did not melt the orchard. Lina never learned exactly why the king changed his mind, only that he visited the valley once, alone, and stood a long time beneath the oldest tree. Some said he heard it humming. Others said he simply remembered an orchard his own mother had described to him, long ago, in a country far from here.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Fantasy', array['clockwork','forest','rebellion'],
       'In a kingdom where trees grow clockwork fruit, a young mechanic must choose between the crown and the woods that raised her.');
  end if;

  -- Piece 3 — Horror
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'The Quiet House on Moor Lane') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'The Quiet House on Moor Lane', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'Moving Day',
       'The estate agent called it ''full of character,'' which Dana now understood to mean that every door stuck, every floorboard complained, and every room seemed to have an opinion about where the furniture should go. Still, it was theirs — three bedrooms, a garden, and, the agent had mentioned almost as an afterthought, a long and well-documented history.'),
      (v_piece_id, 2, 'The Cold Room',
       'The smallest bedroom never warmed, no matter how high they set the heating. Dana''s daughter Pip liked it best of all the rooms in the house and could not explain why, except to say that it was the only place where she didn''t feel like she was interrupting something.'),
      (v_piece_id, 3, 'Names on the Wall',
       'Behind the wallpaper in the cold room, Dana found a column of names and dates, each one scratched in a different hand, going back further than the house''s official records. The most recent name was dated six years ago. The one above it, Pip''s age exactly, was dated the year Pip was born.'),
      (v_piece_id, 4, 'The House Settles',
       'On their last morning — because there would be a last morning, Dana had already decided that — the house was unusually quiet, the way a person goes quiet when choosing their words carefully. As they carried the final box to the car, Dana glanced back at the cold room window and was almost certain, just for a moment, that the curtain had been pulled aside by a hand still deciding whether to wave.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Horror', array['haunting','family','secrets'],
       'A family inherits a house that remembers everyone who has ever lived in it — and wants to keep one more.');
  end if;

  -- Piece 4 — Romance
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'Letters We Never Sent') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'Letters We Never Sent', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'The Box in the Attic',
       'Twenty-two years after she''d last seen him, Joanna found the shoebox while clearing out her mother''s attic — her own handwriting on the lid, her own name on every envelope inside, none of them stamped, none of them sent. She sat down on the dusty floor and began, finally, to read what she had once been too afraid to say.'),
      (v_piece_id, 2, 'Dear Sam',
       'Dear Sam, the first letter began, I think you should know that I turned down the job in Chicago, and I think you should know why, and I think I''m never going to send this, which is probably the only reason I can write it down at all.'),
      (v_piece_id, 3, 'What I Should Have Said',
       'She found his number through an old mutual friend and dialed it before she could talk herself out of it. When he picked up, she didn''t say hello. She said, ''I have twenty-six letters I wrote you in 2003, and I''m going to read you all of them, if you''ll let me.'''),
      (v_piece_id, 4, 'The Last Envelope',
       'He drove four hours to hear the rest in person. On the kitchen table between them sat the last letter, still sealed, dated the week he''d moved away. Neither of them opened it that night. Some things, they agreed, were worth saving for a morning when they both already knew how the story went.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Romance', array['long-distance','letters','second-chances'],
       'Two old friends rediscover each other through a box of unsent letters written twenty years apart.');
  end if;

  -- Piece 5 — Non-fiction
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'Field Notes from a Smaller Life') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'Field Notes from a Smaller Life', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'Leaving the Noise',
       'I gave notice on the apartment on a Tuesday and signed the lease on the cabin on a Thursday, and in between I did not sleep, certain I had just made the worst decision of my adult life. The cabin had one room, no neighbors, and a woodstove I did not yet know how to use.'),
      (v_piece_id, 2, 'Learning to Wait',
       'The first week, I kept reaching for a phone that had no signal and a kettle that took four times as long to boil as the one I''d left behind. By the second week, I had stopped reaching. By the third, I noticed I had started, without deciding to, simply watching the kettle instead.'),
      (v_piece_id, 3, 'The Visitors',
       'A fox began crossing the clearing every evening at the same hour, so reliably that I started setting my watch by it. I never named it. Naming it felt like the kind of thing the old, noisier version of me would have done — the version who needed everything to be about her.'),
      (v_piece_id, 4, 'What Stayed',
       'I''ve been here fourteen months now, and I won''t pretend the city doesn''t still call to me sometimes, in small, specific ways — a particular bakery, a particular late-night train. But I''ve learned that I can miss a place and still be exactly where I need to be. That, it turns out, was the whole lesson.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Non-fiction', array['memoir','simplicity','nature'],
       'A year of observations from someone who traded a crowded city apartment for a one-room cabin and a notebook.');
  end if;

  -- Piece 6 — Poetry
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'Sonnets for the Unfinished') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'Sonnets for the Unfinished', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'Half a Letter',
       E'I wrote you half a letter once\nand folded it before the close —\nnot for lack of love, but love\ntoo large to fit in tidy rows.\nIt waits still in a drawer somewhere,\nmid-sentence, certain you''d know where\nthe rest of it was always going:\nstraight to you, in my own slow knowing.'),
      (v_piece_id, 2, 'The Garden in March',
       E'Nothing here looks like a garden yet —\njust turned earth and a few bent stakes,\na string line marking what I meant\nbefore the frost decides what breaks.\nBut I have learned to trust the bare\nand call it, simply, getting there.'),
      (v_piece_id, 3, 'Unfinished Symphony',
       E'They say he never wrote the end,\nthat silence was his final note —\nand maybe that''s not loss, my friend,\nbut the truest thing he ever wrote:\nthat some songs teach us how to listen\nby trusting us to hum what''s missing.'),
      (v_piece_id, 4, 'What the Draft Knew',
       E'Every poem I love the most\narrived to me still incomplete —\na door left open, not quite closed,\na chair pulled out, an empty seat.\nPerhaps that''s why they hold me so:\nthey leave a little room to grow.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Poetry', array['verse','longing','change'],
       'A small collection of poems about the things we start and never quite complete — and why that might be alright.');
  end if;

  -- Piece 7 — Fiction
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'The Cartographer''s Apprentice') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'The Cartographer''s Apprentice', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'The Blank Edge of the World',
       'Every map in the Hall of Charts agreed on one thing: north of the Granite Strait, there was nothing but open water, all the way to the edge of the known world. Tessa had spent six years copying that blank space onto vellum before she started to wonder who had decided it was blank, and why no one had checked since.'),
      (v_piece_id, 2, 'The Captain Who Didn''t Believe Her',
       E'Captain Orsa laughed when the apprentice cartographer asked for passage north. ''There''s nothing there, girl. That''s why it''s blank.''\nTessa set her satchel on his table and said, ''Then sailing there should cost you nothing but time. And if I''m wrong, you can tell every port from here to the Strait that you proved the maps right.'''),
      (v_piece_id, 3, 'Land That Moves',
       'What they found was not open water but an archipelago of islands that drifted, slow as held breath, repositioning themselves with the seasons — which was, Tessa realized with a jolt of dizzy delight, exactly why no chart had ever managed to hold them still long enough to draw.'),
      (v_piece_id, 4, 'The Map She Drew Instead',
       'She didn''t draw the islands where they were. She drew them where they would be, season by season, with careful notes on the tides that moved them. It was the strangest chart the Hall of Charts had ever filed — and the only one, the harbor masters later admitted, that had ever actually worked.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Fiction', array['adventure','maps','mentorship'],
       'An apprentice mapmaker is sent to chart a coastline that, according to every existing map, does not exist.');
  end if;

  -- Piece 8 — Essay
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'Notes on Leaving') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'Notes on Leaving', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'Packing',
       'There is a particular kind of honesty that only comes out when you are deciding what to keep. The book you''ve never finished. The mug with the chip you''ve never minded. The jacket that doesn''t fit anymore but still smells, faintly, like a year you weren''t ready to fold up and put in a box.'),
      (v_piece_id, 2, 'The Last Walk',
       'I took the long way to the station on purpose, past the bakery, the bench by the canal, the corner where I once stood in the rain for forty minutes waiting for someone who never came. I wanted to say goodbye to all of it properly, the good and the merely true.'),
      (v_piece_id, 3, 'What We Call Home',
       'We talk about home as though it were a place that waits for us, unchanged, ready to be returned to. But a place keeps living without you in it. The real question was never whether I could go back. It was whether the home I remembered still existed anywhere to go back to.'),
      (v_piece_id, 4, 'Arriving Somewhere New',
       'On my first night in the new city, I unpacked exactly one box — the one with the chipped mug — and made tea I didn''t really want, just to use it. It didn''t feel like home yet. But it felt, for the first time in weeks, like a beginning instead of an ending, and that was enough to sleep on.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Essay', array['departure','memory','identity'],
       'A short essay on the strange grammar of goodbyes — to places, people, and the selves we used to be.');
  end if;

  -- Piece 9 — Other (comedy)
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'The Vending Machine at the End of the World') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'The Vending Machine at the End of the World', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'Aisle Three',
       E'When the sirens stopped, Greg was standing in front of the snack aisle with a dollar in one hand and absolutely no idea what to do with the rest of his life. The woman crouched behind the counter looked up at him and said, ''If you''re buying, the world is definitely ending. Get the good chips.'''),
      (v_piece_id, 2, 'The Machine Doesn''t Care',
       E'The vending machine ate Greg''s dollar and gave him nothing in return, which felt, on a day like today, like the single most personally insulting thing that had happened to him. ''I would like to speak to a manager,'' he announced to the empty store, and the woman, whose name turned out to be Priya, began to laugh and could not stop.'),
      (v_piece_id, 3, 'Negotiations',
       'They spent the next hour debating, with total seriousness, whether the apocalypse legally voided Greg''s claim to the bag of chips currently wedged in the machine''s coil. Priya argued that all contracts were void. Greg argued that a dollar was a dollar, end of the world or not, and that some principles had to survive even if nothing else did.'),
      (v_piece_id, 4, 'Closing Time',
       'In the end, Priya climbed over the counter, gave the machine one expert kick to a spot Greg would never have found on his own, and the chips dropped free. They split the bag sitting on the curb outside, watching a sky that was doing something skies didn''t usually do, and agreed that, all things considered, the chips were worth it.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Other', array['comedy','apocalypse','friendship'],
       'Two strangers shelter from the end of civilization in a gas station — and argue about whether the snack machine still owes them change.');
  end if;

  -- Piece 10 — Sci-Fi
  if not exists (select 1 from public.pieces where author_id = v_author_id and title = 'Signal Loss') then
    insert into public.pieces (author_id, title, status)
    values (v_author_id, 'Signal Loss', 'published')
    returning id into v_piece_id;

    insert into public.sections (piece_id, ordinal, title, content) values
      (v_piece_id, 1, 'Routine Check',
       'Station Operator Hale ran the morning diagnostics the way she had every morning for six years: relay status green, solar arrays nominal, no incoming traffic. The ''no incoming traffic'' line had stopped surprising her sometime around year three. By year six, she had started saying good morning to the console out of something like loneliness, and something like habit.'),
      (v_piece_id, 2, 'The Silence on the Line',
       'She ran the long-range scan twice, then a third time, just to be sure the equipment wasn''t at fault. It wasn''t. Earth''s automated relays were still broadcasting their schedules, their weather, their endless looping advertisements — but nothing, anywhere in the system, was listening for a response from a station this far out anymore. No one had been listening for years.'),
      (v_piece_id, 3, 'Talking to No One',
       'For three days, Hale recorded messages anyway: status reports, observations, the small details of a life lived at the edge of everything. She told the silence about the comet she''d tracked in March, the malfunction she''d fixed with a paperclip and pure stubbornness, the way the stars looked from a window no one else would ever stand in front of.'),
      (v_piece_id, 4, 'The Last Transmission',
       'On the fourth day, she changed the frequency of her broadcast — not toward Earth, but outward, toward the dark beyond the relay''s normal range, on the small chance that someone, someday, might be listening from the other direction. Then she made tea, sat down at the console, and, for the first time in years, waited for an answer with something that felt almost like hope.');

    insert into public.piece_metadata (piece_id, genre, tags, idea_summary) values
      (v_piece_id, 'Sci-Fi', array['space','isolation','communication'],
       'The last operator of a deep-space relay station must decide what to transmit when she realizes no one on Earth is listening anymore.');
  end if;

end $$;
