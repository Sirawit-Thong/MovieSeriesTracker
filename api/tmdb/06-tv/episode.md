# TV Episode API (ข้อมูลตอนทีวี)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}`

> สรุป: Details
> Query the details of a TV episode.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `series_id` | path | integer | ใช่ | - |
| `season_number` | path | integer | ใช่ | - |
| `episode_number` | path | integer | ใช่ | - |
| `append_to_response` | query | string | ไม่ | comma separated list of endpoints within this namespace, 20 items max |
| `language` | query | string | ไม่ | - |
#### Response 200

```json
{
  "air_date": "2011-04-17",
  "crew": [
    {
      "department": "Directing",
      "job": "Director",
      "credit_id": "5256c8a219c2956ff6046e77",
      "adult": false,
      "gender": 2,
      "id": 44797,
      "known_for_department": "Directing",
      "name": "Timothy Van Patten",
      "original_name": "Timothy Van Patten",
      "popularity": 7.775,
      "profile_path": "/MzSOFrd99HRdr6pkSRSctk3kBR.jpg"
    },
    {
      "job": "Director of Photography",
      "department": "Camera",
      "credit_id": "54eef2429251417974005cb6",
      "adult": false,
      "gender": 2,
      "id": 1318704,
      "known_for_department": "Directing",
      "name": "Alik Sakharov",
      "original_name": "Alik Sakharov",
      "popularity": 1.347,
      "profile_path": null
    },
    {
      "job": "Editor",
      "department": "Editing",
      "credit_id": "54eef2ab925141795f005d4f",
      "adult": false,
      "gender": 2,
      "id": 18077,
      "known_for_department": "Editing",
      "name": "Oral Norrie Ottey",
      "original_name": "Oral Norrie Ottey",
      "popularity": 1.4,
      "profile_path": null
    },
    {
      "job": "Writer",
      "department": "Writing",
      "credit_id": "5256c8a219c2956ff6046e4b",
      "adult": false,
      "gender": 2,
      "id": 228068,
      "known_for_department": "Writing",
      "name": "D.B. Weiss",
      "original_name": "D.B. Weiss",
      "popularity": 3.838,
      "profile_path": "/2RMejaT793U9KRk2IEbFfteQntE.jpg"
    },
    {
      "job": "Writer",
      "department": "Writing",
      "credit_id": "5256c8a019c2956ff6046e2b",
      "adult": false,
      "gender": 2,
      "id": 9813,
      "known_for_department": "Writing",
      "name": "David Benioff",
      "original_name": "David Benioff",
      "popularity": 6.729,
      "profile_path": "/xvNN5huL0X8yJ7h3IZfGG4O2zBD.jpg"
    }
  ],
  "episode_number": 1,
  "guest_stars": [
    {
      "character": "Benjen Stark",
      "credit_id": "5256c8b919c2956ff604836a",
      "order": 62,
      "adult": false,
      "gender": 2,
      "id": 119783,
      "known_for_department": "Acting",
      "name": "Joseph Mawle",
      "original_name": "Joseph Mawle",
      "popularity": 6.758,
      "profile_path": "/1Ocb9v3h54beGVoJMm4w50UQhLf.jpg"
    },
    {
      "character": "Khal Drogo",
      "credit_id": "5256c8a219c2956ff6046f40",
      "order": 63,
      "adult": false,
      "gender": 2,
      "id": 117642,
      "known_for_department": "Acting",
      "name": "Jason Momoa",
      "original_name": "Jason Momoa",
      "popularity": 72.117,
      "profile_path": "/6dEFBpZH8C8OijsynkSajQT99Pb.jpg"
    },
    {
      "character": "Rickon Stark",
      "credit_id": "566a83bcc3a3683f56003604",
      "order": 83,
      "adult": false,
      "gender": 2,
      "id": 1050248,
      "known_for_department": "Acting",
      "name": "Art Parkinson",
      "original_name": "Art Parkinson",
      "popularity": 8.666,
      "profile_path": "/ejAKOJME1DsvHECLWdQ7dEtXyyc.jpg"
    },
    {
      "character": "Hodor",
      "credit_id": "5256c8be19c2956ff6048446",
      "order": 84,
      "adult": false,
      "gender": 2,
      "id": 1223792,
      "known_for_department": "Acting",
      "name": "Kristian Nairn",
      "original_name": "Kristian Nairn",
      "popularity": 4.073,
      "profile_path": "/dlbq6cCW0xdpFY15q6flP6lDXWV.jpg"
    },
    {
      "character": "Will",
      "credit_id": "6176291c924ce50044219a23",
      "order": 809,
      "adult": false,
      "gender": 2,
      "id": 75076,
      "known_for_department": "Acting",
      "name": "Bronson Webb",
      "original_name": "Bronson Webb",
      "popularity": 4.772,
      "profile_path": "/foMvmr6ch16GGM1L413KA9UQKIO.jpg"
    },
    {
      "character": "Jon Arryn",
      "credit_id": "6176293a172d7f009254e782",
      "order": 810,
      "adult": false,
      "gender": 2,
      "id": 11282,
      "known_for_department": "Acting",
      "name": "John Standing",
      "original_name": "John Standing",
      "popularity": 3.88,
      "profile_path": "/4jxM3KYsykVd2IPUaGAv3KYgDUT.jpg"
    },
    {
      "character": "Waymar Royce",
      "credit_id": "61774bcd71f0950042d37204",
      "order": 811,
      "adult": false,
      "gender": 2,
      "id": 1864916,
      "known_for_department": "Acting",
      "name": "Rob Ostlere",
      "original_name": "Rob Ostlere",
      "popularity": 2.043,
      "profile_path": "/wwsP4vXDWbClGiGOznSR4dJjim2.jpg"
    },
    {
      "character": "Pentoshi Servant",
      "credit_id": "61774d0965e0a200448c7445",
      "order": 812,
      "adult": false,
      "gender": 1,
      "id": 1864921,
      "known_for_department": "Acting",
      "name": "Rania Zouari",
      "original_name": "Rania Zouari",
      "popularity": 1.38,
      "profile_path": "/vwV5Dp6rX38FjjgIBRNxPtmn8Ma.jpg"
    },
    {
      "character": "Gared",
      "credit_id": "57b72bcc925141389d002188",
      "order": 813,
      "adult": false,
      "gender": 2,
      "id": 191751,
      "known_for_department": "Acting",
      "name": "Dermot Keaney",
      "original_name": "Dermot Keaney",
      "popularity": 2.268,
      "profile_path": "/nvXkSjiw3cgpGRmeKRwQkgdprb5.jpg"
    },
    {
      "character": "White Walker #1",
      "credit_id": "61774d6fb458b8006a123cd5",
      "order": 814,
      "adult": false,
      "gender": 2,
      "id": 946696,
      "known_for_department": "Acting",
      "name": "Ian Whyte",
      "original_name": "Ian Whyte",
      "popularity": 3.36,
      "profile_path": "/svlJyDgPbTHoGjbQKU4S2J6g5hi.jpg"
    },
    {
      "character": "White Walker #2",
      "credit_id": "61774da4e9da69002b9ba63c",
      "order": 815,
      "adult": false,
      "gender": 2,
      "id": 25451,
      "known_for_department": "Acting",
      "name": "Spencer Wilding",
      "original_name": "Spencer Wilding",
      "popularity": 9.248,
      "profile_path": "/4NMcve4Nckpi653znyYOnoS4Mci.jpg"
    },
    {
      "character": "Wight Wildling Girl",
      "credit_id": "61774e0ae9da69002b9ba6f5",
      "order": 816,
      "adult": false,
      "gender": 0,
      "id": 3284663,
      "known_for_department": "Acting",
      "name": "Claire Wright",
      "original_name": "Claire Wright",
      "popularity": 0.6,
      "profile_path": "/rx6NoCpwoYQUy4VzMyYGA0R6k5V.jpg"
    },
    {
      "character": "Jory Cassel",
      "credit_id": "5752136f9251414c510001a0",
      "order": 828,
      "adult": false,
      "gender": 2,
      "id": 1833,
      "known_for_department": "Acting",
      "name": "Jamie Sives",
      "original_name": "Jamie Sives",
      "popularity": 6.226,
      "profile_path": "/bdEyp4f1VUEepihC6vyqCGP6k2s.jpg"
    },
    {
      "character": "Septa Mordane",
      "credit_id": "57520bc19251414c470000de",
      "order": 868,
      "adult": false,
      "gender": 1,
      "id": 438859,
      "known_for_department": "Acting",
      "name": "Susan Brown",
      "original_name": "Susan Brown",
      "popularity": 1.18,
      "profile_path": "/rbi81V4GUsOqjUfLvnoHj4lIAMf.jpg"
    },
    {
      "character": "Illyrio Mopatis",
      "credit_id": "575216bdc3a36851fe0001d8",
      "order": 869,
      "adult": false,
      "gender": 2,
      "id": 11279,
      "known_for_department": "Acting",
      "name": "Roger Allam",
      "original_name": "Roger Allam",
      "popularity": 13.129,
      "profile_path": "/ngugVF69GFcgb5ljt4OQSjd2rGR.jpg"
    },
    {
      "character": "Qotho",
      "credit_id": "5752158b9251414c470001c0",
      "order": 909,
      "adult": false,
      "gender": 2,
      "id": 234907,
      "known_for_department": "Acting",
      "name": "Dar Salim",
      "original_name": "Dar Salim",
      "popularity": 36.897,
      "profile_path": "/oTYCqdF6nfZTsvt1fbypi54ydI.jpg"
    },
    {
      "character": "Maester Luwin",
      "credit_id": "5987d310c3a3681e2a014bfe",
      "order": 932,
      "adult": false,
      "gender": 2,
      "id": 20425,
      "known_for_department": "Acting",
      "name": "Donald Sumpter",
      "original_name": "Donald Sumpter",
      "popularity": 10.539,
      "profile_path": "/jCxD84Vr9TTM5am0Ij3pCsNcted.jpg"
    },
    {
      "character": "Rodrik Cassel",
      "credit_id": "5987d342c3a3681df0012c76",
      "order": 947,
      "adult": false,
      "gender": 2,
      "id": 63141,
      "known_for_department": "Acting",
      "name": "Ron Donachie",
      "original_name": "Ron Donachie",
      "popularity": 3.952,
      "profile_path": "/vnBM7idgiyXoat1E8IBKGekx2GS.jpg"
    },
    {
      "character": "Myrcella Baratheon",
      "credit_id": "57521d4cc3a3685215000344",
      "order": 972,
      "adult": false,
      "gender": 1,
      "id": 1600544,
      "known_for_department": "Acting",
      "name": "Aimee Richardson",
      "original_name": "Aimee Richardson",
      "popularity": 1.038,
      "profile_path": "/97wwITEknXx7MbQda71NegQvJtz.jpg"
    },
    {
      "character": "Ros",
      "credit_id": "5987d3909251415244014acc",
      "order": 999,
      "adult": false,
      "gender": 1,
      "id": 1014921,
      "known_for_department": "Acting",
      "name": "Esmé Bianco",
      "original_name": "Esmé Bianco",
      "popularity": 4.099,
      "profile_path": "/mcbQdFHVEbGypOdDiNMCcqHgNaX.jpg"
    },
    {
      "character": "Tommen Baratheon",
      "credit_id": "57521fafc3a368521500041d",
      "order": 1010,
      "adult": false,
      "gender": 2,
      "id": 1600543,
      "known_for_department": "Acting",
      "name": "Callum Wharry",
      "original_name": "Callum Wharry",
      "popularity": 5.363,
      "profile_path": "/sQzCLoiWniQPYyseG0wvGEf3flo.jpg"
    }
  ],
  "name": "Winter Is Coming",
  "overview": "Jon Arryn, the Hand of the King, is dead. King Robert Baratheon plans to ask his oldest friend, Eddard Stark, to take Jon's place. Across the sea, Viserys Targaryen plans to wed his sister to a nomadic warlord in exchange for an army.",
  "id": 63056,
  "production_code": "101",
  "runtime": 62,
  "season_number": 1,
  "still_path": "/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg",
  "vote_average": 7.8,
  "vote_count": 286
}
```

