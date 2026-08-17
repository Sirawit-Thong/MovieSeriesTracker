# TMDB API Documentation (GET Endpoints)

> เอกสารนี้สร้างอัตโนมัติจาก TMDB OpenAPI 3.1.0 spec
> สร้างเมื่อ: 2026-08-17

## Base URL

```
https://api.themoviedb.org/3
```

## การยืนยันตัวตน

ทุก Request ต้องใส่ Header:

```
Authorization: Bearer <YOUR_API_KEY>
```

---

## สารบัญ

| # | หมวดหมู่ | จำนวน Endpoint | ลิงก์ |
|---|---|---|---|
| 01 | Authentication (การยืนยันตัวตน) | 3 | [ดูเอกสาร](01-authentication/README.md) |
| 02 | Account (บัญชีผู้ใช้) | 9 | [ดูเอกสาร](02-account/README.md) |
| 03 | Guest Session (เซสชันผู้เยี่ยมชม) | 3 | [ดูเอกสาร](03-guest-session/README.md) |
| 04 | Certification (การจัดเรต) | 2 | [ดูเอกสาร](04-certification/README.md) |
| 05 | Movie (ภาพยนตร์) | 22 | [ดูเอกสาร](05-movie/README.md) |
| 06 | TV (รายการทีวี) | 44 | [ดูเอกสาร](06-tv/README.md) |
| 07 | Person (บุคคล) | 12 | [ดูเอกสาร](07-person/README.md) |
| 08 | Search (ค้นหา) | 7 | [ดูเอกสาร](08-search/README.md) |
| 09 | Discover (ค้นพบ) | 2 | [ดูเอกสาร](09-discover/README.md) |
| 10 | Trending (กระแสยอดนิยม) | 4 | [ดูเอกสาร](10-trending/README.md) |
| 11 | Collection (คอลเลกชัน) | 3 | [ดูเอกสาร](11-collection/README.md) |
| 12 | Company (บริษัท) | 3 | [ดูเอกสาร](12-company/README.md) |
| 13 | Network (เครือข่าย) | 3 | [ดูเอกสาร](13-network/README.md) |
| 14 | Genre (ประเภท) | 2 | [ดูเอกสาร](14-genre/README.md) |
| 15 | Keyword (คำค้นหา) | 2 | [ดูเอกสาร](15-keyword/README.md) |
| 16 | Review (รีวิว) | 1 | [ดูเอกสาร](16-review/README.md) |
| 17 | List (รายการ) | 2 | [ดูเอกสาร](17-list/README.md) |
| 18 | Credit (เครดิต) | 1 | [ดูเอกสาร](18-credit/README.md) |
| 19 | Find (ค้นหาด้วย ID ภายนอก) | 1 | [ดูเอกสาร](19-find/README.md) |
| 20 | Watch Providers (ผู้ให้บริการรับชม) | 3 | [ดูเอกสาร](20-watch-providers/README.md) |
| 21 | Configuration (การกำหนดค่า) | 6 | [ดูเอกสาร](21-configuration/README.md) |

---

## Quick Reference — รายการ GET Endpoint ทั้งหมด

### Authentication (การยืนยันตัวตน)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/authentication` | Validate Key |
| GET | `/3/authentication/guest_session/new` | Create Guest Session |
| GET | `/3/authentication/token/new` | Create Request Token |

### Account (บัญชีผู้ใช้)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/account/{account_id}` | Details |
| GET | `/3/account/{account_id}/favorite/movies` | Favorite Movies |
| GET | `/3/account/{account_id}/favorite/tv` | Favorite TV |
| GET | `/3/account/{account_id}/lists` | Lists |
| GET | `/3/account/{account_id}/rated/movies` | Rated Movies |
| GET | `/3/account/{account_id}/rated/tv` | Rated TV |
| GET | `/3/account/{account_id}/rated/tv/episodes` | Rated TV Episodes |
| GET | `/3/account/{account_id}/watchlist/movies` | Watchlist Movies |
| GET | `/3/account/{account_id}/watchlist/tv` | Watchlist TV |

