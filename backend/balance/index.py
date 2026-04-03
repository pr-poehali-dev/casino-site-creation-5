"""
Управление балансом пользователя.
POST / с action=bet — списать ставку, action=win — зачислить выигрыш.
GET / — текущий баланс.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p73680056_casino_site_creation")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_from_token(cur, token: str):
    cur.execute(
        f"""SELECT u.id, u.balance
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
        return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "Invalid token"})}

    user_id, balance = row

    if event.get("httpMethod") == "GET":
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"balance": float(balance)})}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action")
    amount = float(body.get("amount", 0))

    if amount <= 0:
        cur.close()
        conn.close()
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Invalid amount"})}

    if action == "bet":
        if float(balance) < amount:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Insufficient funds"})}
        cur.execute(
            f"UPDATE {SCHEMA}.users SET balance = balance - %s, updated_at=NOW() WHERE id=%s RETURNING balance",
            (amount, user_id)
        )
    elif action == "win":
        cur.execute(
            f"UPDATE {SCHEMA}.users SET balance = balance + %s, updated_at=NOW() WHERE id=%s RETURNING balance",
            (amount, user_id)
        )
    else:
        cur.close()
        conn.close()
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Unknown action"})}

    new_balance = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": cors, "body": json.dumps({"balance": float(new_balance)})}