#### Response Schema

- `air_date` — string —  (ตัวอย่าง: `"2011-04-17"`)
- `crew` — array — 
  - `[]` — array items: — 
  - `department` — string —  (ตัวอย่าง: `"Directing"`)
  - `job` — string —  (ตัวอย่าง: `"Director"`)
  - `credit_id` — string —  (ตัวอย่าง: `"5256c8a219c2956ff6046e77"`)
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `gender` — integer —  (ตัวอย่าง: `2`)
  - `id` — integer —  (ตัวอย่าง: `44797`)
  - `known_for_department` — string —  (ตัวอย่าง: `"Directing"`)
  - `name` — string —  (ตัวอย่าง: `"Timothy Van Patten"`)
  - `original_name` — string —  (ตัวอย่าง: `"Timothy Van Patten"`)
  - `popularity` — number —  (ตัวอย่าง: `7.775`)
  - `profile_path` — string —  (ตัวอย่าง: `"/MzSOFrd99HRdr6pkSRSctk3kBR.jpg"`)
- `episode_number` — integer —  (ตัวอย่าง: `1`)
- `guest_stars` — array — 
  - `[]` — array items: — 
  - `character` — string —  (ตัวอย่าง: `"Benjen Stark"`)
  - `credit_id` — string —  (ตัวอย่าง: `"5256c8b919c2956ff604836a"`)
  - `order` — integer —  (ตัวอย่าง: `62`)
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `gender` — integer —  (ตัวอย่าง: `2`)
  - `id` — integer —  (ตัวอย่าง: `119783`)
  - `known_for_department` — string —  (ตัวอย่าง: `"Acting"`)
  - `name` — string —  (ตัวอย่าง: `"Joseph Mawle"`)
  - `original_name` — string —  (ตัวอย่าง: `"Joseph Mawle"`)
  - `popularity` — number —  (ตัวอย่าง: `6.758`)
  - `profile_path` — string —  (ตัวอย่าง: `"/1Ocb9v3h54beGVoJMm4w50UQhLf.jpg"`)
- `name` — string —  (ตัวอย่าง: `"Winter Is Coming"`)
- `overview` — string —  (ตัวอย่าง: `"Jon Arryn, the Hand of the King, is dead. King Robert Baratheon plans to ask his oldest friend, Eddard Stark, to take Jon's place. Across the sea, Viserys Targaryen plans to wed his sister to a nomadic warlord in exchange for an army."`)
- `id` — integer —  (ตัวอย่าง: `63056`)
- `production_code` — string —  (ตัวอย่าง: `"101"`)
- `runtime` — integer —  (ตัวอย่าง: `62`)
- `season_number` — integer —  (ตัวอย่าง: `1`)
- `still_path` — string —  (ตัวอย่าง: `"/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg"`)
- `vote_average` — number —  (ตัวอย่าง: `7.8`)
- `vote_count` — integer —  (ตัวอย่าง: `286`)

---

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/account_states`

> สรุป: Account States
> Get the rating, watchlist and favourite status.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `series_id` | path | integer | ใช่ | - |
| `session_id` | query | string | ไม่ | - |
| `season_number` | path | integer | ใช่ | - |
| `episode_number` | path | integer | ใช่ | - |
| `guest_session_id` | query | string | ไม่ | - |
#### Response 200

```json
{
  "id": 550,
  "favorite": true,
  "rated": {
    "value": 9
  },
  "watchlist": false
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `550`)
- `favorite` — boolean —  (ตัวอย่าง: `true`)
- `rated` — object — 
  - `value` — integer —  (ตัวอย่าง: `9`)
- `watchlist` — boolean —  (ตัวอย่าง: `false`)

