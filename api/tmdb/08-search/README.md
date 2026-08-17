# Search API (ค้นหา)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/search/collection`

> สรุป: Collection
> Search for collections by their original, translated and alternative names.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `query` | query | string | ใช่ | - |
| `include_adult` | query | boolean | ไม่ | - |
| `language` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
| `region` | query | string | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/zuW6fOiusv4X9nnW3paHGfXcSll.jpg",
      "id": 86311,
      "name": "The Avengers Collection",
      "original_language": "en",
      "original_name": "The Avengers Collection",
      "overview": "A superhero film series produced by Marvel Studios based on the Marvel Comics superhero team of the same name, and part of the Marvel Cinematic Universe (MCU).  The series features an ensemble cast from the Marvel Cinematic Universe series films, as they join forces for the peacekeeping organization S.H.I.E.L.D. led by Nick Fury.",
      "poster_path": "/yFSIUVTCvgYrpalUktulvk3Gi5Y.jpg"
    }
  ],
  "total_pages": 1,
  "total_results": 1
}
```

#### Response Schema

- `page` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `backdrop_path` — string —  (ตัวอย่าง: `"/zuW6fOiusv4X9nnW3paHGfXcSll.jpg"`)
  - `id` — integer —  (ตัวอย่าง: `86311`)
  - `name` — string —  (ตัวอย่าง: `"The Avengers Collection"`)
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_name` — string —  (ตัวอย่าง: `"The Avengers Collection"`)
  - `overview` — string —  (ตัวอย่าง: `"A superhero film series produced by Marvel Studios based on the Marvel Comics superhero team of the same name, and part of the Marvel Cinematic Universe (MCU).  The series features an ensemble cast from the Marvel Cinematic Universe series films, as they join forces for the peacekeeping organization S.H.I.E.L.D. led by Nick Fury."`)
  - `poster_path` — string —  (ตัวอย่าง: `"/yFSIUVTCvgYrpalUktulvk3Gi5Y.jpg"`)
- `total_pages` — integer —  (ตัวอย่าง: `1`)
- `total_results` — integer —  (ตัวอย่าง: `1`)

---

### `GET /3/search/company`

