"""
Получение и обновление профиля текущего пользователя по сессионному токену.
GET / — возвращает профиль и баланс.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p73680056_casino_site_creation")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_from_token(cur, token: str):
    cur.execute(
        f"""SELECT u.id, u.telegram_id, u.username, u.first_name, u.last_name,
                   u.photo_url, u.balance, u.is_new
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")
    if not token:
        return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Unauthorized"})}

    conn = get_conn()
    cur = conn.cursor()
    row = get_user_from_token(cur, token)

    if not row:
        cur.close()
        conn.close()
        return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Invalid or expired token"})}

    user_id, tg_id, username, first_name, last_name, photo_url, balance, is_new = row

    if is_new:
        cur.execute(f"UPDATE {SCHEMA}.users SET is_new=FALSE WHERE id=%s", (user_id,))
        conn.commit()

    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({
            "id": user_id,
            "telegram_id": tg_id,
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
            "photo_url": photo_url,
            "balance": float(balance),
            "is_new": is_new,
        })
    }