### Guest Session (เซสชันผู้เยี่ยมชม)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/guest_session/{guest_session_id}/rated/movies` | Rated Movies |
| GET | `/3/guest_session/{guest_session_id}/rated/tv` | Rated TV |
| GET | `/3/guest_session/{guest_session_id}/rated/tv/episodes` | Rated TV Episodes |

### Certification (การจัดเรต)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/certification/movie/list` | Movie Certifications |
| GET | `/3/certification/tv/list` | TV Certifications |

### Movie (ภาพยนตร์)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/movie/changes` | Movie List |
| GET | `/3/movie/now_playing` | Now Playing |
| GET | `/3/movie/popular` | Popular |
| GET | `/3/movie/top_rated` | Top Rated |
| GET | `/3/movie/upcoming` | Upcoming |
| GET | `/3/movie/{movie_id}` | Details |
| GET | `/3/movie/{movie_id}/account_states` | Account States |
| GET | `/3/movie/{movie_id}/alternative_titles` | Alternative Titles |
| GET | `/3/movie/{movie_id}/changes` | Changes |
| GET | `/3/movie/{movie_id}/credits` | Credits |
| GET | `/3/movie/{movie_id}/external_ids` | External IDs |
| GET | `/3/movie/{movie_id}/images` | Images |
| GET | `/3/movie/{movie_id}/keywords` | Keywords |
| GET | `/3/movie/latest` | Latest |
| GET | `/3/movie/{movie_id}/lists` | Lists |
| GET | `/3/movie/{movie_id}/recommendations` | Recommendations |
| GET | `/3/movie/{movie_id}/release_dates` | Release Dates |
| GET | `/3/movie/{movie_id}/reviews` | Reviews |
| GET | `/3/movie/{movie_id}/similar` | Similar |
| GET | `/3/movie/{movie_id}/translations` | Translations |
| GET | `/3/movie/{movie_id}/videos` | Videos |
| GET | `/3/movie/{movie_id}/watch/providers` | Watch Providers |

### TV (รายการทีวี)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/tv/changes` | TV List |
| GET | `/3/tv/airing_today` | Airing Today |
| GET | `/3/tv/on_the_air` | On The Air |
| GET | `/3/tv/popular` | Popular |
| GET | `/3/tv/top_rated` | Top Rated |
| GET | `/3/tv/{series_id}` | Details |
| GET | `/3/tv/{series_id}/account_states` | Account States |
| GET | `/3/tv/{series_id}/aggregate_credits` | Aggregate Credits |
| GET | `/3/tv/{series_id}/alternative_titles` | Alternative Titles |
| GET | `/3/tv/{series_id}/changes` | Changes |
| GET | `/3/tv/{series_id}/content_ratings` | Content Ratings |
| GET | `/3/tv/{series_id}/credits` | Credits |
| GET | `/3/tv/{series_id}/external_ids` | External IDs |
| GET | `/3/tv/{series_id}/images` | Images |
| GET | `/3/tv/{series_id}/keywords` | Keywords |
| GET | `/3/tv/latest` | Latest |
| GET | `/3/tv/{series_id}/lists` | Lists |
| GET | `/3/tv/{series_id}/recommendations` | Recommendations |
| GET | `/3/tv/{series_id}/reviews` | Reviews |
| GET | `/3/tv/{series_id}/screened_theatrically` | Screened Theatrically |
| GET | `/3/tv/{series_id}/similar` | Similar |
| GET | `/3/tv/{series_id}/translations` | Translations |
| GET | `/3/tv/{series_id}/videos` | Videos |
| GET | `/3/tv/{series_id}/watch/providers` | Watch Providers |
| GET | `/3/tv/episode/{episode_id}/changes` | Changes |
| GET | `/3/tv/{series_id}/episode_groups` | Episode Groups |
| GET | `/3/tv/episode_group/{tv_episode_group_id}` | Details |
| GET | `/3/tv/{series_id}/season/{season_number}` | Details |
| GET | `/3/tv/{series_id}/season/{season_number}/account_states` | Account States |
| GET | `/3/tv/{series_id}/season/{season_number}/aggregate_credits` | Aggregate Credits |
| GET | `/3/tv/season/{season_id}/changes` | Changes |
| GET | `/3/tv/{series_id}/season/{season_number}/credits` | Credits |
| GET | `/3/tv/{series_id}/season/{season_number}/external_ids` | External IDs |
| GET | `/3/tv/{series_id}/season/{season_number}/images` | Images |
| GET | `/3/tv/{series_id}/season/{season_number}/translations` | Translations |
| GET | `/3/tv/{series_id}/season/{season_number}/videos` | Videos |
| GET | `/3/tv/{series_id}/season/{season_number}/watch/providers` | Watch Providers |
| GET | `/3/tv/{series_id}/season/{season_number}/episode/{episode_number}` | Details |
| GET | `/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/account_states` | Account States |
| GET | `/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/credits` | Credits |
| GET | `/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/external_ids` | External IDs |
| GET | `/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/images` | Images |
| GET | `/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/translations` | Translations |
| GET | `/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/videos` | Videos |

