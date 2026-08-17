# Network API (เครือข่าย)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/network/{network_id}`

> สรุป: Details

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `network_id` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "headquarters": "New York City, New York",
  "homepage": "https://www.hbo.com",
  "id": 49,
  "logo_path": "/tuomPhY2UtuPTqqFnKMVHvSb724.png",
  "name": "HBO",
  "origin_country": "US"
}
```

#### Response Schema

- `headquarters` — string —  (ตัวอย่าง: `"New York City, New York"`)
- `homepage` — string —  (ตัวอย่าง: `"https://www.hbo.com"`)
- `id` — integer —  (ตัวอย่าง: `49`)
- `logo_path` — string —  (ตัวอย่าง: `"/tuomPhY2UtuPTqqFnKMVHvSb724.png"`)
- `name` — string —  (ตัวอย่าง: `"HBO"`)
- `origin_country` — string —  (ตัวอย่าง: `"US"`)

---

### `GET /3/network/{network_id}/alternative_names`

> สรุป: Alternative Names
> Get the alternative names of a network.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `network_id` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "id": 49,
  "results": [
    {
      "name": "Home Box Office",
      "type": ""
    },
    {
      "name": "HBO HD",
      "type": ""
    }
  ]
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `49`)
- `results` — array — 
  - `[]` — array items: — 
  - `name` — string —  (ตัวอย่าง: `"Home Box Office"`)
  - `type` — string —  (ตัวอย่าง: `""`)

---

### `GET /3/network/{network_id}/images`

> สรุป: Images
> Get the TV network logos by id.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `network_id` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "id": 49,
  "logos": [
    {
      "aspect_ratio": 2.425287356321839,
      "file_path": "/tuomPhY2UtuPTqqFnKMVHvSb724.png",
      "height": 174,
      "id": "5a7a67a40e0a26020a000091",
      "file_type": ".svg",
      "vote_average": 5.318,
      "vote_count": 3,
      "width": 422
    },
    {
      "aspect_ratio": 2.424242424242424,
      "file_path": "/hizvY65SpyF3BPY2qsBZMgUOxjs.png",
      "height": 495,
      "id": "63e7979663aad200858726da",
      "file_type": ".png",
      "vote_average": 5.312,
      "vote_count": 1,
      "width": 1200
    }
  ]
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `49`)
- `logos` — array — 
  - `[]` — array items: — 
  - `aspect_ratio` — number —  (ตัวอย่าง: `2.425287356321839`)
  - `file_path` — string —  (ตัวอย่าง: `"/tuomPhY2UtuPTqqFnKMVHvSb724.png"`)
  - `height` — integer —  (ตัวอย่าง: `174`)
  - `id` — string —  (ตัวอย่าง: `"5a7a67a40e0a26020a000091"`)
  - `file_type` — string —  (ตัวอย่าง: `".svg"`)
  - `vote_average` — number —  (ตัวอย่าง: `5.318`)
  - `vote_count` — integer —  (ตัวอย่าง: `3`)
  - `width` — integer —  (ตัวอย่าง: `422`)

---