> สรุป: Company
> Search for companies by their original and alternative names.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `query` | query | string | ใช่ | - |
| `page` | query | integer | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "id": 3268,
      "logo_path": "/tuomPhY2UtuPTqqFnKMVHvSb724.png",
      "name": "HBO",
      "origin_country": "US"
    },
    {
      "id": 142414,
      "logo_path": "/tC3oVZvqpwhAG1uSjpMnmj4nW3O.png",
      "name": "HBO Asia",
      "origin_country": "SG"
    },
    {
      "id": 143571,
      "logo_path": null,
      "name": "HBO Showcase",
      "origin_country": ""
    },
    {
      "id": 14914,
      "logo_path": "/1RZBWz53SpHUTLpRcM8BGv2plIP.png",
      "name": "HBO Documentary Films",
      "origin_country": "US"
    },
    {
      "id": 119349,
      "logo_path": null,
      "name": "HBO Central Europe",
      "origin_country": ""
    },
    {
      "id": 48582,
      "logo_path": "/tyoN6zoxMJ71GBddxVkk4dpaeze.png",
      "name": "HBO Europe",
      "origin_country": ""
    },
    {
      "id": 147188,
      "logo_path": null,
      "name": "HBO / Cinemax",
      "origin_country": ""
    },
    {
      "id": 7429,
      "logo_path": "/6in9uMqxXEHx5XgYgkeRBpZ4rPw.png",
      "name": "HBO Films",
      "origin_country": "US"
    },
    {
      "id": 158691,
      "logo_path": "/s5ELD35ShWgVKQxgERHM2iP5bXA.png",
      "name": "HBO Max",
      "origin_country": "US"
    },
    {
      "id": 21222,
      "logo_path": "/baMruKL2uRhJ1Soi4flSHVzXIH2.png",
      "name": "HBO Independent Productions",
      "origin_country": "US"
    },
    {
      "id": 27289,
      "logo_path": null,
      "name": "HBO Bulgaria",
      "origin_country": ""
    },
    {
      "id": 128608,
      "logo_path": null,
      "name": "H-Bomb Films",
      "origin_country": ""
    },
    {
      "id": 89525,
      "logo_path": null,
      "name": "HBO Family",
      "origin_country": ""
    },
    {
      "id": 37659,
      "logo_path": "/zfouUSOEq718TbB9YqN9OylPtD7.png",
      "name": "HBO Polska",
      "origin_country": "PL"
    },
    {
      "id": 136561,
      "logo_path": "/mReKmOZLemFcWlMocCwiq3XbsbB.png",
      "name": "HBO Europe",
      "origin_country": "CZ"
    },
    {
      "id": 44618,
      "logo_path": "/vh38lPSFvesAuOQ8r5TrUT9Vur5.png",
      "name": "HBO Latin America",
      "origin_country": ""
    },
    {
      "id": 67207,
      "logo_path": null,
      "name": "HBO Downtown Productions",
      "origin_country": ""
    },
    {
      "id": 11489,
      "logo_path": null,
      "name": "HBO/Cinemax Documentary",
      "origin_country": ""
    },
    {
      "id": 13670,
      "logo_path": null,
      "name": "HBO Romania",
      "origin_country": "RO"
    },
    {
      "id": 6751,
      "logo_path": "/giPzzhPdiNloiuwo7qLagRn5uGH.png",
      "name": "HBO Sports",
      "origin_country": "US"
    }
  ],
  "total_pages": 2,
  "total_results": 22
}
```

#### Response Schema

- `page` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `id` — integer —  (ตัวอย่าง: `3268`)
  - `logo_path` — string —  (ตัวอย่าง: `"/tuomPhY2UtuPTqqFnKMVHvSb724.png"`)
  - `name` — string —  (ตัวอย่าง: `"HBO"`)
  - `origin_country` — string —  (ตัวอย่าง: `"US"`)
- `total_pages` — integer —  (ตัวอย่าง: `2`)
- `total_results` — integer —  (ตัวอย่าง: `22`)

---

### `GET /3/search/keyword`

> สรุป: Keyword
> Search for keywords by their name.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `query` | query | string | ใช่ | - |
| `page` | query | integer | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "id": 262419,
      "name": "lost"
    },
    {
      "id": 5930,
      "name": "getting lost"
    },
    {
      "id": 249351,
      "name": "lost wallet"
    },
    {
      "id": 213077,
      "name": "lost youth"
    },
    {
      "id": 41309,
      "name": "lost of friend"
    },
    {
      "id": 215483,
      "name": "lost daughter"
    },
    {
      "id": 251248,
      "name": "paradise lost"
    },
    {
      "id": 215583,
      "name": "lost colony"
    },
    {
      "id": 215678,
      "name": "partially lost film"
    },
    {
      "id": 163088,
      "name": "lost tribe"
    },
    {
      "id": 222130,
      "name": "lost continent"
    },
    {
      "id": 223620,
      "name": "lost in the woods"
    },
    {
      "id": 169953,
      "name": "lost treasure"
    },
    {
      "id": 170333,
      "name": "innocence lost"
    },
    {
      "id": 225280,
      "name": "partly lost"
    },
    {
      "id": 227948,
      "name": "lost children"
    },
    {
      "id": 288632,
      "name": "lost girl"
    },
    {
      "id": 179553,
      "name": "lost pet"
    },
    {
      "id": 179578,
      "name": "lost at sea"
    },
    {
      "id": 181429,
      "name": "lost film"
    }
  ],
  "total_pages": 5,
  "total_results": 84
}
```

#### Response Schema

- `page` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `id` — integer —  (ตัวอย่าง: `262419`)
  - `name` — string —  (ตัวอย่าง: `"lost"`)
- `total_pages` — integer —  (ตัวอย่าง: `5`)
- `total_results` — integer —  (ตัวอย่าง: `84`)

