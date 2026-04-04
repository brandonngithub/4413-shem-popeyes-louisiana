from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase: use "Session pooler" URI on Render (IPv4). Direct db.* host is often IPv6-only and fails with "Network is unreachable".
    DATABASE_URL: str = "postgresql://postgres:root@localhost:5432/ecoms"
    # Comma-separated browser origins (no trailing slash).
    CORS_ORIGIN: str = ""
    # If set, used as the only CORS origin regex (Starlette fullmatch on Origin).
    CORS_ORIGIN_REGEX: str = ""
    # When True and CORS_ORIGIN_REGEX is empty, allow any https://*.vercel.app (prod + previews).
    CORS_ALLOW_VERCEL_REGEX: bool = True


settings = Settings()
