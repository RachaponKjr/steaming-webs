# คู่มือทำให้ Live Stream ใช้งานได้

## สิ่งที่ต้องทำบนเซิร์ฟเวอร์ (ทำครั้งเดียว)

### 1. ออก SSL ให้ `livekit.zimonds.com` ← **ตัวที่ทำให้ไลฟ์ไม่ขึ้นอยู่ตอนนี้**

ตอนนี้ `https://livekit.zimonds.com` ใช้ใบรับรองของ `zimonds.com` ซึ่งไม่ครอบคลุมซับโดเมนนี้
เบราว์เซอร์เลยตัดการเชื่อมต่อ `wss://` ทิ้งทั้งหมด → วิดีโอไม่มีทางขึ้น

เข้า Nginx Proxy Manager (`http://119.59.102.57:81`) → **Proxy Hosts** → `livekit.zimonds.com`

| Tab      | ตั้งค่า                                                       |
| -------- | ------------------------------------------------------------- |
| Details  | Forward Hostname `livekit-server`, Port `7880`, Scheme `http`  |
| Details  | **Websockets Support = เปิด** (สำคัญมาก)                       |
| SSL      | Request a new SSL Certificate (Let's Encrypt) → **Force SSL**  |

ตรวจว่าใช้ได้แล้วด้วย:

```bash
curl -sI https://livekit.zimonds.com/    # ต้องได้ 200 ไม่ใช่ SSL error
```

### 2. รีสตาร์ต LiveKit ทุกครั้งที่แก้ `livekit.yaml`

LiveKit อ่าน config แค่ตอนเริ่มทำงานเท่านั้น — เคยเจอปัญหาแก้ key ในไฟล์แล้วแต่
เซิร์ฟเวอร์ยังใช้ key เก่าอยู่ ทำให้ขึ้น `401 invalid API key`

```bash
docker compose up -d --force-recreate livekit
docker logs livekit-server --tail 20     # ต้องไม่มี ERROR
```

### 3. เปิดพอร์ตที่ไฟร์วอลล์

| พอร์ต       | ใช้ทำอะไร                        |
| ----------- | -------------------------------- |
| 443/tcp     | wss เข้า LiveKit ผ่าน NPM        |
| 7882/udp    | สื่อ WebRTC (เสียง/ภาพ)          |
| 7881/tcp    | สำรองเมื่อ UDP ถูกบล็อก          |

## วิธีใช้งาน

1. แอดมินล็อกอิน → `/dashboard` → สร้างห้องไลฟ์ของวันนี้ (1 ห้อง/วัน)
2. อนุญาตกล้อง+ไมค์ → ภาพขึ้นในกล่อง Live Monitor Preview
3. กดปุ่ม **เริ่มถ่ายทอดสด (GO LIVE)** → ผู้ชมที่ค้างหน้าเว็บอยู่จะถูกพาเข้าห้องอัตโนมัติภายใน 10 วินาที
4. กด **จบการถ่ายทอดสด (END)** เมื่อเลิกไลฟ์

## ตัวแปรแวดล้อมที่เกี่ยวข้อง

| ตัวแปร                    | ฝั่ง     | หมายเหตุ                                          |
| ------------------------- | -------- | ------------------------------------------------- |
| `LIVEKIT_API_KEY`         | backend  | ต้องตรงกับชื่อ key ใน `livekit.yaml`               |
| `LIVEKIT_API_SECRET`      | backend  | ต้องตรงกับค่าใน `livekit.yaml` (ยาว ≥ 32 ตัวอักษร) |
| `LIVEKIT_URL`             | backend  | URL ที่ backend ส่งกลับให้เบราว์เซอร์ใช้ต่อ         |
| `NEXT_PUBLIC_LIVEKIT_URL` | frontend | ใช้เป็นค่าสำรองเท่านั้น                            |

## ทดสอบว่า key ตรงกันหรือไม่

```bash
curl -s "https://api.zimonds.com/livekit/token?room=probe&username=probe"
```

เอา token ที่ได้ไปยิงต่อ:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://119.59.102.57:7880/rtc/v1/validate?access_token=<TOKEN>"
```

- `400` = key ถูกต้อง (แค่ขาด body — ปกติ)
- `401` = key ไม่ตรง → กลับไปทำข้อ 2