---

### `GET /3/search/movie`

> สรุป: Movie
> Search for movies by their original, translated and alternative titles.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `query` | query | string | ใช่ | - |
| `include_adult` | query | boolean | ไม่ | - |
| `language` | query | string | ไม่ | - |
| `primary_release_year` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
| `region` | query | string | ไม่ | - |
| `year` | query | string | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
      "genre_ids": [
        18,
        53,
        35
      ],
      "id": 550,
      "original_language": "en",
      "original_title": "Fight Club",
      "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
      "popularity": 73.433,
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "release_date": "1999-10-15",
      "title": "Fight Club",
      "video": false,
      "vote_average": 8.433,
      "vote_count": 26279
    },
    {
      "adult": false,
      "backdrop_path": "/1VqE5z4VIOcNcajJuHLk4fDkY9G.jpg",
      "genre_ids": [
        28,
        27
      ],
      "id": 289732,
      "original_language": "zh",
      "original_title": "屍城",
      "overview": "It's the end of the century at a corner of the city in a building riddled with crime - Everyone in the building has turned into zombies. After Jenny's boyfriend is killed in a zombie attack, she faces the challenge of surviving in the face of adversity. In order to stay alive, she struggles with Andy to flee danger.",
      "popularity": 15.263,
      "poster_path": "/u8u3KVq0qfJYmNDsaTVOXy4So6f.jpg",
      "release_date": "2014-10-23",
      "title": "Zombie Fight Club",
      "video": false,
      "vote_average": 4.721,
      "vote_count": 52
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        35,
        18
      ],
      "id": 323667,
      "original_language": "ru",
      "original_title": "Вставай и бейся",
      "overview": "Intertwined stories from the gladiator/athletes participating to the Calcio Storico Fiorentino yearly championship.",
      "popularity": 2.744,
      "poster_path": "/rPCOC0myV3Vr7nYGMAOAOpUXgH3.jpg",
      "release_date": "2015-06-21",
      "title": "Florence Fight Club",
      "video": false,
      "vote_average": 5.722,
      "vote_count": 9
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [],
      "id": 973534,
      "original_language": "ru",
      "original_title": "Бойцовский клуб (русская версия)",
      "overview": "The Russian version of the movie \"Fight Club\" is not just a Russian version of a well-known cult film, it is the result and of the hard work of two young men and their love for cinema, Alexander Kukhar (GOLOBON-TV) and Dmitry Ivanov (GRIZLIK FILM) , who are responsible for this project, from the development of its idea and the selection of the cast, to the organization of filming and financial support.  Filming lasted a whole year. Everyday work, constant trips, searching for suitable film sets and an exhausting schedule - all this was not in vain and resulted in an unusually amazing and original project - the film \"Fight Club\", created in the very heart of southern Russia, in the city of Krasnodar, by two young people",
      "popularity": 0.874,
      "poster_path": null,
      "release_date": "",
      "title": "Fight Club (Russian version)",
      "video": false,
      "vote_average": 7.4,
      "vote_count": 6
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [],
      "id": 883656,
      "original_language": "en",
      "original_title": "GCW Fight Club",
      "overview": "GCW presents Fight Club straight from the Showboat Hotel in Atlantic City, NJ! The event features the GCW World Championship match where Mox defends against Gage in a match that we have been waiting for during the last decade. Who will be the new GCW World Champion?",
      "popularity": 1.953,
      "poster_path": "/a9RWdhRLyx3BqCjlwmZJHXyeMkR.jpg",
      "release_date": "2021-10-09",
      "title": "GCW Fight Club",
      "video": true,
      "vote_average": 6.5,
      "vote_count": 5
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        28
      ],
      "id": 347807,
      "original_language": "hi",
      "original_title": "Fight Club: Members Only",
      "overview": "Four friends head off to Bombay and get involved in the mother and father of all gang wars.",
      "popularity": 2.26,
      "poster_path": "/aXFmWfWYCCxQTkCn7K86RvDiMHZ.jpg",
      "release_date": "2006-02-17",
      "title": "Fight Club: Members Only",
      "video": false,
      "vote_average": 4.5,
      "vote_count": 12
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        99
      ],
      "id": 259016,
      "original_language": "en",
      "original_title": "Insane Fight Club",
      "overview": "A group of friends have created a brand new subculture that is taking over the streets of Glasgow. They've established their very own fight club, but this is no ordinary wrestling event - this is brutal, riotous chaos. Fights don't always stay inside the ring, people are bounced off the side of buses and thrown off balconies in pubs. They now plan the biggest show of their lives. The stakes are high, will it bring them the fame and recognition they need to survive?",
      "popularity": 1.614,
      "poster_path": null,
      "release_date": "2014-03-11",
      "title": "Insane Fight Club",
      "video": false,
      "vote_average": 4.333,
      "vote_count": 3
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        28,
        18,
        80
      ],
      "id": 51021,
      "original_language": "en",
      "original_title": "Lure: Teen Fight Club",
      "overview": "A community is under siege as three Belmont Highschool coed students go missing with no trace of their whereabouts. The pressure is on the police to capture the culprits responsible. Scouring the school hallways in search of clues, undercover female detective Maggie Rawdon (Jessica Sonnerborn) enters Belmont High as a transfer student in an attempt to solve the hideous disappearance of the students. Maggie makes a few new friends, and gets invited to a private rave in the country. Just as the group begins to suspect that they've taken a wrong turn, however, the trap is sprung and Maggie finds out firsthand what fate has befallen the missing girls.",
      "popularity": 0.983,
      "poster_path": "/ipl6NdM0LwyakzLH9gKBDn8YhmZ.jpg",
      "release_date": "2010-11-16",
      "title": "Lure: Teen Fight Club",
      "video": false,
      "vote_average": 5.556,
      "vote_count": 9
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        28,
        99,
        12
      ],
      "id": 104782,
      "original_language": "it",
      "original_title": "Florence Fight Club",
      "overview": "Four men decided to enter in the oldest Fight Club of the History, The Florentine Football tournament. A father and son, a black guy, an old champion and outsider clerk will enter in an arena of the time to win their fears, to go over their limits, to be heroes for a day.",
      "popularity": 0.6,
      "poster_path": null,
      "release_date": "2010-01-01",
      "title": "Florence Fight Club",
      "video": false,
      "vote_average": 7,
      "vote_count": 1
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        99
      ],
      "id": 532155,
      "original_language": "en",
      "original_title": "Musangwe: Fight Club",
      "overview": "The first rule is that there are no rules. For the bare-knuckle combatants competing in Musangwe fights, anything goes - you can even put a curse on him. The sport, which dates back centuries, has become a South African institution. Any male from the age of nine to ninety can compete. We follow a group of fighters as they slug it out in the ring. Who will be this year's champion?",
      "popularity": 0.6,
      "poster_path": "/tZDxttt0LfgAKwvLIWyOO3fr01c.jpg",
      "release_date": "2007-10-01",
      "title": "Musangwe: Fight Club",
      "video": false,
      "vote_average": 6.25,
      "vote_count": 4
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [],
      "id": 289100,
      "original_language": "en",
      "original_title": "Girls Fight Club",
      "overview": "The best women's wrestling competition of all time...and if you think it's fake you're in for a big surprise See LEGENDARY Mixed Martial Arts fighters coach their teams to victory in the cage! aka Chuck Lidell's Girl's Fight Club",
      "popularity": 0.6,
      "poster_path": null,
      "release_date": "2009-06-18",
      "title": "Girls Fight Club",
      "video": false,
      "vote_average": 5.25,
      "vote_count": 2
    },
    {
      "adult": false,
      "backdrop_path": "/lBENxZ1nmHXkTKV0AJu1agnW8Mg.jpg",
      "genre_ids": [],
      "id": 877672,
      "original_language": "en",
      "original_title": "Superhero Fight Club",
      "overview": "Oliver introduces Barry to his own little fight club which features such members as Roy Harper, Laurel Lance, Malcolm Merlyn and Ra's Al Ghul.",
      "popularity": 0.6,
      "poster_path": "/riAUCTb0NBakJxlBMB801gQlF1j.jpg",
      "release_date": "2015-04-13",
      "title": "Superhero Fight Club",
      "video": false,
      "vote_average": 6.375,
      "vote_count": 9
    },
    {
      "adult": false,
      "backdrop_path": "/z8MzErK9gYLHgvqYKMapqk7rqyZ.jpg",
      "genre_ids": [],
      "id": 877673,
      "original_language": "en",
      "original_title": "Superhero Fight Club 2.0",
      "overview": "Barry and Oliver introduce Supergirl to the new fight club, Felicity and Cisco applying additional features to the fight in which The Flash, Green Arrow, Supergirl, White Canary, Firestorm and Atom need to fight to stay alive.",
      "popularity": 0.632,
      "poster_path": "/edt0iegDlAqPddRunIixcpNsja4.jpg",
      "release_date": "2016-09-29",
      "title": "Superhero Fight Club 2.0",
      "video": false,
      "vote_average": 6.5,
      "vote_count": 6
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        16,
        35
      ],
      "id": 615408,
      "original_language": "en",
      "original_title": "Fight Club But With Tennis And No Fight",
      "overview": "Drama descends upon two tennis-obsessed women as the tension moves from off the court and into the café.",
      "popularity": 0.6,
      "poster_path": "/8pEQqVtSpgCtb7dzhR55EO1dC3l.jpg",
      "release_date": "2019-07-13",
      "title": "Fight Club But With Tennis And No Fight",
      "video": false,
      "vote_average": 7,
      "vote_count": 1
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [],
      "id": 969532,
      "original_language": "en",
      "original_title": "GCW: Fight Club Houston",
      "overview": "On July 9th GCW presents Fight Club Houston straight from Premier Arena in Houston, Texas. The lineup is almost completed, check it below:  AJ Gray vs Bryan Keith  Nick Gage vs Sadika  Joey Janela vs Dante  Ninja Mack vs Jack Cartwheel  Effy vs Gino  Jimmy Lloyd vs Carter  Lucha Scramble  .... more to be added soon!",
      "popularity": 0.6,
      "poster_path": "/353CATo61TQERENVF6AqIqhUD51.jpg",
      "release_date": "2021-07-09",
      "title": "GCW: Fight Club Houston",
      "video": true,
      "vote_average": 5,
      "vote_count": 1
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [],
      "id": 944789,
      "original_language": "en",
      "original_title": "Leopard Fight Club",
      "overview": "Witness a remarkable coming-of-age story as we track a young leopard's journey from rookie to royalty in South Africa's lethal Big Five landscape. When we first meet Jack, he's clumsy, fearful, and weak, but he's a fast learner - and he'll need to be. He's destined for a showdown with the area's current leopard monarch, an alpha male with a real mean streak. We follow Jack as he hones his skills and builds up muscle for the ultimate catfight. It's a battle where only the winner will walk out alive.",
      "popularity": 0.6,
      "poster_path": "/pNhu0kvxvBJhpzDEwKf9Zdphbfg.jpg",
      "release_date": "",
      "title": "Leopard Fight Club",
      "video": false,
      "vote_average": 6,
      "vote_count": 1
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        99
      ],
      "id": 151912,
      "original_language": "en",
      "original_title": "Jurassic Fight Club",
      "overview": "Jurassic Fight Club, a paleontology-based miniseries that ran for 12 episodes, depicts how prehistoric beasts hunted their prey, dissecting these battles and uncovering a predatory world far more calculated and complex than originally thought. It was hosted by George Blasing, a self-taught paleontologist.",
      "popularity": 0.742,
      "poster_path": null,
      "release_date": "2008-10-22",
      "title": "Jurassic Fight Club",
      "video": false,
      "vote_average": 7.4,
      "vote_count": 5
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [
        99
      ],
      "id": 322772,
      "original_language": "en",
      "original_title": "Insane Fight Club II - This Time It’s Personal",
      "overview": "Insane Fight Club is back. This year the boys are taking their unique form of entertainment to England as they stage fight nights in Birmingham, Leeds, Liverpool and Newcastle.",
      "popularity": 2.348,
      "poster_path": null,
      "release_date": "2015-01-21",
      "title": "Insane Fight Club II - This Time It’s Personal",
      "video": false,
      "vote_average": 7,
      "vote_count": 2
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [],
      "id": 818666,
      "original_language": "en",
      "original_title": "Triller Fight Club: Jake Paul vs Ben Askren",
      "overview": "Jake Paul vs. Ben Askren is an professional boxing match between YouTuber Jake Paul and former MMA fighter Ben Askren.  The bout took take place on April 17, 2021, at the Mercedes-Benz Stadium in Atlanta, Georgia.",
      "popularity": 1.467,
      "poster_path": "/pFxHnZhetfHpXlcYTNTFZFt6pBq.jpg",
      "release_date": "2021-04-17",
      "title": "Triller Fight Club: Jake Paul vs Ben Askren",
      "video": true,
      "vote_average": 5,
      "vote_count": 3
    },
    {
      "adult": false,
      "backdrop_path": null,
      "genre_ids": [],
      "id": 935845,
      "original_language": "en",
      "original_title": "GCW: Fight Club 2 Houston",
      "overview": "Are you ready for the GCW: Fight Club 2?  On February 4th GCW: Fight Club 2 is live on FITE straight from Houston Premier Arena, TX!  Check the full lineup below:  4-way match  Mascara Dorada vs Gringo Loco vs Blake Christian vs ASF  Atticus Cogar vs Gino Medina  All-Star Scramble  Matthew Justice vs Allie Katch vs Grim Reefer vs Jimmy Lloyd vs Jordan Oliver vs Chris Carter  GCW Extreme Championship  AJ Gray vs Mysterious Q  Bryan Keith vs Effy  Ninja Mack vs Nick Wayne  Loko Wrestling Championship  Dante Leon vs Sam Stackhouse  Matt Tremont vs Sadika  *lineup subject to change",
      "popularity": 0.6,
      "poster_path": "/bPPvoNxWcoqSvw0SnigOZpcxKmN.jpg",
      "release_date": "2022-02-04",
      "title": "GCW: Fight Club 2 Houston",
      "video": true,
      "vote_average": 8,
      "vote_count": 1
    }
  ],
  "total_pages": 2,
  "total_results": 39
}
```

#### Response Schema

- `page` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `backdrop_path` — string —  (ตัวอย่าง: `"/hZkgoQYus5vegHoetLkCJzb17zJ.jpg"`)
  - `genre_ids` — array — 
  - `id` — integer —  (ตัวอย่าง: `550`)
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_title` — string —  (ตัวอย่าง: `"Fight Club"`)
  - `overview` — string —  (ตัวอย่าง: `"A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion."`)
  - `popularity` — number —  (ตัวอย่าง: `73.433`)
  - `poster_path` — string —  (ตัวอย่าง: `"/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"`)
  - `release_date` — string —  (ตัวอย่าง: `"1999-10-15"`)
  - `title` — string —  (ตัวอย่าง: `"Fight Club"`)
  - `video` — boolean —  (ตัวอย่าง: `false`)
  - `vote_average` — number —  (ตัวอย่าง: `8.433`)
  - `vote_count` — integer —  (ตัวอย่าง: `26279`)
