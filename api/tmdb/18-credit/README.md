# Credit API (เครดิต)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/credit/{credit_id}`

> สรุป: Details
> Get a movie or TV credit details by ID.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `credit_id` | path | string | ใช่ | - |
| `language` | query | string | ไม่ | - |
#### Response 200

```json
{
  "credit_type": "cast",
  "department": "Acting",
  "job": "Actor",
  "media": {
    "adult": false,
    "backdrop_path": "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    "id": 100088,
    "name": "The Last of Us",
    "original_language": "en",
    "original_name": "The Last of Us",
    "overview": "Zwanzig Jahre nachdem die moderne Zivilisation zerstört wurde. – Joel, ein abgehärteter Überlebender, wird angeheuert, um Ellie, ein 14-jähriges Mädchen, aus einer bedrückenden Quarantänezone zu schmuggeln. Was als kleiner Job beginnt, wird bald zu einer brutalen, herzzerreißenden Reise, bei der die beiden die USA durchqueren müssen und aufeinander angewiesen sind, um zu überleben.",
    "poster_path": "/igwIPNClQpGVzb61QlGqcpT5zUy.jpg",
    "media_type": "tv",
    "genre_ids": [
      18
    ],
    "popularity": 898.378,
    "first_air_date": "2023-01-15",
    "vote_average": 8.749,
    "vote_count": 3341,
    "origin_country": [
      "US"
    ],
    "character": "Joel Miller",
    "episodes": [],
    "seasons": [
      {
        "air_date": "2023-01-15",
        "episode_count": 9,
        "id": 144593,
        "name": "Staffel 1",
        "overview": "Die 1. Staffel der Endzeit-Horrorserie The Last of Us feierte ihre Premiere am 15. Januar 2023 bei HBO. In Staffel 1 beginnt für den Überlebenden Joel und das Mädchen Ellie eine Reise durch das postapokalyptische Amerika, in dem Plünderer und mutierte Wesen ihnen nach dem Leben trachten.",
        "poster_path": "/aUQKIpZZ31KWbpdHMCmaV76u78T.jpg",
        "season_number": 1,
        "show_id": 100088
      }
    ]
  },
  "media_type": "tv",
  "id": "6024a814c0ae36003d59cc3c",
  "person": {
    "adult": false,
    "id": 1253360,
    "name": "Pedro Pascal",
    "original_name": "Pedro Pascal",
    "media_type": "person",
    "popularity": 106.095,
    "gender": 2,
    "known_for_department": "Acting",
    "profile_path": "/dBOrm29cr7NUrjiDQMTtrTyDpfy.jpg"
  }
}
```

#### Response Schema

- `credit_type` — string —  (ตัวอย่าง: `"cast"`)
- `department` — string —  (ตัวอย่าง: `"Acting"`)
- `job` — string —  (ตัวอย่าง: `"Actor"`)
- `media` — object — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `backdrop_path` — string —  (ตัวอย่าง: `"/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg"`)
  - `id` — integer —  (ตัวอย่าง: `100088`)
  - `name` — string —  (ตัวอย่าง: `"The Last of Us"`)
  - `original_language` — string —  (ตัวอย่าง: `"en"`)
  - `original_name` — string —  (ตัวอย่าง: `"The Last of Us"`)
  - `overview` — string —  (ตัวอย่าง: `"Zwanzig Jahre nachdem die moderne Zivilisation zerstört wurde. – Joel, ein abgehärteter Überlebender, wird angeheuert, um Ellie, ein 14-jähriges Mädchen, aus einer bedrückenden Quarantänezone zu schmuggeln. Was als kleiner Job beginnt, wird bald zu einer brutalen, herzzerreißenden Reise, bei der die beiden die USA durchqueren müssen und aufeinander angewiesen sind, um zu überleben."`)
  - `poster_path` — string —  (ตัวอย่าง: `"/igwIPNClQpGVzb61QlGqcpT5zUy.jpg"`)
  - `media_type` — string —  (ตัวอย่าง: `"tv"`)
  - `genre_ids` — array — 
  - `popularity` — number —  (ตัวอย่าง: `898.378`)
  - `first_air_date` — string —  (ตัวอย่าง: `"2023-01-15"`)
  - `vote_average` — number —  (ตัวอย่าง: `8.749`)
  - `vote_count` — integer —  (ตัวอย่าง: `3341`)
  - `origin_country` — array — 
  - `character` — string —  (ตัวอย่าง: `"Joel Miller"`)
  - `episodes` — array — 
  - `seasons` — array — 
    - `[]` — array items: — 
    - `air_date` — string —  (ตัวอย่าง: `"2023-01-15"`)
    - `episode_count` — integer —  (ตัวอย่าง: `9`)
    - `id` — integer —  (ตัวอย่าง: `144593`)
    - `name` — string —  (ตัวอย่าง: `"Staffel 1"`)
    - `overview` — string —  (ตัวอย่าง: `"Die 1. Staffel der Endzeit-Horrorserie The Last of Us feierte ihre Premiere am 15. Januar 2023 bei HBO. In Staffel 1 beginnt für den Überlebenden Joel und das Mädchen Ellie eine Reise durch das postapokalyptische Amerika, in dem Plünderer und mutierte Wesen ihnen nach dem Leben trachten."`)
    - `poster_path` — string —  (ตัวอย่าง: `"/aUQKIpZZ31KWbpdHMCmaV76u78T.jpg"`)
    - `season_number` — integer —  (ตัวอย่าง: `1`)
    - `show_id` — integer —  (ตัวอย่าง: `100088`)
- `media_type` — string —  (ตัวอย่าง: `"tv"`)
- `id` — string —  (ตัวอย่าง: `"6024a814c0ae36003d59cc3c"`)
- `person` — object — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `id` — integer —  (ตัวอย่าง: `1253360`)
  - `name` — string —  (ตัวอย่าง: `"Pedro Pascal"`)
  - `original_name` — string —  (ตัวอย่าง: `"Pedro Pascal"`)
  - `media_type` — string —  (ตัวอย่าง: `"person"`)
  - `popularity` — number —  (ตัวอย่าง: `106.095`)
  - `gender` — integer —  (ตัวอย่าง: `2`)
  - `known_for_department` — string —  (ตัวอย่าง: `"Acting"`)
  - `profile_path` — string —  (ตัวอย่าง: `"/dBOrm29cr7NUrjiDQMTtrTyDpfy.jpg"`)

---

