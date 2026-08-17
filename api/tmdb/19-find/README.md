# Find API (ค้นหาด้วย ID ภายนอก)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/find/{external_id}`

> สรุป: Find By ID
> Find data by external ID's.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `external_id` | path | string | ใช่ | - |
| `external_source` | query | string | ใช่ | - |
| `language` | query | string | ไม่ | - |
#### Response 200

```json
{
  "movie_results": [
    {
      "adult": false,
      "backdrop_path": "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
      "id": 934433,
      "title": "Scream VI",
      "original_language": "en",
      "original_title": "Scream VI",
      "overview": "Following the latest Ghostface killings, the four survivors leave Woodsboro behind and start a fresh chapter.",
      "poster_path": "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
      "media_type": "movie",
      "genre_ids": [
        27,
        9648,
        53
      ],
      "popularity": 853.917,
      "release_date": "2023-03-08",
      "video": false,
      "vote_average": 7.388,
      "vote_count": 708
    }
  ],
  "person_results": [],
  "tv_results": [],
  "tv_episode_results": [],
  "tv_season_results": []
}
```

#### Response Schema

- `movie_results` — array — 
  - `[]` — array items: — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `backdrop_path` — string —  (ตัวอย่าง: `"/44immBwzhDVyjn87b3x3l9mlhAD.jpg"`)
  - `id` — integer —  (ตัวอย่าง: `934433`)
  - `title` — string —  (ตัวอย่าง: `"Scream VI"`)
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_title` — string —  (ตัวอย่าง: `"Scream VI"`)
  - `overview` — string —  (ตัวอย่าง: `"Following the latest Ghostface killings, the four survivors leave Woodsboro behind and start a fresh chapter."`)
  - `poster_path` — string —  (ตัวอย่าง: `"/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg"`)
  - `media_type` — string —  (ตัวอย่าง: `"movie"`)
  - `genre_ids` — array — 
  - `popularity` — number —  (ตัวอย่าง: `853.917`)
  - `release_date` — string —  (ตัวอย่าง: `"2023-03-08"`)
  - `video` — boolean —  (ตัวอย่าง: `false`)
  - `vote_average` — number —  (ตัวอย่าง: `7.388`)
  - `vote_count` — integer —  (ตัวอย่าง: `708`)
- `person_results` — array — 
- `tv_results` — array — 
- `tv_episode_results` — array — 
- `tv_season_results` — array — 

---