---

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/credits`

> สรุป: Credits

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `series_id` | path | integer | ใช่ | - |
| `season_number` | path | integer | ใช่ | - |
| `language` | query | string | ไม่ | - |
| `episode_number` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "cast": [
    {
      "adult": false,
      "gender": 2,
      "id": 22970,
      "known_for_department": "Acting",
      "name": "Peter Dinklage",
      "original_name": "Peter Dinklage",
      "popularity": 30.6,
      "profile_path": "/lRsRgnksAhBRXwAB68MFjmTtLrk.jpg",
      "character": "Tyrion Lannister",
      "credit_id": "5256c8b219c2956ff6047cd8",
      "order": 0
    },
    {
      "adult": false,
      "gender": 2,
      "id": 48,
      "known_for_department": "Acting",
      "name": "Sean Bean",
      "original_name": "Sean Bean",
      "popularity": 34.931,
      "profile_path": "/kTjiABk3TJ3yI0Cto5RsvyT6V3o.jpg",
      "character": "Ned Stark",
      "credit_id": "58c7134792514179d20011a9",
      "order": 1
    },
    {
      "adult": false,
      "gender": 2,
      "id": 13633,
      "known_for_department": "Acting",
      "name": "Mark Addy",
      "original_name": "Mark Addy",
      "popularity": 12.243,
      "profile_path": "/4ao6jitEAxmQDlJheEOKT8lhJI8.jpg",
      "character": "Robert Baratheon",
      "credit_id": "5256c8ad19c2956ff60478e2",
      "order": 2
    },
    {
      "adult": false,
      "gender": 1,
      "id": 17286,
      "known_for_department": "Acting",
      "name": "Lena Headey",
      "original_name": "Lena Headey",
      "popularity": 24.88,
      "profile_path": "/xR2IBnBlUdyBe5hecaVdtRuQqUE.jpg",
      "character": "Cersei Lannister",
      "credit_id": "5256c8ad19c2956ff60479ce",
      "order": 3
    },
    {
      "adult": false,
      "gender": 1,
      "id": 20057,
      "known_for_department": "Acting",
      "name": "Michelle Fairley",
      "original_name": "Michelle Fairley",
      "popularity": 10.22,
      "profile_path": "/j8lQfEPHCKWV2QCiJJuH97CnoBX.jpg",
      "character": "Catelyn Stark",
      "credit_id": "5256c8ad19c2956ff604796a",
      "order": 4
    },
    {
      "adult": false,
      "gender": 2,
      "id": 12795,
      "known_for_department": "Acting",
      "name": "Nikolaj Coster-Waldau",
      "original_name": "Nikolaj Coster-Waldau",
      "popularity": 18.686,
      "profile_path": "/rpFOERbHkj7GWxkinUNiQ76sSGk.jpg",
      "character": "Jaime Lannister",
      "credit_id": "5256c8ad19c2956ff604793e",
      "order": 5
    },
    {
      "adult": false,
      "gender": 1,
      "id": 1223786,
      "known_for_department": "Acting",
      "name": "Emilia Clarke",
      "original_name": "Emilia Clarke",
      "popularity": 42.737,
      "profile_path": "/u59kTmNHXzaGZqokivxLPiBVIML.jpg",
      "character": "Daenerys Targaryen",
      "credit_id": "5256c8af19c2956ff60479f6",
      "order": 6
    },
    {
      "adult": false,
      "gender": 2,
      "id": 49735,
      "known_for_department": "Acting",
      "name": "Aidan Gillen",
      "original_name": "Aidan Gillen",
      "popularity": 22.652,
      "profile_path": "/ju5ho6nnwOQ2QLGLnDP9yOZhGpb.jpg",
      "character": "Petyr Baelish",
      "credit_id": "5256c8af19c2956ff6047aa4",
      "order": 7
    },
    {
      "adult": false,
      "gender": 2,
      "id": 20508,
      "known_for_department": "Acting",
      "name": "Iain Glen",
      "original_name": "Iain Glen",
      "popularity": 14.438,
      "profile_path": "/n9zXQhjtXQnc30kqF66hdX4i3PG.jpg",
      "character": "Jorah Mormont",
      "credit_id": "5256c8af19c2956ff6047a5c",
      "order": 8
    },
    {
      "adult": false,
      "gender": 2,
      "id": 239019,
      "known_for_department": "Acting",
      "name": "Kit Harington",
      "original_name": "Kit Harington",
      "popularity": 19.319,
      "profile_path": "/htGBMno71BJAEGF3Y9f62MdA3Yt.jpg",
      "character": "Jon Snow",
      "credit_id": "5256c8af19c2956ff6047af6",
      "order": 9
    },
    {
      "adult": false,
      "gender": 2,
      "id": 205258,
      "known_for_department": "Acting",
      "name": "Harry Lloyd",
      "original_name": "Harry Lloyd",
      "popularity": 11.015,
      "profile_path": "/qZSf6OzRpDaZdOCX6pynSRp6jVV.jpg",
      "character": "Viserys Targaryen",
      "credit_id": "5256c8af19c2956ff6047ac2",
      "order": 10
    },
    {
      "adult": false,
      "gender": 2,
      "id": 239020,
      "known_for_department": "Acting",
      "name": "Isaac Hempstead-Wright",
      "original_name": "Isaac Hempstead-Wright",
      "popularity": 7.062,
      "profile_path": "/g6ZreLmGrrOzaUCGVFRNPAWfcso.jpg",
      "character": "Bran Stark",
      "credit_id": "5256c8b119c2956ff6047c22",
      "order": 13
    },
    {
      "adult": false,
      "gender": 2,
      "id": 512991,
      "known_for_department": "Acting",
      "name": "Richard Madden",
      "original_name": "Richard Madden",
      "popularity": 59.193,
      "profile_path": "/kC7X9LgAtJfpxUBRtVwaVTEXomH.jpg",
      "character": "Robb Stark",
      "credit_id": "5256c8af19c2956ff6047b1a",
      "order": 14
    },
    {
      "adult": false,
      "gender": 1,
      "id": 1001657,
      "known_for_department": "Acting",
      "name": "Sophie Turner",
      "original_name": "Sophie Turner",
      "popularity": 22.401,
      "profile_path": "/zopxZsUZmxZ4sGEfm4cRr7FVoM4.jpg",
      "character": "Sansa Stark",
      "credit_id": "5256c8b419c2956ff6047f34",
      "order": 16
    },
    {
      "adult": false,
      "gender": 2,
      "id": 71586,
      "known_for_department": "Acting",
      "name": "Alfie Allen",
      "original_name": "Alfie Allen",
      "popularity": 21.444,
      "profile_path": "/1N6NPuSHUYdiwRbSTVbaEOrFIk.jpg",
      "character": "Theon Greyjoy",
      "credit_id": "5256c8b019c2956ff6047b5a",
      "order": 17
    },
    {
      "adult": false,
      "gender": 1,
      "id": 1181313,
      "known_for_department": "Acting",
      "name": "Maisie Williams",
      "original_name": "Maisie Williams",
      "popularity": 26.639,
      "profile_path": "/inmEtffV5LFDAN3HojOP3QAg1wt.jpg",
      "character": "Arya Stark",
      "credit_id": "5256c8b419c2956ff6047f0c",
      "order": 18
    },
    {
      "adult": false,
      "gender": 2,
      "id": 3075,
      "known_for_department": "Acting",
      "name": "Rory McCann",
      "original_name": "Rory McCann",
      "popularity": 7.227,
      "profile_path": "/9GKM3FshPtVOE6zqkT1XLTs2iot.jpg",
      "character": "Sandor 'The Hound' Clegane",
      "credit_id": "5256c8b119c2956ff6047c84",
      "order": 24
    },
    {
      "adult": false,
      "gender": 2,
      "id": 489467,
      "known_for_department": "Acting",
      "name": "Jack Gleeson",
      "original_name": "Jack Gleeson",
      "popularity": 9.187,
      "profile_path": "/uhSnpvrZ5TMnUmfRmZGn2VeVB89.jpg",
      "character": "Joffrey Baratheon",
      "credit_id": "5256c8b119c2956ff6047c4e",
      "order": 26
    }
  ],
  "crew": [
    {
      "department": "Directing",
      "job": "Director",
      "credit_id": "5256c8a219c2956ff6046e77",
      "adult": false,
      "gender": 2,
      "id": 44797,
      "known_for_department": "Directing",
      "name": "Timothy Van Patten",
      "original_name": "Timothy Van Patten",
      "popularity": 8.292,
      "profile_path": "/MzSOFrd99HRdr6pkSRSctk3kBR.jpg"
    },
    {
      "job": "Director of Photography",
      "department": "Camera",
      "credit_id": "54eef2429251417974005cb6",
      "adult": false,
      "gender": 2,
      "id": 1318704,
      "known_for_department": "Directing",
      "name": "Alik Sakharov",
      "original_name": "Alik Sakharov",
      "popularity": 1.579,
      "profile_path": null
    },
    {
      "job": "Editor",
      "department": "Editing",
      "credit_id": "54eef2ab925141795f005d4f",
      "adult": false,
      "gender": 2,
      "id": 18077,
      "known_for_department": "Editing",
      "name": "Oral Norrie Ottey",
      "original_name": "Oral Norrie Ottey",
      "popularity": 0.6,
      "profile_path": null
    },
    {
      "job": "Writer",
      "department": "Writing",
      "credit_id": "5256c8a219c2956ff6046e4b",
      "adult": false,
      "gender": 2,
      "id": 228068,
      "known_for_department": "Writing",
      "name": "D.B. Weiss",
      "original_name": "D.B. Weiss",
      "popularity": 2.86,
      "profile_path": "/2RMejaT793U9KRk2IEbFfteQntE.jpg"
    },
    {
      "job": "Writer",
      "department": "Writing",
      "credit_id": "5256c8a019c2956ff6046e2b",
      "adult": false,
      "gender": 2,
      "id": 9813,
      "known_for_department": "Writing",
      "name": "David Benioff",
      "original_name": "David Benioff",
      "popularity": 7.198,
      "profile_path": "/xvNN5huL0X8yJ7h3IZfGG4O2zBD.jpg"
    }
  ],
  "guest_stars": [
    {
      "character": "Benjen Stark",
      "credit_id": "5256c8b919c2956ff604836a",
      "order": 62,
      "adult": false,
      "gender": 2,
      "id": 119783,
      "known_for_department": "Acting",
      "name": "Joseph Mawle",
      "original_name": "Joseph Mawle",
      "popularity": 8.559,
      "profile_path": "/1Ocb9v3h54beGVoJMm4w50UQhLf.jpg"
    },
    {
      "character": "Khal Drogo",
      "credit_id": "5256c8a219c2956ff6046f40",
      "order": 63,
      "adult": false,
      "gender": 2,
      "id": 117642,
      "known_for_department": "Acting",
      "name": "Jason Momoa",
      "original_name": "Jason Momoa",
      "popularity": 39.109,
      "profile_path": "/tsfL6u1WW6zHYS1lhWGPHuk6JON.jpg"
    },
    {
      "character": "Rickon Stark",
      "credit_id": "566a83bcc3a3683f56003604",
      "order": 83,
      "adult": false,
      "gender": 2,
      "id": 1050248,
      "known_for_department": "Acting",
      "name": "Art Parkinson",
      "original_name": "Art Parkinson",
      "popularity": 8.785,
      "profile_path": "/ejAKOJME1DsvHECLWdQ7dEtXyyc.jpg"
    },
    {
      "character": "Hodor",
      "credit_id": "5256c8be19c2956ff6048446",
      "order": 84,
      "adult": false,
      "gender": 2,
      "id": 1223792,
      "known_for_department": "Acting",
      "name": "Kristian Nairn",
      "original_name": "Kristian Nairn",
      "popularity": 4.706,
      "profile_path": "/dlbq6cCW0xdpFY15q6flP6lDXWV.jpg"
    },
    {
      "character": "Will",
      "credit_id": "6176291c924ce50044219a23",
      "order": 809,
      "adult": false,
      "gender": 2,
      "id": 75076,
      "known_for_department": "Acting",
      "name": "Bronson Webb",
      "original_name": "Bronson Webb",
      "popularity": 1.96,
      "profile_path": "/foMvmr6ch16GGM1L413KA9UQKIO.jpg"
    },
    {
      "character": "Jon Arryn",
      "credit_id": "6176293a172d7f009254e782",
      "order": 810,
      "adult": false,
      "gender": 2,
      "id": 11282,
      "known_for_department": "Acting",
      "name": "John Standing",
      "original_name": "John Standing",
      "popularity": 3.064,
      "profile_path": "/4jxM3KYsykVd2IPUaGAv3KYgDUT.jpg"
    },
    {
      "character": "Waymar Royce",
      "credit_id": "61774bcd71f0950042d37204",
      "order": 811,
      "adult": false,
      "gender": 2,
      "id": 1864916,
      "known_for_department": "Acting",
      "name": "Rob Ostlere",
      "original_name": "Rob Ostlere",
      "popularity": 2.643,
      "profile_path": "/wwsP4vXDWbClGiGOznSR4dJjim2.jpg"
    },
    {
      "character": "Pentoshi Servant",
      "credit_id": "61774d0965e0a200448c7445",
      "order": 812,
      "adult": false,
      "gender": 1,
      "id": 1864921,
      "known_for_department": "Acting",
      "name": "Rania Zouari",
      "original_name": "Rania Zouari",
      "popularity": 2.391,
      "profile_path": "/vwV5Dp6rX38FjjgIBRNxPtmn8Ma.jpg"
    },
    {
      "character": "Gared",
      "credit_id": "57b72bcc925141389d002188",
      "order": 813,
      "adult": false,
      "gender": 2,
      "id": 191751,
      "known_for_department": "Acting",
      "name": "Dermot Keaney",
      "original_name": "Dermot Keaney",
      "popularity": 2.158,
      "profile_path": "/nvXkSjiw3cgpGRmeKRwQkgdprb5.jpg"
    },
    {
      "character": "White Walker #1",
      "credit_id": "61774d6fb458b8006a123cd5",
      "order": 814,
      "adult": false,
      "gender": 2,
      "id": 946696,
      "known_for_department": "Acting",
      "name": "Ian Whyte",
      "original_name": "Ian Whyte",
      "popularity": 3.375,
      "profile_path": "/svlJyDgPbTHoGjbQKU4S2J6g5hi.jpg"
    },
    {
      "character": "White Walker #2",
      "credit_id": "61774da4e9da69002b9ba63c",
      "order": 815,
      "adult": false,
      "gender": 2,
      "id": 25451,
      "known_for_department": "Acting",
      "name": "Spencer Wilding",
      "original_name": "Spencer Wilding",
      "popularity": 4.574,
      "profile_path": "/7sSwsMl9RHVIwewwkdHtTV3kCGn.jpg"
    },
    {
      "character": "Wight Wildling Girl",
      "credit_id": "61774e0ae9da69002b9ba6f5",
      "order": 816,
      "adult": false,
      "gender": 0,
      "id": 3284663,
      "known_for_department": "Acting",
      "name": "Claire Wright",
      "original_name": "Claire Wright",
      "popularity": 0.84,
      "profile_path": "/rx6NoCpwoYQUy4VzMyYGA0R6k5V.jpg"
    },
    {
      "character": "Jory Cassel",
      "credit_id": "5752136f9251414c510001a0",
      "order": 828,
      "adult": false,
      "gender": 2,
      "id": 1833,
      "known_for_department": "Acting",
      "name": "Jamie Sives",
      "original_name": "Jamie Sives",
      "popularity": 7.463,
      "profile_path": "/bdEyp4f1VUEepihC6vyqCGP6k2s.jpg"
    },
    {
      "character": "Septa Mordane",
      "credit_id": "57520bc19251414c470000de",
      "order": 868,
      "adult": false,
      "gender": 1,
      "id": 438859,
      "known_for_department": "Acting",
      "name": "Susan Brown",
      "original_name": "Susan Brown",
      "popularity": 1.626,
      "profile_path": "/rbi81V4GUsOqjUfLvnoHj4lIAMf.jpg"
    },
    {
      "character": "Illyrio Mopatis",
      "credit_id": "575216bdc3a36851fe0001d8",
      "order": 869,
      "adult": false,
      "gender": 2,
      "id": 11279,
      "known_for_department": "Acting",
      "name": "Roger Allam",
      "original_name": "Roger Allam",
      "popularity": 15.723,
      "profile_path": "/ngugVF69GFcgb5ljt4OQSjd2rGR.jpg"
    },
    {
      "character": "Qotho",
      "credit_id": "5752158b9251414c470001c0",
      "order": 909,
      "adult": false,
      "gender": 2,
      "id": 234907,
      "known_for_department": "Acting",
      "name": "Dar Salim",
      "original_name": "Dar Salim",
      "popularity": 18.379,
      "profile_path": "/oTYCqdF6nfZTsvt1fbypi54ydI.jpg"
    },
    {
      "character": "Maester Luwin",
      "credit_id": "5987d310c3a3681e2a014bfe",
      "order": 932,
      "adult": false,
      "gender": 2,
      "id": 20425,
      "known_for_department": "Acting",
      "name": "Donald Sumpter",
      "original_name": "Donald Sumpter",
      "popularity": 9.264,
      "profile_path": "/jCxD84Vr9TTM5am0Ij3pCsNcted.jpg"
    },
    {
      "character": "Rodrik Cassel",
      "credit_id": "5987d342c3a3681df0012c76",
      "order": 947,
      "adult": false,
      "gender": 2,
      "id": 63141,
      "known_for_department": "Acting",
      "name": "Ron Donachie",
      "original_name": "Ron Donachie",
      "popularity": 2.329,
      "profile_path": "/vnBM7idgiyXoat1E8IBKGekx2GS.jpg"
    },
    {
      "character": "Myrcella Baratheon",
      "credit_id": "57521d4cc3a3685215000344",
      "order": 972,
      "adult": false,
      "gender": 1,
      "id": 1600544,
      "known_for_department": "Acting",
      "name": "Aimee Richardson",
      "original_name": "Aimee Richardson",
      "popularity": 0.716,
      "profile_path": "/97wwITEknXx7MbQda71NegQvJtz.jpg"
    },
    {
      "character": "Ros",
      "credit_id": "5987d3909251415244014acc",
      "order": 999,
      "adult": false,
      "gender": 1,
      "id": 1014921,
      "known_for_department": "Acting",
      "name": "Esmé Bianco",
      "original_name": "Esmé Bianco",
      "popularity": 4.256,
      "profile_path": "/mcbQdFHVEbGypOdDiNMCcqHgNaX.jpg"
    },
    {
      "character": "Tommen Baratheon",
      "credit_id": "57521fafc3a368521500041d",
      "order": 1010,
      "adult": false,
      "gender": 2,
      "id": 1600543,
      "known_for_department": "Acting",
      "name": "Callum Wharry",
      "original_name": "Callum Wharry",
      "popularity": 8.169,
      "profile_path": "/sQzCLoiWniQPYyseG0wvGEf3flo.jpg"
    }
  ],
  "id": 63056
}
```

