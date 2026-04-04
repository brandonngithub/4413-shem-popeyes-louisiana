from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://postgres:root@localhost:5432/ecoms"
    # Comma-separated browser origins (no trailing slash).
    CORS_ORIGIN: str = ""
    # Optional regex, e.g. https://.*\.vercel\.app — use when preview URLs change often.
    CORS_ORIGIN_REGEX: str = ""


settings = Settings()
