import socket
import psycopg2

db_pass = "471817@Waseem"
host = "db.ykrjmctfmywhymgpkqlu.supabase.co"

try:
    print(f"Resolving {host}...")
    ip = socket.gethostbyname(host)
    print(f"Resolved IP: {ip}")
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password=db_pass,
        host=ip,
        port=5432,
        sslmode="require"
    )
    cur = conn.cursor()
    print("Connected to Supabase DB! Executing DDL & schema reload...")
    cur.execute("""
        ALTER TABLE public.customer_identities ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255);
        ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;
        NOTIFY pgrst, 'reload schema';
    """)
    conn.commit()
    print("SUCCESS: DDL applied and schema cache reloaded!")
    cur.close()
    conn.close()
except Exception as e:
    print("Python DB error:", e)