#### Response Schema

- `cast` — array — 
  - `[]` — array items: — 
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `gender` — integer —  (ตัวอย่าง: `2`)
  - `id` — integer —  (ตัวอย่าง: `22970`)
  - `known_for_department` — string —  (ตัวอย่าง: `"Acting"`)
  - `name` — string —  (ตัวอย่าง: `"Peter Dinklage"`)
  - `original_name` — string —  (ตัวอย่าง: `"Peter Dinklage"`)
  - `popularity` — number —  (ตัวอย่าง: `30.6`)
  - `profile_path` — string —  (ตัวอย่าง: `"/lRsRgnksAhBRXwAB68MFjmTtLrk.jpg"`)
  - `character` — string —  (ตัวอย่าง: `"Tyrion Lannister"`)
  - `credit_id` — string —  (ตัวอย่าง: `"5256c8b219c2956ff6047cd8"`)
  - `order` — integer —  (ตัวอย่าง: `0`)
- `crew` — array — 
  - `[]` — array items: — 
  - `department` — string —  (ตัวอย่าง: `"Directing"`)
  - `job` — string —  (ตัวอย่าง: `"Director"`)
  - `credit_id` — string —  (ตัวอย่าง: `"5256c8a219c2956ff6046e77"`)
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `gender` — integer —  (ตัวอย่าง: `2`)
  - `id` — integer —  (ตัวอย่าง: `44797`)
  - `known_for_department` — string —  (ตัวอย่าง: `"Directing"`)
  - `name` — string —  (ตัวอย่าง: `"Timothy Van Patten"`)
  - `original_name` — string —  (ตัวอย่าง: `"Timothy Van Patten"`)
  - `popularity` — number —  (ตัวอย่าง: `8.292`)
  - `profile_path` — string —  (ตัวอย่าง: `"/MzSOFrd99HRdr6pkSRSctk3kBR.jpg"`)
- `guest_stars` — array — 
  - `[]` — array items: — 
  - `character` — string —  (ตัวอย่าง: `"Benjen Stark"`)
  - `credit_id` — string —  (ตัวอย่าง: `"5256c8b919c2956ff604836a"`)
  - `order` — integer —  (ตัวอย่าง: `62`)
  - `adult` — boolean —  (ตัวอย่าง: `false`)
  - `gender` — integer —  (ตัวอย่าง: `2`)
  - `id` — integer —  (ตัวอย่าง: `119783`)
  - `known_for_department` — string —  (ตัวอย่าง: `"Acting"`)
  - `name` — string —  (ตัวอย่าง: `"Joseph Mawle"`)
  - `original_name` — string —  (ตัวอย่าง: `"Joseph Mawle"`)
  - `popularity` — number —  (ตัวอย่าง: `8.559`)
  - `profile_path` — string —  (ตัวอย่าง: `"/1Ocb9v3h54beGVoJMm4w50UQhLf.jpg"`)
- `id` — integer —  (ตัวอย่าง: `63056`)

---

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/external_ids`

> สรุป: External IDs
> Get a list of external IDs that have been added to a TV episode.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `series_id` | path | integer | ใช่ | - |
| `season_number` | path | integer | ใช่ | - |
| `episode_number` | path | string | ใช่ | - |
#### Response 200

```json
{
  "id": 63056,
  "imdb_id": "tt1480055",
  "freebase_mid": "/m/0gmc6ph",
  "freebase_id": "/en/winter_is_coming",
  "tvdb_id": 3254641,
  "tvrage_id": 1065008299,
  "wikidata_id": "Q2614622"
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `63056`)
- `imdb_id` — string —  (ตัวอย่าง: `"tt1480055"`)
- `freebase_mid` — string —  (ตัวอย่าง: `"/m/0gmc6ph"`)
- `freebase_id` — string —  (ตัวอย่าง: `"/en/winter_is_coming"`)
- `tvdb_id` — integer —  (ตัวอย่าง: `3254641`)
- `tvrage_id` — integer —  (ตัวอย่าง: `1065008299`)
- `wikidata_id` — string —  (ตัวอย่าง: `"Q2614622"`)