- `total_pages` — integer —  (ตัวอย่าง: `2`)
- `total_results` — integer —  (ตัวอย่าง: `39`)

---

### `GET /3/search/multi`

> สรุป: Multi
> Use multi search when you want to search for movies, TV shows and people in a single request.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `query` | query | string | ใช่ | - |
| `include_adult` | query | boolean | ไม่ | - |
| `language` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
#### Response 200

```json
[object Object]
```

#### Response Schema

- `page` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `backdrop_path` — string —  (ตัวอย่าง: `"/aDYSnJAK0BTVeE8osOy22Kz3SXY.jpg"`)
  - `id` — integer —  (ตัวอย่าง: `11`)
  - `title` — string —  (ตัวอย่าง: `"Star Wars"`)
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_title` — string —  (ตัวอย่าง: `"Star Wars"`)
  - `overview` — string —  (ตัวอย่าง: `"Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire."`)
  - `poster_path` — string —  (ตัวอย่าง: `"/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg"`)
  - `media_type` — string —  (ตัวอย่าง: `"movie"`)
  - `genre_ids` — array — 
  - `popularity` — number —  (ตัวอย่าง: `78.047`)
  - `release_date` — string —  (ตัวอย่าง: `"1977-05-25"`)
  - `video` — boolean —  (ตัวอย่าง: `false`)
  - `vote_average` — number —  (ตัวอย่าง: `8.208`)
  - `vote_count` — integer —  (ตัวอย่าง: `18528`)
  - `name` — string — 
  - `original_name` — string — 
- `total_pages` — integer —  (ตัวอย่าง: `11`)
- `total_results` — integer —  (ตัวอย่าง: `201`)

---

### `GET /3/search/person`

> สรุป: Person
> Search for people by their name and also known as names.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `query` | query | string | ใช่ | - |
| `include_adult` | query | boolean | ไม่ | - |
| `language` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "gender": 2,
      "id": 31,
      "known_for_department": "Acting",
      "name": "Tom Hanks",
      "original_name": "Tom Hanks",
      "popularity": 84.631,
      "profile_path": "/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg",
      "known_for": [
        {
          "adult": false,
          "backdrop_path": "/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg",
          "id": 13,
          "title": "Forrest Gump",
          "original_language": "en",
          "original_title": "Forrest Gump",
          "overview": "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.",
          "poster_path": "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
          "media_type": "movie",
          "genre_ids": [
            35,
            18,
            10749
          ],
          "popularity": 67.209,
          "release_date": "1994-06-23",
          "video": false,
          "vote_average": 8.481,
          "vote_count": 24525
        },
        {
          "adult": false,
          "backdrop_path": "/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg",
          "id": 862,
          "title": "Toy Story",
          "original_language": "en",
          "original_title": "Toy Story",
          "overview": "Led by Woody, Andy's toys live happily in his room until Andy's birthday brings Buzz Lightyear onto the scene. Afraid of losing his place in Andy's heart, Woody plots against Buzz. But when circumstances separate Buzz and Woody from their owner, the duo eventually learns to put aside their differences.",
          "poster_path": "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
          "media_type": "movie",
          "genre_ids": [
            16,
            12,
            10751,
            35
          ],
          "popularity": 119.802,
          "release_date": "1995-10-30",
          "video": false,
          "vote_average": 7.969,
          "vote_count": 16613
        },
        {
          "adult": false,
          "backdrop_path": "/vxJ08SvwomfKbpboCWynC3uqUg4.jpg",
          "id": 497,
          "title": "The Green Mile",
          "original_language": "en",
          "original_title": "The Green Mile",
          "overview": "A supernatural tale set on death row in a Southern prison, where gentle giant John Coffey possesses the mysterious power to heal people's ailments. When the cell block's head guard, Paul Edgecomb, recognizes Coffey's miraculous gift, he tries desperately to help stave off the condemned man's execution.",
          "poster_path": "/o0lO84GI7qrG6XFvtsPOSV7CTNa.jpg",
          "media_type": "movie",
          "genre_ids": [
            14,
            18,
            80
          ],
          "popularity": 77.553,
          "release_date": "1999-12-10",
          "video": false,
          "vote_average": 8.507,
          "vote_count": 15310
        }
      ]
    }
  ],
  "total_pages": 1,
  "total_results": 1
}
```

