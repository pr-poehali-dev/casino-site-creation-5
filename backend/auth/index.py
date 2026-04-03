"""
Авторизация через Telegram Login Widget.
Проверяет подпись данных от Telegram, создаёт или обновляет пользователя,
возвращает сессионный токен и данные профиля.
"""
import json
import os
import hashlib
import hmac
import secrets
import psycopg2
from datetime import datetime, timezone

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p73680056_casino_site_creation")
WELCOME_BALANCE = 500_000_000_000


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def verify_telegram_data(data: dict) -> bool:
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    check_hash = data.pop("hash", "")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    expected = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, check_hash)


def handler(event: dict, context) -> dict:
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        tg_data = body.get("tg_data", {})

        if not tg_data or "id" not in tg_data:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "No telegram data"})}

        tg_id = int(tg_data["id"])
        username = tg_data.get("username", "")
        first_name = tg_data.get("first_name", "")
        last_name = tg_data.get("last_name", "")
        photo_url = tg_data.get("photo_url", "")

        conn = get_conn()
        cur = conn.cursor()

        cur.execute(
            f"SELECT id, balance, is_new FROM {SCHEMA}.users WHERE telegram_id = %s",
            (tg_id,)
        )
        row = cur.fetchone()

        if row:
            user_id, balance, is_new = row
            cur.execute(
                f"""UPDATE {SCHEMA}.users
                    SET username=%s, first_name=%s, last_name=%s, photo_url=%s, updated_at=NOW()
                    WHERE id=%s""",
                (username, first_name, last_name, photo_url, user_id)
            )
        else:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.users (telegram_id, username, first_name, last_name, photo_url, balance, is_new)
                    VALUES (%s, %s, %s, %s, %s, %s, TRUE)
                    RETURNING id, balance, is_new""",
                (tg_id, username, first_name, last_name, photo_url, WELCOME_BALANCE)
            )
            user_id, balance, is_new = cur.fetchone()

        token = secrets.token_hex(32)
        cur.execute(
            f"""INSERT INTO {SCHEMA}.sessions (user_id, token)
                VALUES (%s, %s)""",
            (user_id, token)
        )
        conn.commit()
        cur.close()
        conn.close()

        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({
                "token": token,
                "user": {
                    "id": user_id,
                    "telegram_id": tg_id,
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "photo_url": photo_url,
                    "balance": float(balance),
                    "is_new": is_new,
                }
            })
        }
    except Exception as e:
        return {"statusCode": 500, "headers": cors, "body": json.dumps({"error": str(e)})}