---

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/images`

> สรุป: Images
> Get the images that belong to a TV episode.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `series_id` | path | integer | ใช่ | - |
| `include_image_language` | query | string | ไม่ | specify a comma separated list of ISO-639-1 values to query, for example: `en-US,null` |
| `language` | query | string | ไม่ | - |
| `season_number` | path | integer | ใช่ | - |
| `episode_number` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "id": 63056,
  "stills": [
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg",
      "vote_average": 5.454,
      "vote_count": 3,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/xIfvIM7YgkADTrqp23rm3CLaOVQ.jpg",
      "vote_average": 5.322,
      "vote_count": 5,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/wrGWeW4WKxnaeA8sxJb2T9O6ryo.jpg",
      "vote_average": 5.32,
      "vote_count": 7,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/qYqCWKoiyR845nUOotJ7rKIXGPM.jpg",
      "vote_average": 5.312,
      "vote_count": 1,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/pyp0LgtqjgaeXzPMtXKnkuNBugV.jpg",
      "vote_average": 5.246,
      "vote_count": 2,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/w85NsRYgZQZrICE1kC9q8F2D6wS.jpg",
      "vote_average": 5.246,
      "vote_count": 2,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/g0OnOaBqSepbA8omNTfYBCl4Sbo.jpg",
      "vote_average": 5.246,
      "vote_count": 2,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/v3bGMbT5Ik86ERFBfsXFqpiMTFy.jpg",
      "vote_average": 5.246,
      "vote_count": 2,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/uaSOtAsNrXbKxOVzC31GjYxLRXJ.jpg",
      "vote_average": 5.246,
      "vote_count": 2,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/gDOWFhBTkuwhLKrFqpd7yhAwxVH.jpg",
      "vote_average": 5.246,
      "vote_count": 2,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/9o3HXUmWaZq14tIAbBrn7e34NRZ.jpg",
      "vote_average": 0,
      "vote_count": 0,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 1080,
      "iso_639_1": null,
      "file_path": "/wZPID3NddTuH7lBNgsFEiXWB6Bj.jpg",
      "vote_average": 0,
      "vote_count": 0,
      "width": 1920
    },
    {
      "aspect_ratio": 1.778,
      "height": 2160,
      "iso_639_1": null,
      "file_path": "/lYQyyPoFpFBWQ9cta2zcfZE1axn.jpg",
      "vote_average": 0,
      "vote_count": 0,
      "width": 3840
    },
    {
      "aspect_ratio": 1.778,
      "height": 2160,
      "iso_639_1": null,
      "file_path": "/nDkA929hW9ePdyvNure6Q0fNBWo.jpg",
      "vote_average": 0,
      "vote_count": 0,
      "width": 3840
    },
    {
      "aspect_ratio": 1.778,
      "height": 2160,
      "iso_639_1": null,
      "file_path": "/ecDSsfUAgH9VqtdtaDdO2fi5KMF.jpg",
      "vote_average": 0,
      "vote_count": 0,
      "width": 3840
    }
  ]
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `63056`)
- `stills` — array — 
  - `[]` — array items: — 
  - `aspect_ratio` — number —  (ตัวอย่าง: `1.778`)
  - `height` — integer —  (ตัวอย่าง: `1080`)
  - `iso_639_1` — object — 
  - `file_path` — string —  (ตัวอย่าง: `"/9hGF3WUkBf7cSjMg0cdMDHJkByd.jpg"`)
  - `vote_average` — number —  (ตัวอย่าง: `5.454`)
  - `vote_count` — integer —  (ตัวอย่าง: `3`)
  - `width` — integer —  (ตัวอย่าง: `1920`)

---

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/translations`

