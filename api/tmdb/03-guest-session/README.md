# Guest Session API (เซสชันผู้เยี่ยมชม)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/guest_session/{guest_session_id}/rated/movies`

> สรุป: Rated Movies
> Get the rated movies for a guest session.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `guest_session_id` | path | string | ใช่ | - |
| `language` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
| `sort_by` | query | string | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/ikR2qy9xJCHX7M8i5rcvuNfdYXs.jpg",
      "genre_ids": [
        18,
        80
      ],
      "id": 16,
      "original_language": "en",
      "original_title": "Dancer in the Dark",
      "overview": "Selma, a Czech immigrant on the verge of blindness, struggles to make ends meet for herself and her son, who has inherited the same genetic disorder and will suffer the same fate without an expensive operation. When life gets too difficult, Selma learns to cope through her love of musicals, escaping life's troubles - even if just for a moment - by dreaming up little numbers to the rhythmic beats of her surroundings.",
      "popularity": 14.684,
      "poster_path": "/8Wdd3fQfbbQeoSfWpHrDfaFNhBU.jpg",
      "release_date": "2000-06-30",
      "title": "Dancer in the Dark",
      "video": false,
      "vote_average": 7.885,
      "vote_count": 1549,
      "rating": 8.5
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
  - `backdrop_path` — string —  (ตัวอย่าง: `"/ikR2qy9xJCHX7M8i5rcvuNfdYXs.jpg"`)
  - `genre_ids` — array — 
  - `id` — integer —  (ตัวอย่าง: `16`)
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_title` — string —  (ตัวอย่าง: `"Dancer in the Dark"`)
  - `overview` — string —  (ตัวอย่าง: `"Selma, a Czech immigrant on the verge of blindness, struggles to make ends meet for herself and her son, who has inherited the same genetic disorder and will suffer the same fate without an expensive operation. When life gets too difficult, Selma learns to cope through her love of musicals, escaping life's troubles - even if just for a moment - by dreaming up little numbers to the rhythmic beats of her surroundings."`)
  - `popularity` — number —  (ตัวอย่าง: `14.684`)
  - `poster_path` — string —  (ตัวอย่าง: `"/8Wdd3fQfbbQeoSfWpHrDfaFNhBU.jpg"`)
  - `release_date` — string —  (ตัวอย่าง: `"2000-06-30"`)
  - `title` — string —  (ตัวอย่าง: `"Dancer in the Dark"`)
  - `video` — boolean —  (ตัวอย่าง: `false`)
  - `vote_average` — number —  (ตัวอย่าง: `7.885`)
  - `vote_count` — integer —  (ตัวอย่าง: `1549`)
  - `rating` — number —  (ตัวอย่าง: `8.5`)
- `total_pages` — integer —  (ตัวอย่าง: `1`)
- `total_results` — integer —  (ตัวอย่าง: `1`)

---

### `GET /3/guest_session/{guest_session_id}/rated/tv`

> สรุป: Rated TV
> Get the rated TV shows for a guest session.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `guest_session_id` | path | string | ใช่ | - |
| `language` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
| `sort_by` | query | string | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
      "genre_ids": [
        10765,
        18,
        10759
      ],
      "id": 1399,
      "origin_country": [
        "US"
      ],
      "original_language": "en",
      "original_name": "Game of Thrones",
      "overview": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and icy horrors beyond.",
      "popularity": 404.299,
      "poster_path": "/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
      "first_air_date": "2011-04-17",
      "name": "Game of Thrones",
      "vote_average": 8.436,
      "vote_count": 21025,
      "rating": 8.5
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
  - `backdrop_path` — string —  (ตัวอย่าง: `"/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg"`)
  - `genre_ids` — array — 
  - `id` — integer —  (ตัวอย่าง: `1399`)
  - `origin_country` — array — 
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_name` — string —  (ตัวอย่าง: `"Game of Thrones"`)
  - `overview` — string —  (ตัวอย่าง: `"Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and icy horrors beyond."`)
  - `popularity` — number —  (ตัวอย่าง: `404.299`)
  - `poster_path` — string —  (ตัวอย่าง: `"/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg"`)
  - `first_air_date` — string —  (ตัวอย่าง: `"2011-04-17"`)
  - `name` — string —  (ตัวอย่าง: `"Game of Thrones"`)
  - `vote_average` — number —  (ตัวอย่าง: `8.436`)
  - `vote_count` — integer —  (ตัวอย่าง: `21025`)
  - `rating` — number —  (ตัวอย่าง: `8.5`)
- `total_pages` — integer —  (ตัวอย่าง: `1`)
- `total_results` — integer —  (ตัวอย่าง: `1`)

---

### `GET /3/guest_session/{guest_session_id}/rated/tv/episodes`

> สรุป: Rated TV Episodes
> Get the rated TV episodes for a guest session.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `guest_session_id` | path | string | ใช่ | - |
| `language` | query | string | ไม่ | - |
| `page` | query | integer | ไม่ | - |
| `sort_by` | query | string | ไม่ | - |
#### Response 200

```json
{
  "page": 1,
  "results": [
    {
      "air_date": "2011-04-17",
      "episode_number": 1,
      "id": 63056,
      "name": "Winter Is Coming",
      "overview": "Jon Arryn, the Hand of the King, is dead. King Robert Baratheon plans to ask his oldest friend, Eddard Stark, to take Jon's place. Across the sea, Viserys Targaryen plans to wed his sister to a nomadic warlord in exchange for an army.",
      "production_code": "101",
      "runtime": 62,
      "season_number": 1,
      "show_id": 1399,
      "still_path": "/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg",
      "vote_average": 7.843,
      "vote_count": 286,
      "rating": 8.5
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
  - `air_date` — string —  (ตัวอย่าง: `"2011-04-17"`)
  - `episode_number` — integer —  (ตัวอย่าง: `1`)
  - `id` — integer —  (ตัวอย่าง: `63056`)
  - `name` — string —  (ตัวอย่าง: `"Winter Is Coming"`)
  - `overview` — string —  (ตัวอย่าง: `"Jon Arryn, the Hand of the King, is dead. King Robert Baratheon plans to ask his oldest friend, Eddard Stark, to take Jon's place. Across the sea, Viserys Targaryen plans to wed his sister to a nomadic warlord in exchange for an army."`)
  - `production_code` — string —  (ตัวอย่าง: `"101"`)
  - `runtime` — integer —  (ตัวอย่าง: `62`)
  - `season_number` — integer —  (ตัวอย่าง: `1`)
  - `show_id` — integer —  (ตัวอย่าง: `1399`)
  - `still_path` — string —  (ตัวอย่าง: `"/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg"`)
  - `vote_average` — number —  (ตัวอย่าง: `7.843`)
  - `vote_count` — integer —  (ตัวอย่าง: `286`)
  - `rating` — number —  (ตัวอย่าง: `8.5`)
- `total_pages` — integer —  (ตัวอย่าง: `1`)
- `total_results` — integer —  (ตัวอย่าง: `1`)

---