#### Response Schema

- `page` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `gender` — integer —  (ตัวอย่าง: `2`)
  - `id` — integer —  (ตัวอย่าง: `31`)
  - `known_for_department` — string —  (ตัวอย่าง: `"Acting"`)
  - `name` — string —  (ตัวอย่าง: `"Tom Hanks"`)
  - `original_name` — string —  (ตัวอย่าง: `"Tom Hanks"`)
  - `popularity` — number —  (ตัวอย่าง: `84.631`)
  - `profile_path` — string —  (ตัวอย่าง: `"/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg"`)
  - `known_for` — array — 
    - `[]` — array items: — 
    - `adult` — boolean —  (ตัวอย่าง: `false`)
    - `backdrop_path` — string —  (ตัวอย่าง: `"/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg"`)
    - `id` — integer —  (ตัวอย่าง: `13`)
    - `title` — string —  (ตัวอย่าง: `"Forrest Gump"`)
    - `original_language` — string —  (ตัวอย่าง: `"en"`)
    - `original_title` — string —  (ตัวอย่าง: `"Forrest Gump"`)
    - `overview` — string —  (ตัวอย่าง: `"A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him."`)
    - `poster_path` — string —  (ตัวอย่าง: `"/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg"`)
    - `media_type` — string —  (ตัวอย่าง: `"movie"`)
    - `genre_ids` — array — 
    - `popularity` — number —  (ตัวอย่าง: `67.209`)
    - `release_date` — string —  (ตัวอย่าง: `"1994-06-23"`)
    - `video` — boolean —  (ตัวอย่าง: `false`)
    - `vote_average` — number —  (ตัวอย่าง: `8.481`)
    - `vote_count` — integer —  (ตัวอย่าง: `24525`)