> สรุป: Translations
> Get the translations that have been added to a TV episode.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `series_id` | path | integer | ใช่ | - |
| `season_number` | path | integer | ใช่ | - |
| `episode_number` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "id": 63056,
  "translations": [
    {
      "iso_3166_1": "SA",
      "iso_639_1": "ar",
      "name": "العربية",
      "english_name": "Arabic",
      "data": {
        "name": "",
        "overview": "خلف باب واسع من الجليد في شمالي وستيروس هناك شيء يحدث. تتلقى عائلة ستارك التي من وينترفيل زيارة من العائلة المالكة، بينما يشكل أمير عائلة تارغارين المنفي تحالفاً جديداً للسيطرة على العرش من جديد."
      }
    },
    {
      "iso_3166_1": "BY",
      "iso_639_1": "be",
      "name": "беларуская мова",
      "english_name": "Belarusian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "BG",
      "iso_639_1": "bg",
      "name": "български език",
      "english_name": "Bulgarian",
      "data": {
        "name": "Зимата идва",
        "overview": "На север от Стената дебнат предатели и лорд Едард Старк разбира за това, след като залавя шпионин. Крал Робърт пътува на север, за да предложи на Нед Арин позицията на съветника на краля. В същото време, отвъд Тясното море Висерис Таргариен готви план да си върне трона. Той иска да омъжи сестра си Данерис за номадския командир Кал Дрого. Крал Робърт пристига във Винтерфел, където заварва съпругата си Серсей и семейство Ланистер."
      }
    },
    {
      "iso_3166_1": "BS",
      "iso_639_1": "bs",
      "name": "Bosanski",
      "english_name": "Bosnian",
      "data": {
        "name": "Winter Is Coming",
        "overview": "Dezerter iz Noćne straže pronađen je izvan Zimogora, na što lord Eddard \"Ned\" Stark reagira promptno i pravedno. Ujedno, događaj podiže zabrinutost zbog opasnosti u zemljama sjeverno od Zida u kojima vlada bezakonje. Po povratku kući Ned od supruge Catelyn saznaje da je njegov mentor, Jon Arryn, preminuo u glavnom gradu Zapadnih zemalja, Kraljevom Pristanu, te da se kralj Robert zaputio na sjever kako bi Nedu ponudio Arrynov položaj kraljeve desnice.\n\nZa to vrijeme, s druge strane Tijesnog mora, u Pentosu, Viserys Targaryen kuje plan kako da ponovno zasjedne na tron - sklapanjem saveza s nomadskim ratnicima Dothrakima, čijem će vođi khalu Drogou dati za ženu svoju ljupku sestru Daenerys.\n\nRobert stiže u Zimogor sa svojom suprugom, kraljicom Cersei, i ostalim članovima obitelji Lannister: njezinim bratom blizancem Jamiejem, bratom patuljkom Tyrionom i Cerseinim sinom, 12-godišnjim prijestolonasljednikom Joffreyem. Ne mogavši odbiti starog prijatelja i kralja, Ned se sprema napustiti Kraljev Pristan dok Jon Snijeg odlučuje otputovati na sjever u Crni dvorac kako bi se priključio Noćnoj straži, u pratnji znatiželjnog Tyriona. No iznenadni izdajnički čin usmjeren prema mladom Branu možda će odgoditi njihov odlazak."
      }
    },
    {
      "iso_3166_1": "CN",
      "iso_639_1": "cn",
      "name": "广州话 / 廣州話",
      "english_name": "Cantonese",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "CZ",
      "iso_639_1": "cs",
      "name": "Český",
      "english_name": "Czech",
      "data": {
        "name": "Zima se blíží",
        "overview": "Lord Eddard 'Ned' Stark z Winterfellu je navštíven královskou rodinou. Jeho starý přítel a král Robert Baratheon mu učiní nabídku, kterou nemůže odmítnout. Catelyn Stark, Nedova žena, dostane vzkaz od své sestry Lysy, díky kterému by mohla obvinit členy královské rodiny z vraždy. Nedův mladý syn Bran učiní ohromující objev, díky kterému bude bojovat o holý život. Přes Úzké moře deportovaný princ Viserys Targaryen tvoří alianci s vidinou zisku Železného trůnu. Divokému válečníkovi khalu Drogovi dá za manželku svou sestru Daenerys výměnou za jeho vojenskou podporu."
      }
    },
    {
      "iso_3166_1": "DK",
      "iso_639_1": "da",
      "name": "Dansk",
      "english_name": "Danish",
      "data": {
        "name": "Vinteren er på vej",
        "overview": "En desertør opspores uden for Winterfell, hvilket fører til hurtig rettergang ved dommer Lord Eddard \"Ned\" Stark og giver anledning til bekymringer om farerne i nord. Neds mentor Jon Arryn er død i hovedstaden, og Kong Robert er på vej for at tilbyde ham Arryns job som kongens hjælper. Imens i Pentos udtænker Viserys Targaryen en plan for en alliance med Dothraki nomadekrigerne. Robert ankommer med Dronning Cersei og deres følge, og Ned forbereder sig på at tage af sted, da Jon Snow beslutter at slutte sig til Night's Watch. Men et overraskende forræderi kan sætte en stoppe for begges afgang."
      }
    },
    {
      "iso_3166_1": "DE",
      "iso_639_1": "de",
      "name": "Deutsch",
      "english_name": "German",
      "data": {
        "name": "Der Winter naht",
        "overview": "Jon Arryn, die Hand des Königs, ist tot. König Robert Baratheon plant, seinen ältesten Freund, Eddard Stark, zu bitten, Jons Platz einzunehmen. Auf der anderen Seite des Meeres plant Viserys Targaryen, seine Schwester mit einem nomadischen Kriegsherrn im Austausch für eine Armee zu verheiraten."
      }
    },
    {
      "iso_3166_1": "GR",
      "iso_639_1": "el",
      "name": "ελληνικά",
      "english_name": "Greek",
      "data": {
        "name": "Έρχεται Χειμώνας",
        "overview": "H ιστορία αρχίζει 298 χρόνια μετά την κατάκτηση της ηπείρου του Γουέστερος από τον Αίγκον τον κατακτητή. Όταν ο βαρύς χειμώνας έρχεται, μια σειρά από γεγονότα ανατρέπουν την πολιτική κατάσταση και πυροδοτούν τον πόλεμο των επτά Βασιλέων."
      }
    },
    {
      "iso_3166_1": "US",
      "iso_639_1": "en",
      "name": "English",
      "english_name": "English",
      "data": {
        "name": "Winter Is Coming",
        "overview": "Jon Arryn, the Hand of the King, is dead. King Robert Baratheon plans to ask his oldest friend, Eddard Stark, to take Jon's place. Across the sea, Viserys Targaryen plans to wed his sister to a nomadic warlord in exchange for an army."
      }
    },
    {
      "iso_3166_1": "EO",
      "iso_639_1": "eo",
      "name": "Esperanto",
      "english_name": "Esperanto",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "ES",
      "iso_639_1": "es",
      "name": "Español",
      "english_name": "Spanish",
      "data": {
        "name": "Se acerca el invierno",
        "overview": "El Lord Ned Stark está preocupado por los perturbantes reportes de un desertor del Nights Watch; El Rey Robert y los Lannisters llegan a Winterfell; el exiliado Viserys Targaryen forja una nueva y poderosa alianza."
      }
    },
    {
      "iso_3166_1": "MX",
      "iso_639_1": "es",
      "name": "Español",
      "english_name": "Spanish",
      "data": {
        "name": "Se acerca el invierno",
        "overview": "Un desertor de Guardia de la Noche es encontrado fuera de Invernalia, lo que provoca una justicia rápida por parte de Lord Eddard \"Ned\" Stark. Al regresar a casa, Ned se entera por su esposa Catelyn que su mentor, Jon Arryn, ha muerto, y que el rey Robert se encuentra camino hacia el norte para ofrecerle ser Mano del Rey. Mientras tanto, al otro lado del Mar Angosto, Viserys Targaryen idea un plan para recuperar el trono, lo que implica forjar una alianza con los nómadas guerreros dothrakis dando a su líder, Khal Drogo, la mano de su encantadora hermana Daenerys en matrimonio. Robert llega a Invernalia con su esposa, la reina Cersei, y otros miembros de la familia Lannister: su hermano gemelo, Jaime, su otro hermano apodado el enano o el gnomo, Tyrion y su hijo y heredero al trono, de 12 años de edad, Joffrey."
      }
    },
    {
      "iso_3166_1": "EE",
      "iso_639_1": "et",
      "name": "Eesti",
      "english_name": "Estonian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "IR",
      "iso_639_1": "fa",
      "name": "فارسی",
      "english_name": "Persian",
      "data": {
        "name": "زمستان در راه است",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "FI",
      "iso_639_1": "fi",
      "name": "suomi",
      "english_name": "Finnish",
      "data": {
        "name": "Talvi on tulossa",
        "overview": "Kuningas Robert Baratheon saapuu Talvivaaraan tarjoamaan lordi Ned Starkille virkaa valtakunnan kakkosmiehenä."
      }
    },
    {
      "iso_3166_1": "CA",
      "iso_639_1": "fr",
      "name": "Français",
      "english_name": "French",
      "data": {
        "name": "L'hiver vient",
        "overview": "Au delà d'un gigantesque mur de protection de glace dans le nord de Westeros. Robert Baratheon, le roi, arrive avec son cortège au sud du mur de Winterfell pour demander de l'aide à son vieil ami Eddard Stark. Dans le même temps, sur un autre continent, les derniers survivants de l'ancien régime Targaryen sont à la recherche d'une nouvelle alliance pour reprendre leur royaume de \"l'usurpateur\" roi Robert..."
      }
    },
    {
      "iso_3166_1": "FR",
      "iso_639_1": "fr",
      "name": "Français",
      "english_name": "French",
      "data": {
        "name": "L'hiver vient",
        "overview": "Sur le continent de Westeros, un jeune patrouilleur de la Garde de Nuit, chargée de veiller sur le Mur, est condamné à mort pour désertion par Eddard Stark, seigneur de Winterfell et Gardien du Nord. Mais de sombres nouvelles arrivent de Port-Réal, la capitale des Sept Couronnes : Jon Arryn, ami intime d'Eddard et Main du roi Robert Baratheon, vient de mourir. Le roi Robert et sa cour entreprennent alors un voyage vers Winterfell, pour gratifier son ami Eddard de la charge de Main du roi. Pendant ce temps, les descendants des rois Targaryen en exil, renversés par Robert, fomentent leur retour en Westeros par un jeu d'alliance avec les Dothrakis, une tribu de guerriers nomades. Alors qu'à Winterfell les festivités vont bon train durant le séjour du roi, Brandon, l'un des fils d'Eddard Stark, fait une découverte qui lui attire les foudres de la famille royale…"
      }
    },
    {
      "iso_3166_1": "IL",
      "iso_639_1": "he",
      "name": "עִבְרִית",
      "english_name": "Hebrew",
      "data": {
        "name": "החורף מתקרב",
        "overview": "עיבוד טלוויזיוני לסדרת רבי-המכר. הסדרה מגוללת את סיפור המאבק עקוב הדם על כס המלוכה של המלך רוברט באראתיאון, ששולט על ממלכת ווסטרוז בעזרת יד ימינו, הלורד אדארד סטארק."
      }
    },
    {
      "iso_3166_1": "HR",
      "iso_639_1": "hr",
      "name": "Hrvatski",
      "english_name": "Croatian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "HU",
      "iso_639_1": "hu",
      "name": "Magyar",
      "english_name": "Hungarian",
      "data": {
        "name": "Közeleg a tél",
        "overview": "Westeros királyság északi határát hatalmas jeges fal választja el az örök tél birodalmától. Lord Eddard \"Ned\" Stark az északi birodalom, Deres ura és az északi nemesek vezére, az ő ősei építették a Falat, amelyet az Éjszakai Őrség véd. Amikor Robert király tanácsadója és Ned mentora, Jon Arryn meghal, Robert Baratheon a barátját, Nedet kéri fel, hogy lépjen a helyébe. Eközben a régi uralkodóház, a Targaryenek utolsó leszármazottja, Viserys azt tervezi, hogy visszaszerzi a trónt. Szövetséget köt a nomád dothraki harcosokkal, és vezérüknek, Khal Drogónak adja a húga, Daenerys kezét. Baratheon király és a felesége, a Lannister-házbeli Cersei királyné Deresbe utazik. Velük tart a Lannister família több tagja: a királyné ikertestvére, Jaime, a másik testvére, a törpe Tyrion, illetve a királyné tizenkét éves fia, a trón örököse, Joffrey. Ned nem utasíthatja vissza öreg királya és barátja kérését, így a birodalom fővárosába készül. Mindeközben Havas Jon elhatározza, hogy északra utazik a Fekete Kastélyba, hogy csatlakozzon az Éjszakai Őrséghez, ahová a kíváncsi Tyrion is elkíséri. De az ifjú Bran sötét titokra bukkan, ami nem várt következményekkel jár."
      }
    },
    {
      "iso_3166_1": "ID",
      "iso_639_1": "id",
      "name": "Bahasa indonesia",
      "english_name": "Indonesian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "IS",
      "iso_639_1": "is",
      "name": "Íslenska",
      "english_name": "Icelandic",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "IT",
      "iso_639_1": "it",
      "name": "Italiano",
      "english_name": "Italian",
      "data": {
        "name": "L'inverno sta arrivando",
        "overview": "Robert Baratheon, Re di Westeros, chiede aiuto al suo vecchio amico Eddard Stark per governare il suo regno. Allo stesso tempo, i due giovani Targaryen, figli del precedente sovrano, stanno cercando degli alleati per detronizzare re Robert."
      }
    },
    {
      "iso_3166_1": "JP",
      "iso_639_1": "ja",
      "name": "日本語",
      "english_name": "Japanese",
      "data": {
        "name": "冬の訪れ",
        "overview": "ナイツウォッチからの脱走者の報告に、戸惑うネッド スターク卿。ロバート王とラニスター家の者たちが、ウィンターフェルに到着。亡命していたヴィセーリス・ターガリエンは、新たに強力な忠誠を誓う。"
      }
    },
    {
      "iso_3166_1": "GE",
      "iso_639_1": "ka",
      "name": "ქართული",
      "english_name": "Georgian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "KR",
      "iso_639_1": "ko",
      "name": "한국어/조선말",
      "english_name": "Korean",
      "data": {
        "name": "겨울이 오고 있다",
        "overview": "블랙캐슬에서 세명의 나이트워치는 성벽밖으로 순찰한다. 그 나이트워치 중 한명이 야인들이 죽은 것을 보고, 블랙캐슬로 돌아가자고 하지만 죽은 야인들을 보지 못한 순찰대장은 이를 무시하는데..."
      }
    },
    {
      "iso_3166_1": "LB",
      "iso_639_1": "lb",
      "name": "",
      "english_name": "Letzeburgesch",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "LT",
      "iso_639_1": "lt",
      "name": "Lietuvių",
      "english_name": "Lithuanian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "LV",
      "iso_639_1": "lv",
      "name": "Latviešu",
      "english_name": "Latvian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "IN",
      "iso_639_1": "ml",
      "name": "",
      "english_name": "Malayalam",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "NL",
      "iso_639_1": "nl",
      "name": "Nederlands",
      "english_name": "Dutch",
      "data": {
        "name": "Winter Is Coming",
        "overview": "Er roert iets in het land waar de zomers decennia duren en de winters een leven lang kunnen aanslepen. Achter een eeuwenoude, gigantische muur van ijs in het uiterste noorden van Westeros maakt een kille vijand zich op om het land onder de voet te lopen. Robert Baratheon, de vorst van Westeros, strijkt met zijn hofhouding neer in Winterfell, bezuiden de Muur, om de hulp van zijn oude vriend Eddard Stark in te roepen. Terzelfdertijd, op een ander continent, gaan de laatste overlevenden van het vorige Targaryenregime op zoek naar een nieuwe alliantie. Ze willen hun rijk gewapenderhand heroveren op de \"usurpator\", Koning Robert..."
      }
    },
    {
      "iso_3166_1": "NO",
      "iso_639_1": "no",
      "name": "Norsk",
      "english_name": "Norwegian",
      "data": {
        "name": "Winter Is Coming",
        "overview": "En desertør fra Nattevakten blir funnet nær Vinterfall, og Lord Eddard \"Ned\" Stark må fullbyrde straffen. Neds hustru Catelyn forteller at hans mentor, Jon Arryn, har dødd i hovedstaden Kongshavn, og at kong Robert er på vei nordover for å tilby Ned stillingen som kongens hånd. Viserys Targaryen vil danne en allianse med de nomadiske Dothraki-krigerne ved å gi sin søster Daenerys til deres leder, khal Drogo. Robert ankommer med sin hustru, dronning Cersei, og andre fra Lannister-slekten: Hennes tvillingbror Jaime, dvergbroren Tyrion og hennes sønn og tronarving Joffrey. Ned kan ikke si nei til sin gamle venn kongen, og Jon Snø velger å verve seg i Nattevakten. Men en grufull handling mot unge Bran kan stanse alle planer."
      }
    },
    {
      "iso_3166_1": "PL",
      "iso_639_1": "pl",
      "name": "Polski",
      "english_name": "Polish",
      "data": {
        "name": "Nadchodzi zima",
        "overview": "Dezerter z Nocnej Straży, będący świadkiem niewytłumaczalnych zjawisk, zostaje pojmany tuż za murami Winterfell i poddany pod sąd Lorda Eddarda \"Neda\" Starka. Po powrocie do domu Ned dowiaduje się od żony Catelyn, że jego mentor, Jon Arryn, zmarł w Królewskiej Przystani w stolicy królestwa Westeros. W tym samym czasie na drugim krańcu Wąskiego Morza w Pentos, Viserys Targaryen knuje plan, by odzyskać utracony przez jego rodzinę tron przy wsparciu koczowniczych dotrackich wojowników. W imię sojuszu jest gotów zaoferować Khalowi Drogo, przywódcy plemienia, swoją piękną siostrę Daenerys. Król Robert wraz z żoną Cersei, przybywają do Winterfell. Towarzyszą im pozostali członkowie rodziny Lannisterów - brat bliźniak królowej Jaime, kolejny brat Tyrion oraz 12-letni Joffrey. Król Robert proponuje Nedowi objęcie stanowiska namiestnika. Ned nie umie odmówić władcy, który jest jego starym przyjacielem. Przyjmuje złożoną mu propozycję i szykuje się do wyjazdu do Królewskiej Przystani. Jon Snow, pozamałżeński syn Neda, opuszcza Winterfell, by dołączyć do Nocnej Straży. Towarzyszą mu Benjen Stark i Tyrion Lannister."
      }
    },
    {
      "iso_3166_1": "BR",
      "iso_639_1": "pt",
      "name": "Português",
      "english_name": "Portuguese",
      "data": {
        "name": "O Inverno Está Chegando",
        "overview": "O Lord Ned Stark preocupa-se com as notícias de um desertor da Guarda da Noite; o Rei Robert e os Lannisters chegam a Winterfell; o exilado Viserys Targaryen forja uma nova e poderosa aliança."
      }
    },
    {
      "iso_3166_1": "PT",
      "iso_639_1": "pt",
      "name": "Português",
      "english_name": "Portuguese",
      "data": {
        "name": "O Inverno Está a Chegar",
        "overview": "Os Stark de Winterfell recebem a visita da família real. O Rei Robert Baratheon faz a Eddard Stark, Lorde de Winterfell, uma oferta que ele não pode recusar. Do outro lado do oceano, o exilado Príncipe Viserys Targaryen cria uma aliança para reconquistar o Trono de Ferro; ele dará sua irmã, Daenerys, em casamento para o selvagem Khal Drogo em troca de seu exército. De volta a Winterfell, Catelyn Stark recebe uma pista que pode implicar membros família real em um assassinato, enquanto o jovem Bran Stark faz uma perigosa descoberta."
      }
    },
    {
      "iso_3166_1": "RO",
      "iso_639_1": "ro",
      "name": "Română",
      "english_name": "Romanian",
      "data": {
        "name": "Iarna se apropie",
        "overview": "În cele Șapte Regate de pe Westeros, un soldat al străvechiului Rond de Noapte supraviețuiește unui atac din partea unor creaturi supranaturale numite umblători albi, despre care se credea că sunt un mit. El gonește spre castelul Winterfell, condus de Eddard „Ned” Stark, Păzitorul Nordului, care îl decapitează pe soldat fiindcă a dezertat de la avanpostul său. În Debarcaderul Regelui, capitala Regatelor, Jon Arryn, „Mâna Regelui”, moare în circumstanțe dubioase. Regele Robert Baratheon, prieten de o viață cu Ned, merge la Winterfell, oferindu-i lui postul recent eliberat și propunându-i un mariaj între fiul lui cel mai mare, Joffrey, și fiica cea mare a lui Ned, Sansa. Nevasta lui Ned, Catelyn, primște o scrisoare de la sora ei, Lysa, văduva lui Jon Arryn, în care spunea că a fugit din Debarcaderul Regelui și că Jon ar fi fost ucis de către Lannisteri, familia Reginei Cersei. Catelyn dă foc scrisorii și îl anunță și pe Ned despre ea, crezând că familia Lannister complotează împotriva lui Robert. Brandon („Bran”), fiul de 10 ani al lui Ned, se cațără pe un turn; ajuns la fereastră, o surprinde pe Cersei făcând sex cu fratele ei, Jaime, care, mai apoi, îl împinge afară de la o înălțime probabil fatală. Între timp, dincolo de Marea Îngustă, pe Essos, prințul exilat Viserys Targaryen ajunge la o înțelegere cu Khal Drogo, conducătorul unei hoarde de dothraki; astfel, Drogo se căsătorește cu Daenerys, sora mai mică a lui Viserys, iar cel din urmă câștigă, în schimb, o armată cu care să cucerească Westeros și să recâștige Tronul de Fier."
      }
    },
    {
      "iso_3166_1": "RU",
      "iso_639_1": "ru",
      "name": "Pусский",
      "english_name": "Russian",
      "data": {
        "name": "Зима близко",
        "overview": "Отправленный на поиски одичалых отряд воинов сталкивается с куда более пугающим злом, чем племя диких людей. Винтерфелл. Лорд Эддард Старк узнает о поимке дезертира, утверждающего о возвращении белых ходоков, а дети лорда заводят домашних питомцев. Из Королевской гавани приходит известие о смерти советника короля, а также новость о намечающемся визите королевской семьи. Король Роберт Баратеон предлагает Старку не только новую должность, но и объединение семей. Пентос. Ради достижения власти Визерис Таргариен принуждает сестру Дейнерис заключить брачный союз с кхалом Дрого."
      }
    },
    {
      "iso_3166_1": "SK",
      "iso_639_1": "sk",
      "name": "Slovenčina",
      "english_name": "Slovak",
      "data": {
        "name": "Zima sa blíži",
        "overview": "Lord Eddard „Ned“ Stark z Winterfellu je navštívený kráľovskou rodinou. Jeho starý priateľ a kráľ Robert Baratheon mu dá ponuku, ktorú nemôže odmietnuť. Catelyn Stark, Nedova žena, dostane odkaz od svojej sestry Lysy, vďaka ktorému by mohla obviniť členov kráľovskej rodiny z vraždy. Nedov mladý syn Bran vykoná ohromujúci objav, vďaka ktorému bude bojovať o holý život. Cez Úzke more deportovaný princ Viserys Targaryen tvorí alianciu s vidinou zisku Železného trónu. Divokému vojakovi Drogovi dá za manželku svoju sestru Daenerys výmenou za jeho vojenskú podporu."
      }
    },
    {
      "iso_3166_1": "SI",
      "iso_639_1": "sl",
      "name": "Slovenščina",
      "english_name": "Slovenian",
      "data": {
        "name": "Winter Is Coming",
        "overview": "Dezerterja iz Night’s Watcha so izsledili blizu Winterfella. Lord Eddard \"Ned\" Stark je hitro poskrbel za pravico, pojavljajo pa se skrbi o nevarnostih severno od Zidu."
      }
    },
    {
      "iso_3166_1": "SO",
      "iso_639_1": "so",
      "name": "Somali",
      "english_name": "Somali",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "RS",
      "iso_639_1": "sr",
      "name": "Srpski",
      "english_name": "Serbian",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "SE",
      "iso_639_1": "sv",
      "name": "svenska",
      "english_name": "Swedish",
      "data": {
        "name": "Winter Is Coming",
        "overview": "Man hittar en desertör från Nattens Väktare utanför Winterfell, vilket leder till att lord Eddard \"Ned\" Stark skipar omedelbar rättvisa, men det ger också upphov till oro över farorna som lurar norr om muren. På andra sidan havet planerar Viserys Targaryen att ta tillbaka tronen genom att äkta sin vackra syster Daenerys med dothrakiernas ledare Khal Drogo. Kung Robert anländer till Winterfell med sin fru, drottning Cersei, och andra medlemmar av familjen Lannister. Ned tar jobbet som kungens hand och förbereder sig att lämna Winterfell, men ett dåd mot unga Bran kan fördröja avresan."
      }
    },
    {
      "iso_3166_1": "IN",
      "iso_639_1": "ta",
      "name": "தமிழ்",
      "english_name": "Tamil",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "TH",
      "iso_639_1": "th",
      "name": "ภาษาไทย",
      "english_name": "Thai",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "TR",
      "iso_639_1": "tr",
      "name": "Türkçe",
      "english_name": "Turkish",
      "data": {
        "name": "Kış Geliyor",
        "overview": "Duvarın ardında büyük gizemler yaşanıyor iken Kral Robert Baratheon,Winterfell’deki eski dostu Ned Stark’a önemli bir teklif yapmaya gelir."
      }
    },
    {
      "iso_3166_1": "TW",
      "iso_639_1": "tw",
      "name": "",
      "english_name": "Twi",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "UA",
      "iso_639_1": "uk",
      "name": "Український",
      "english_name": "Ukrainian",
      "data": {
        "name": "Зима близько",
        "overview": "Повертаючись зі страти дезертира з Нічної варти, який втік, за його словами, від Білих Ходоків, Нед Старк дізнається від дружини, що його наставник Джон Аррен мертвий, і король Роберт Баратеон їде в Вінтерфелл запропонувати йому посаду Десниці. Тим часом за Вузьким морем спадкоємець поваленого короля Вісерис Таргарієн готує весілля своєї сестри, віддаючи її заміж за Дрого — вождя войовничих дотракійців. Король приїжджає в Вінтерфелл разом зі своєю дружиною і спадкоємцем"
      }
    },
    {
      "iso_3166_1": "UZ",
      "iso_639_1": "uz",
      "name": "ozbek",
      "english_name": "Uzbek",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "VN",
      "iso_639_1": "vi",
      "name": "Tiếng Việt",
      "english_name": "Vietnamese",
      "data": {
        "name": "",
        "overview": ""
      }
    },
    {
      "iso_3166_1": "CN",
      "iso_639_1": "zh",
      "name": "普通话",
      "english_name": "Mandarin",
      "data": {
        "name": "凛冬将至",
        "overview": "一名守夜人军团的逃兵在临冬城外被抓获，领主艾德（奈德）·史塔克下令将其处斩。奈德对绝境长城之外的形势忧心忡忡。行刑结束后，奈德回到城中，他的夫人凯特琳带来一个令人震惊的消息：奈德的良师益友、现任首相琼恩·艾林在都城离奇死亡，罗伯特国王正启程赶往北方，希望奈德接替琼恩·艾林出任国王之手。"
      }
    },
    {
      "iso_3166_1": "HK",
      "iso_639_1": "zh",
      "name": "普通话",
      "english_name": "Mandarin",
      "data": {
        "name": "凜冬將至",
        "overview": "凜冬將至一名守夜人軍團的逃兵在臨冬城外被抓獲，領主艾德（奈德）·史塔克下令將其處斬。奈德對絕境長城之外的形勢憂心忡忡。行刑結束後，奈德回到城中，他的夫人凱特琳帶來一個令人震驚的消息：奈德的良師益友、現任首相瓊恩·艾林在都城離奇死亡，羅伯特國王正啟程趕往北方，希望奈德接替瓊恩·艾林出任國王之手。與此同時，在狹海對岸的潘托斯，韋賽里斯·坦格利安正計劃與多斯拉克遊牧民族的一位重要首領卓戈卡奧結盟，憑藉多斯拉克人的力量奪回本屬於他的鐵王座。他妹妹丹妮莉斯的終身幸福成了他手中最重要的籌碼。羅伯特國王帶着瑟曦·蘭尼斯特王后及蘭尼斯特家族的重要成員抵達臨冬城。他的隨行人員包括：王后的弟弟詹姆和提力昂，他們一個英俊瀟灑，一個卻是侏儒；12歲的喬佛里王子，王位的繼承人。奈德無法拒絕國王的盛情邀請，決定南下君臨城幫助國王穩定國內局勢。就在羅伯特和奈德動身之前，奈德的私生子瓊恩·雪諾決定北上黑城堡加盟守夜人軍團，對守夜人頗為好奇的提力昂打算和雪諾一同前往。厄運突然降臨到奈德的次子布蘭身上，奈德和瓊恩都被迫推遲了行程。"
      }
    },
    {
      "iso_3166_1": "TW",
      "iso_639_1": "zh",
      "name": "普通话",
      "english_name": "Mandarin",
      "data": {
        "name": "凜冬將至",
        "overview": ""
      }
    }
  ]
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `63056`)
- `translations` — array — 
  - `[]` — array items: — 
  - `iso_3166_1` — string —  (ตัวอย่าง: `"SA"`)
  - `iso_639_1` — string —  (ตัวอย่าง: `"ar"`)
  - `name` — string —  (ตัวอย่าง: `"العربية"`)
  - `english_name` — string —  (ตัวอย่าง: `"Arabic"`)
  - `data` — object — 
    - `name` — string —  (ตัวอย่าง: `""`)
    - `overview` — string —  (ตัวอย่าง: `"خلف باب واسع من الجليد في شمالي وستيروس هناك شيء يحدث. تتلقى عائلة ستارك التي من وينترفيل زيارة من العائلة المالكة، بينما يشكل أمير عائلة تارغارين المنفي تحالفاً جديداً للسيطرة على العرش من جديد."`)

