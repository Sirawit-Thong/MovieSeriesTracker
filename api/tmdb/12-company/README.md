# Company API (บริษัท)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/company/{company_id}`

> สรุป: Details
> Get the company details by ID.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `company_id` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "description": "",
  "headquarters": "San Francisco, California",
  "homepage": "https://www.lucasfilm.com",
  "id": 1,
  "logo_path": "/o86DbpburjxrqAzEDhXZcyE8pDb.png",
  "name": "Lucasfilm Ltd.",
  "origin_country": "US",
  "parent_company": null
}
```

#### Response Schema

- `description` — string —  (ตัวอย่าง: `""`)
- `headquarters` — string —  (ตัวอย่าง: `"San Francisco, California"`)
- `homepage` — string —  (ตัวอย่าง: `"https://www.lucasfilm.com"`)
- `id` — integer —  (ตัวอย่าง: `1`)
- `logo_path` — string —  (ตัวอย่าง: `"/o86DbpburjxrqAzEDhXZcyE8pDb.png"`)
- `name` — string —  (ตัวอย่าง: `"Lucasfilm Ltd."`)
- `origin_country` — string —  (ตัวอย่าง: `"US"`)
- `parent_company` — object — 

---

### `GET /3/company/{company_id}/alternative_names`

> สรุป: Alternative Names
> Get the company details by ID.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `company_id` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "id": 1,
  "results": [
    {
      "name": "루카스필름",
      "type": ""
    },
    {
      "name": "Lucasfilm Limited, LLC",
      "type": ""
    },
    {
      "name": "Lucasfilm Ltd. LLC",
      "type": ""
    },
    {
      "name": "Lucasfilm",
      "type": ""
    }
  ]
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `1`)
- `results` — array — 
  - `[]` — array items: — 
  - `name` — string —  (ตัวอย่าง: `"루카스필름"`)
  - `type` — string —  (ตัวอย่าง: `""`)

---

### `GET /3/company/{company_id}/images`

> สรุป: Images
> Get the company logos by id.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `company_id` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "id": 1,
  "logos": [
    {
      "aspect_ratio": 2.97979797979798,
      "file_path": "/o86DbpburjxrqAzEDhXZcyE8pDb.png",
      "height": 99,
      "id": "5aa080d6c3a3683fea00011e",
      "file_type": ".svg",
      "vote_average": 5.384,
      "vote_count": 2,
      "width": 295
    },
    {
      "aspect_ratio": 3.03951367781155,
      "file_path": "/tlVSws0RvvtPBwViUyOFAO0vcQS.png",
      "height": 329,
      "id": "63306b352b8a430096598b3d",
      "file_type": ".svg",
      "vote_average": 5.312,
      "vote_count": 1,
      "width": 1000
    }
  ]
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `1`)
- `logos` — array — 
  - `[]` — array items: — 
  - `aspect_ratio` — number —  (ตัวอย่าง: `2.97979797979798`)
  - `file_path` — string —  (ตัวอย่าง: `"/o86DbpburjxrqAzEDhXZcyE8pDb.png"`)
  - `height` — integer —  (ตัวอย่าง: `99`)
  - `id` — string —  (ตัวอย่าง: `"5aa080d6c3a3683fea00011e"`)
  - `file_type` — string —  (ตัวอย่าง: `".svg"`)
  - `vote_average` — number —  (ตัวอย่าง: `5.384`)
  - `vote_count` — integer —  (ตัวอย่าง: `2`)
  - `width` — integer —  (ตัวอย่าง: `295`)

---