- `total_pages` — integer —  (ตัวอย่าง: `1`)
- `total_results` — integer —  (ตัวอย่าง: `1`)

---

### `GET /3/search/tv`

> สรุป: TV
> Search for TV shows by their original, translated and also known as names.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `query` | query | string | ใช่ | - |
| `first_air_date_year` | query | integer | ไม่ | Search only the first air date. Valid values are: 1000..9999 |
| `include_adult` | query | boolean | ไม่ | - |
| `language` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
| `year` | query | integer | ไม่ | Search the first air date and all episode air dates. Valid values are: 1000..9999 |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/bsNm9z2TJfe0WO3RedPGWQ8mG1X.jpg",
      "genre_ids": [
        18,
        80
      ],
      "id": 1396,
      "origin_country": [
        "US"
      ],
      "original_language": "en",
      "original_name": "Breaking Bad",
      "overview": "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
      "popularity": 298.884,
      "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      "first_air_date": "2008-01-20",
      "name": "Breaking Bad",
      "vote_average": 8.879,
      "vote_count": 11536
    }
  ],
  "total_pages": 1,
  "total_results": 1
}
```

#### Response Schema

- `page` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `backdrop_path` — string —  (ตัวอย่าง: `"/bsNm9z2TJfe0WO3RedPGWQ8mG1X.jpg"`)
  - `genre_ids` — array — 
  - `id` — integer —  (ตัวอย่าง: `1396`)
  - `origin_country` — array — 
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_name` — string —  (ตัวอย่าง: `"Breaking Bad"`)
  - `overview` — string —  (ตัวอย่าง: `"When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime."`)
  - `popularity` — number —  (ตัวอย่าง: `298.884`)
  - `poster_path` — string —  (ตัวอย่าง: `"/ggFHVNu6YYI5L9pCfOacjizRGt.jpg"`)
  - `first_air_date` — string —  (ตัวอย่าง: `"2008-01-20"`)
  - `name` — string —  (ตัวอย่าง: `"Breaking Bad"`)
  - `vote_average` — number —  (ตัวอย่าง: `8.879`)
  - `vote_count` — integer —  (ตัวอย่าง: `11536`)
- `total_pages` — integer —  (ตัวอย่าง: `1`)
- `total_results` — integer —  (ตัวอย่าง: `1`)

---