---

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/videos`

> สรุป: Videos
> Get the videos that belong to a TV episode.

#### พารามิเตอร์

| ชื่อ | ตำแหน่ง | ชนิด | จำเป็น | คำอธิบาย |
|---|---|---|---|---|
| `series_id` | path | integer | ใช่ | - |
| `include_video_language` | query | string | ไม่ | filter the list results by language, supports more than one value by using a comma |
| `language` | query | string | ไม่ | - |
| `season_number` | path | integer | ใช่ | - |
| `episode_number` | path | integer | ใช่ | - |
#### Response 200

```json
{
  "id": 3624,
  "results": [
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones - Season 1 Recap - Official HBO UK",
      "key": "e0Y8KpQpW8c",
      "site": "YouTube",
      "size": 1080,
      "type": "Recap",
      "official": true,
      "published_at": "2015-05-19T16:31:23.000Z",
      "id": "5ce71a920e0a265ac0cfe497"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game of Thrones: Pledge Your Allegiance - House Stark (HBO)",
      "key": "9cqABojhqr4",
      "published_at": "2012-03-19T20:01:10.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534921db0e0a266b3f0013bb"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game of Thrones: Moments Tease - Daenerys Targaryen and Khal Drogo (HBO)",
      "key": "oEjgO10dzdQ",
      "published_at": "2011-04-18T20:12:25.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Teaser",
      "official": true,
      "id": "53492a180e0a266b3f001446"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Moments Tease - Ned and Catelyn Stark (HBO)",
      "key": "6t-Z4OxLCSY",
      "published_at": "2011-04-18T20:12:09.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Teaser",
      "official": true,
      "id": "5349239c0e0a266b470013c2"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Cersei Lannister (HBO)",
      "key": "H2QOBDGuesw",
      "published_at": "2011-03-29T14:45:07.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "5349289e0e0a266b430013ee"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game of Thrones: Character Feature - King Robert Baratheon (HBO)",
      "key": "WdGntO7vi0w",
      "published_at": "2011-03-29T14:43:46.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534931980e0a266b310014c3"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Ned Stark (HBO)",
      "key": "xkgNP60rPMs",
      "published_at": "2011-03-29T14:42:50.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534923550e0a266b3b00137e"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Daenerys Targaryen (HBO)",
      "key": "otmIEFQrCHA",
      "published_at": "2011-03-29T14:41:17.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "53492a7d0e0a266b47001440"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Viserys Targaryen (HBO)",
      "key": "pf0EDfgi2Uo",
      "published_at": "2011-03-18T23:28:51.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "53492aaa0e0a266b3b001417"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Bran Stark (HBO)",
      "key": "asJaqshya8s",
      "published_at": "2011-03-18T23:16:50.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "5349232b0e0a266b310013d3"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Arya Stark (HBO)",
      "key": "5FoXU1pNr7g",
      "published_at": "2011-03-18T23:07:22.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534923030e0a266b4300139d"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Robb Stark (HBO)",
      "key": "JLF5afwjvQQ",
      "published_at": "2011-03-18T23:02:22.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534922d30e0a266b4a0014ee"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game of Thrones: Character Feature - Catelyn Stark (HBO)",
      "key": "5H7Q3SZ2kec",
      "published_at": "2011-03-18T22:53:18.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534922b00e0a266b4a0014e9"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Jaime Lannister (HBO)",
      "key": "13agX-f4MrU",
      "published_at": "2011-03-18T22:30:20.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534928e90e0a266b430013f2"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones: Character Feature - Tyrion Lannister (HBO)",
      "key": "g7ZSQRDUroo",
      "published_at": "2011-03-18T22:28:01.000Z",
      "site": "YouTube",
      "size": 720,
      "type": "Featurette",
      "official": true,
      "id": "534929160e0a266b3b0013e6"
    },
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Game Of Thrones \"The Game Begins\" Preview (HBO)",
      "key": "BpJYNVhGf1s",
      "site": "YouTube",
      "size": 1080,
      "type": "Trailer",
      "official": true,
      "published_at": "2011-03-04T04:21:14.000Z",
      "id": "5c9b7e95c3a36841a341b9c6"
    }
  ]
}
```

#### Response Schema

- `id` — integer —  (ตัวอย่าง: `3624`)
- `results` — array — 
  - `[]` — array items: — 
  - `iso_639_1` — string —  (ตัวอย่าง: `"en"`)
  - `iso_3166_1` — string —  (ตัวอย่าง: `"US"`)
  - `name` — string —  (ตัวอย่าง: `"Game Of Thrones - Season 1 Recap - Official HBO UK"`)
  - `key` — string —  (ตัวอย่าง: `"e0Y8KpQpW8c"`)
  - `site` — string —  (ตัวอย่าง: `"YouTube"`)
  - `size` — integer —  (ตัวอย่าง: `1080`)
  - `type` — string —  (ตัวอย่าง: `"Recap"`)
  - `official` — boolean —  (ตัวอย่าง: `true`)
  - `published_at` — string —  (ตัวอย่าง: `"2015-05-19T16:31:23.000Z"`)
  - `id` — string —  (ตัวอย่าง: `"5ce71a920e0a265ac0cfe497"`)

---

