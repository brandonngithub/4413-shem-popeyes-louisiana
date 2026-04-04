from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:root@localhost:5432/ecoms"
    # Comma-separated browser origins (no trailing slash). Maps from CORS_ORIGIN on Render.
    CORS_ORIGIN: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