### Person (บุคคล)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/person/changes` | People List |
| GET | `/3/person/popular` | Popular |
| GET | `/3/person/{person_id}` | Details |
| GET | `/3/person/{person_id}/changes` | Changes |
| GET | `/3/person/{person_id}/combined_credits` | Combined Credits |
| GET | `/3/person/{person_id}/external_ids` | External IDs |
| GET | `/3/person/{person_id}/images` | Images |
| GET | `/3/person/latest` | Latest |
| GET | `/3/person/{person_id}/movie_credits` | Movie Credits |
| GET | `/3/person/{person_id}/tv_credits` | TV Credits |
| GET | `/3/person/{person_id}/tagged_images` | Tagged Images |
| GET | `/3/person/{person_id}/translations` | Translations |

### Search (ค้นหา)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/search/collection` | Collection |
| GET | `/3/search/company` | Company |
| GET | `/3/search/keyword` | Keyword |
| GET | `/3/search/movie` | Movie |
| GET | `/3/search/multi` | Multi |
| GET | `/3/search/person` | Person |
| GET | `/3/search/tv` | TV |

### Discover (ค้นพบ)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/discover/movie` | Movie |
| GET | `/3/discover/tv` | TV |

### Trending (กระแสยอดนิยม)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/trending/all/{time_window}` | All |
| GET | `/3/trending/movie/{time_window}` | Movies |
| GET | `/3/trending/person/{time_window}` | People |
| GET | `/3/trending/tv/{time_window}` | TV |

### Collection (คอลเลกชัน)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/collection/{collection_id}` | Details |
| GET | `/3/collection/{collection_id}/images` | Images |
| GET | `/3/collection/{collection_id}/translations` | Translations |

### Company (บริษัท)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/company/{company_id}` | Details |
| GET | `/3/company/{company_id}/alternative_names` | Alternative Names |
| GET | `/3/company/{company_id}/images` | Images |

### Network (เครือข่าย)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/network/{network_id}` | Details |
| GET | `/3/network/{network_id}/alternative_names` | Alternative Names |
| GET | `/3/network/{network_id}/images` | Images |

### Genre (ประเภท)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/genre/movie/list` | Movie List |
| GET | `/3/genre/tv/list` | TV List |

### Keyword (คำค้นหา)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/keyword/{keyword_id}` | Details |
| GET | `/3/keyword/{keyword_id}/movies` | Movies |

### Review (รีวิว)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/review/{review_id}` | Details |

### List (รายการ)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/list/{list_id}/item_status` | Check Item Status |
| GET | `/3/list/{list_id}` | Details |

### Credit (เครดิต)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/credit/{credit_id}` | Details |

### Find (ค้นหาด้วย ID ภายนอก)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/find/{external_id}` | Find By ID |

### Watch Providers (ผู้ให้บริการรับชม)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/watch/providers/regions` | Available Regions |
| GET | `/3/watch/providers/movie` | Movie Providers |
| GET | `/3/watch/providers/tv` | TV Providers |

### Configuration (การกำหนดค่า)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/3/configuration` | Details |
| GET | `/3/configuration/countries` | Countries |
| GET | `/3/configuration/jobs` | Jobs |
| GET | `/3/configuration/languages` | Languages |
| GET | `/3/configuration/primary_translations` | Primary Translations |
| GET | `/3/configuration/timezones` | Timezones |

