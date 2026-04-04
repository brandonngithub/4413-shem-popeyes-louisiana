from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:root@localhost:5432/ecoms"

    class Config:
        env_file = ".env"


settings = Settings()
