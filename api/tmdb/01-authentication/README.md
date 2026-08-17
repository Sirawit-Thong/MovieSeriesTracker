# Authentication API (การยืนยันตัวตน)

> Base: `https://api.themoviedb.org/3`
> Auth: Bearer token in Authorization header

---

### `GET /3/authentication`

> สรุป: Validate Key
> Test your API Key to see if it's valid.

#### พารามิเตอร์

_ไม่มีพารามิเตอร์เพิ่มเติม_

#### Response 200

```json
{
  "success": true,
  "status_code": 1,
  "status_message": "Success."
}
```

#### Response Schema

- `success` — boolean —  (ตัวอย่าง: `true`)
- `status_code` — integer —  (ตัวอย่าง: `1`)
- `status_message` — string —  (ตัวอย่าง: `"Success."`)

---

### `GET /3/authentication/guest_session/new`

> สรุป: Create Guest Session

#### พารามิเตอร์

_ไม่มีพารามิเตอร์เพิ่มเติม_

#### Response 200

```json
{
  "success": true,
  "guest_session_id": "1ce82ec1223641636ad4a60b07de3581",
  "expires_at": "2016-08-27 16:26:40 UTC"
}
```

#### Response Schema

- `success` — boolean —  (ตัวอย่าง: `true`)
- `guest_session_id` — string —  (ตัวอย่าง: `"1ce82ec1223641636ad4a60b07de3581"`)
- `expires_at` — string —  (ตัวอย่าง: `"2016-08-27 16:26:40 UTC"`)

---

### `GET /3/authentication/token/new`

> สรุป: Create Request Token

#### พารามิเตอร์

_ไม่มีพารามิเตอร์เพิ่มเติม_

#### Response 200

```json
{
  "success": true,
  "expires_at": "2016-08-26 17:04:39 UTC",
  "request_token": "ff5c7eeb5a8870efe3cd7fc5c282cffd26800ecd"
}
```

#### Response Schema

- `success` — boolean —  (ตัวอย่าง: `true`)
- `expires_at` — string —  (ตัวอย่าง: `"2016-08-26 17:04:39 UTC"`)
- `request_token` — string —  (ตัวอย่าง: `"ff5c7eeb5a8870efe3cd7fc5c282cffd26800ecd"`)

---

